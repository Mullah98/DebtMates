import type { Session } from '@supabase/supabase-js';
import DebtChart from './ui/DebtChart';
import DebtForm, { type Debt } from './ui/DebtForm';
import DebtTable from './ui/DebtTable';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { useEffect, useState } from 'react';

interface DashboardProps {
    session: Session | null;
    signOut: () => void;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
}

function Dashboard({ session, signOut }: DashboardProps) {
  const greeting: string = `Welcome back, ${session?.user?.user_metadata?.full_name?.split(" ")[0]}`
  const [allDebts, setAllDebts] = useState<Debt[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])

  const letterVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.08, duration: 0.3 },
    }),
  };
  
  const fetchAllUserDebts = async () => {
    const { data, error } = await supabase
    .from("debts")
    .select("*")
    .or(`lender_id.eq.${session?.user?.id}, borrower_id.eq.${session?.user?.id}`); // Checking for 2 conditions
  
    if (data && !error) {      
      setAllDebts(data)
    } else {
      console.error('Unable to fetch user debts', error)
    }
  }

  const fetchAllUsers = async () => {
    const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", session?.user?.id) // Id will not equal the current session user so it will only return the other user profiles

    if (data && !error) {
      setAllUsers(data)
    } else {
      console.error("unable to retrieve all user profiles", error)
    }
  }

  useEffect(() => {
    fetchAllUserDebts();
    fetchAllUsers();
  }, [session])

  
  return (
    <div>
      <div className="sticky top-0 p-6 flex items-center justify-between space-x-4 ">
        <h1 className='text-5xl font-bold text-gray-800 flex'>
        {greeting.split('').map((char, i) => (
          <motion.span
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={letterVariants}
          >
          {char === " " ? '\u00A0' : char}
          </motion.span>
        ))}
        </h1>
        <button onClick={signOut}>Sign out</button>
      </div>

      <div className='flex flex-col md:flex-row gap-6'>
        <DebtChart debts={allDebts} />
        <DebtForm session={session} onDebtAdded={fetchAllUserDebts} allUsers={allUsers} />
      </div>

      <div>
        <DebtTable allDebts={allDebts} onDebtAdded={fetchAllUserDebts}/>
      </div>

    </div>
  )
}

export default Dashboard

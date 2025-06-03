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

function Dashboard({ session, signOut }: DashboardProps) {
  const greeting: string = `Welcome ${session?.user?.user_metadata?.full_name.split(" ")[0]}`
  const [allDebts, setAllDebts] = useState<Debt[]>([])

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
    .eq("lender_id", session?.user.id)
  
    if (data && !error) {
      setAllDebts(data)
    } else {
      console.error('Unable to fetch user debts', error)
    }
  }

  useEffect(() => {
    fetchAllUserDebts() 
  }, [])
  
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
        <DebtChart />
        <DebtForm session={session} onDebtAdded={fetchAllUserDebts} />
      </div>

      <div>
        <DebtTable allDebts={allDebts}/>
      </div>
    </div>
  )
}

export default Dashboard

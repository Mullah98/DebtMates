import type { Session } from '@supabase/supabase-js';

interface DashboardProps {
    session: Session | null;
    signOut: () => void;
}

function Dashboard({ session, signOut }: DashboardProps) {
  return (
    <div className='border bg-red-400'>
      <div className="sticky top-0 p-6 flex items-center justify-start space-x-4 border bg-blue-200">
      <h1 className='text-4xl font-bold text-gray-800'>Welcome {session?.user?.user_metadata?.full_name.split(" ")[0]}</h1>
      <button onClick={signOut}>Sign out</button>
      </div>
      <div className='border bg-green-400'>
        Hello
      </div>
    </div>
  )
}

export default Dashboard

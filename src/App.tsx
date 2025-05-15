import { useEffect, useState } from 'react'
import './App.css'
import { Auth } from '@supabase/auth-ui-react';
import { supabase } from '../supabaseClient';
import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { Session } from '@supabase/supabase-js';


function App() {
  const [session, setSession] = useState<Session | null>(null); //session can either be a Supabase Session object(when logged in) or null (when logged out)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Failed to sign out", error)
    }
  }

  if (!session) {
    return (
      <>
        <Auth supabaseClient={supabase} providers={['google']} appearance={{ theme: ThemeSupa }} />
      </>
    )
  } else {
    return (
    <div>
      <h2>Welcome {session?.user?.user_metadata?.full_name}.</h2>
      <button onClick={signOut}>Sign out</button>
    </div>
  )
  }
}

export default App

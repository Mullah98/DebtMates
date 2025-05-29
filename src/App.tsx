import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';


function App() {
  const [session, setSession] = useState<Session | null>(null); //session can either be a Supabase Session object(when logged in) or null (when logged out)
  const [loading, setLoading] = useState(true)

  useEffect(() => {    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {  data: { subscription } } = supabase.auth.onAuthStateChange(async(_event, session) => {
      setSession(session)
      setLoading(false)

      if (session?.user) { // Checking if current user is in the profiles table
        const { data: existing_profile, error } = await supabase
        .from('profiles').select('id')
        .eq('id', session.user.id)
        .maybeSingle();

        if (!existing_profile && !error) { // If user does not exist, insert into table

          const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            first_name: session.user.user_metadata.full_name.split(' ')[0] || '',
            last_name: session.user.user_metadata.full_name.split(' ')[1] || '',
          })

          if (insertError) console.error('Unable to add profile to database', insertError);
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Failed to sign out", error)
  }

  if (loading) {
    return (
      <div>Signing you in...</div>
    )
  }

  return !session ? (
    <LoginPage />
  ) : (
    <Dashboard session={session} signOut={signOut} />
  )}


export default App

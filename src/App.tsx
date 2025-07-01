import { useEffect, useRef, useState } from 'react'
import './App.css'
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { generateToken, messaging } from './notifications/firebase';
import { onMessage } from 'firebase/messaging';

function App() {
  const [session, setSession] = useState<Session | null>(null); // Session can either be a Supabase Session object(when logged in) or null (when logged out)
  const [loading, setLoading] = useState(true)
  const isTokenGenerated = useRef(false);

  useEffect(() => {    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      if (!isTokenGenerated.current) {
        generateToken();
        onMessage(messaging, (payload) => {
          console.log(payload);
        })
        isTokenGenerated.current = true;
      }
    })

    const {  data: { subscription } } = supabase.auth.onAuthStateChange(async(_event, session) => {
      setSession(session)
      setLoading(false)

      if (session?.user) { // Checking if current user is in the profiles table
        const { data: existing_profile, error } = await supabase
        .from('profiles')
        .select('id')
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
    console.log('Clicked sign out')
    localStorage.clear()
    window.location.reload()
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

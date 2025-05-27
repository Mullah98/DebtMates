import { useEffect, useState } from 'react'
import './App.css'
// import { Auth } from '@supabase/auth-ui-react';
import { supabase } from '../supabaseClient';
// import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { Session } from '@supabase/supabase-js';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';


function App() {
  const [session, setSession] = useState<Session | null>(null); //session can either be a Supabase Session object(when logged in) or null (when logged out)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {

      if (session?.user) {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id);

          const existingProfile = profiles?.[0];

          if (!existingProfile && !error) {
            const fullName = session.user.user_metadata?.full_name || '';
            const [firstName, lastName] = fullName.split(' ');

            const { error: insertError } = await supabase.from('profiles').insert({
              id: session.user.id,
              first_name: firstName || '',
              last_name: lastName || '',
            });

            if (insertError) {
              console.error('Insert failed', insertError);
            }
          }
      }

      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);


  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Failed to sign out", error)
    }
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

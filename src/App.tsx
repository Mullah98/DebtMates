import { useEffect, useRef, useState } from 'react'
import './App.css'
import { supabase } from '../supabaseClient.ts';
import type { Session } from '@supabase/supabase-js';
import LoginPage from './components/LoginPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import { fetchToken, messaging } from '../firebase.ts';
import { onMessage } from 'firebase/messaging';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { Toaster } from 'sonner';
import useFcmToken from '../hooks/useFcmToken.tsx';

function App() {
  const [session, setSession] = useState<Session | null>(null); // Session can either be a Supabase Session object(when logged in) or null (when logged out)
  const [loading, setLoading] = useState(true)
  const isTokenGenerated = useRef(false);

  // const { token, notificationPermissionStatus } = useFcmToken();

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setLoading(false);

    if (session?.user && !isTokenGenerated.current) {
      fetchToken().then((token) => {
        if (token) {
          console.log("Token saved successfully!")
        }
      });
      messaging().then((msg) => {
        if (msg) {
          onMessage(msg, (payload) => {
            console.log("payload:", payload);
          });
        }
      });
      isTokenGenerated.current = true;
    }

    if (session?.user) {
      supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data: existing_profile, error }) => {
          if (!existing_profile && !error) {
            supabase.from('profiles').insert({
              id: session.user.id,
              first_name: session.user.user_metadata.full_name.split(' ')[0] || '',
              last_name: session.user.user_metadata.full_name.split(' ')[1] || '',
            }).then(({ error: insertError }) => {
              if (insertError) console.error('Unable to add profile', insertError);
            });
          }
        });
    }    
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => subscription.unsubscribe();
}, []);

  const signOut = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.log('no session')
    } else {
      await supabase.auth.signOut();
      setSession(null)
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
    <ErrorBoundary>
      <Toaster position='top-right'/>
    <Dashboard session={session} signOut={signOut}/>
    </ErrorBoundary>
  )}


export default App

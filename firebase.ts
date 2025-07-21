import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { supabase } from './supabaseClient';


const firebaseConfig = {
  apiKey: "AIzaSyDGPRu5_9rh6gv7A1ZF9L8U6lzBCv7ABm4",
  authDomain: "debtmates-4ef1a.firebaseapp.com",
  projectId: "debtmates-4ef1a",
  storageBucket: "debtmates-4ef1a.firebasestorage.app",
  messagingSenderId: "738839907787",
  appId: "1:738839907787:web:7fe3274563bcde4c2cfa4e",
  measurementId: "G-61LK41QBEX"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const fcm = await messaging();
    if (!fcm) return null;

    const token = await getToken(fcm, {
      vapidKey: import.meta.env.VITE_VAPID_KEY,
    });
    console.log('FCM token:', token);

    // Saving the token to supabase database

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (userId && token) {
      await supabase.from('profiles').update({ fcm_token: token }).eq('id', userId);
    }
    
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export { app, messaging }
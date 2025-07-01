import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";


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
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  console.log(permission);

  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY
    })
    console.log('FCM TOKEN:', token);
    return token;
  } else {
    console.error('Unable to get FCM Token')
  }

}
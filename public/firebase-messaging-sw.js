importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDGPRu5_9rh6gv7A1ZF9L8U6lzBCv7ABm4",
  authDomain: "debtmates-4ef1a.firebaseapp.com",
  projectId: "debtmates-4ef1a",
  storageBucket: "debtmates-4ef1a.firebasestorage.app",
  messagingSenderId: "738839907787",
  appId: "1:738839907787:web:7fe3274563bcde4c2cfa4e",
  measurementId: "G-61LK41QBEX"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const notificationTitle = payload.notification?.title || 'New notification'
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.image
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
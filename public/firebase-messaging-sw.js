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

  const link = payload.fcmOptions?.link || payload.data?.link;

  const notificationTitle = payload.notification?.title || 'New notification'
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.image,
    data: { url: link },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationClick", function(event) {
  event.notification.close();

  // Checking if the client is already opened. If it is, it focuses on the tab. If not, it opens a new tab with the URL passes in the notification payload.

  event.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    const url = payload.fcmOptions?.link || payload.data?.link || '/';

    for (const client of clientList) {
      if (client.url === url && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(url);
    }
  })
})
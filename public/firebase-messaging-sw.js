importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: self.__WB_MANIFEST ? '' : '',
  authDomain: self.location.hostname,
  projectId: 'ikebee-admin-panel-2026',
  messagingSenderId: '1057399843985',
  appId: '1:1057399843985:web:1896e6834a16d8f42a7fa5',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, image, click_action } = payload.data || {};
  self.registration.showNotification(title || 'IKEBEE', {
    body: body || '',
    icon: icon || '/logo.jpeg',
    image: image,
    data: { click_action },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.click_action || '/';
  event.waitUntil(clients.openWindow(url));
});

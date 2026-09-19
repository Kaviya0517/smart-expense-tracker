// Service Worker for Push Notifications
// File: frontend/public/sw.js

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle push notifications from server
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: '👀 View Details'
      },
      {
        action: 'dismiss',
        title: '✕ Dismiss'
      }
    ],
    requireInteraction: true,
    tag: data.tag || 'expense-notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ExpenseTrack', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/budget')
    );
  }
});
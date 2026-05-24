// Service Worker – Tagebuch PWA
const CACHE = 'tagebuch-v1';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// ─── SCHEDULED NOTIFICATION ───
let notifTimer = null;

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE') {
    if (notifTimer) clearTimeout(notifTimer);
    notifTimer = setTimeout(() => {
      showDailyNotif();
      // Reschedule for next day (24h)
      notifTimer = setInterval(showDailyNotif, 24 * 60 * 60 * 1000);
    }, e.data.delay);
  }
});

function showDailyNotif() {
  self.registration.showNotification('📖 Mein Tagebuch', {
    body: 'Wie war dein Tag? Schreib kurz auf, was dich bewegt hat.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'daily-reminder',
    renotify: true,
    actions: [
      { action: 'open', title: 'Eintrag schreiben' },
      { action: 'dismiss', title: 'Später' }
    ]
  });
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action !== 'dismiss') {
    e.waitUntil(clients.openWindow('/'));
  }
});

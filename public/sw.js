// MindMint Service Worker (Emergency Bypass)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
    event.waitUntil(self.registration.unregister().then(() => self.clients.claim()));
});
// No fetch listener = No interception

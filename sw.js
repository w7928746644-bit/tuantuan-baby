// 团团宝宝喂养记录 - Web Push Service Worker
// 负责接收云端 Web Push，并在 iPhone/浏览器后台直接显示到系统通知中心。
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {
    data = { title: '🍼 团团喂养提醒', body: event.data ? event.data.text() : '到喂奶时间啦！' };
  }
  const title = data.title || '🍼 团团喂养提醒';
  const options = {
    body: data.body || '到喂奶时间啦，请记录本次喂养。',
    tag: data.tag || 'tuantuan-feed-reminder',
    renotify: data.renotify !== false,
    icon: data.icon || undefined,
    badge: data.badge || undefined,
    data: { url: data.url || './' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url ? event.notification.data.url : './';
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of list) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client) await client.navigate(target);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});

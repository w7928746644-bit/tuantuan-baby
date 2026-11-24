// sw.js - 团团宝宝喂养记录 Service Worker (支持退后台/锁屏系统级通知推送)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 接收云端 Supabase Edge Function 发来的 Web Push 后台推送
self.addEventListener('push', (event) => {
  let payload = {
    title: '🍼 团团喂奶时间到啦！',
    body: '距离上次喂奶已达到设定间隔，记得给宝宝喂奶并打卡哦~',
    tag: 'tuantuan-feed-reminder',
    url: './'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    tag: payload.tag,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: { url: payload.url || './' },
    actions: [
      { action: 'open', title: '🍼 立即打卡' },
      { action: 'snooze', title: '⏰ 延后15分钟' }
    ]
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// 点击系统通知中心横幅或快捷按钮
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './';

  if (event.action === 'snooze') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: 'SNOOZE_REMINDER', minutes: 15 });
          return;
        }
        return self.clients.openWindow(targetUrl);
      })
    );
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

// 团团宝宝喂养记录 - iOS 后台与锁屏通知中心推送 Service Worker
const CACHE_NAME = 'tuantuan-feeding-v4';
let bgTimer = null;
let reminderConfig = {
  enabled: false,
  intervalMin: 180,
  lastFeedTs: null,
  snoozeUntilTs: null,
  lastNotifiedKey: null
};

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 接收主页面同步的最新喂养时间与提醒配置
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SYNC_REMINDER_CONFIG') {
    reminderConfig = {
      ...reminderConfig,
      ...data.payload
    };
    scheduleBackgroundCheck();
  } else if (data.type === 'TEST_PUSH_NOTIFICATION') {
    self.registration.showNotification(data.title || '🍼 团团喂养通知测试成功', {
      body: data.body || '锁屏与后台状态下也能将喂奶提醒推送到您的通知中心！',
      tag: 'tuantuan-feed-test',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: './' }
    });
  }
});

function formatDuration(ms) {
  const totalMins = Math.max(1, Math.floor(ms / 60000));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return hrs > 0 ? `${hrs}小时${mins}分` : `${mins}分钟`;
}

function checkAndTriggerInBackground() {
  if (!reminderConfig.enabled || !reminderConfig.lastFeedTs) return;

  const targetTs = (reminderConfig.snoozeUntilTs && reminderConfig.snoozeUntilTs > reminderConfig.lastFeedTs)
    ? reminderConfig.snoozeUntilTs
    : reminderConfig.lastFeedTs + reminderConfig.intervalMin * 60000;

  const now = Date.now();
  if (now >= targetTs) {
    const alarmKey = `${reminderConfig.lastFeedTs}_${targetTs}`;
    if (reminderConfig.lastNotifiedKey !== alarmKey) {
      reminderConfig.lastNotifiedKey = alarmKey;
      const elapsedStr = formatDuration(now - reminderConfig.lastFeedTs);
      self.registration.showNotification('🍼 团团喂奶时间到啦！', {
        body: `距离上次喂奶已过去 ${elapsedStr}，请准备给团团喂奶并打卡记录。`,
        tag: 'tuantuan-feed-reminder',
        renotify: true,
        requireInteraction: true,
        vibrate: [300, 150, 300],
        data: { url: './', alarmKey }
      });
    }
  }
}

function scheduleBackgroundCheck() {
  if (bgTimer) {
    clearInterval(bgTimer);
    bgTimer = null;
  }
  if (!reminderConfig.enabled || !reminderConfig.lastFeedTs) return;

  checkAndTriggerInBackground();
  // 在 Service Worker 存活期间高频检查
  bgTimer = setInterval(checkAndTriggerInBackground, 15000);
}

// 支持服务端 Web Push 推送（即使 App 完全划掉进程，只要推送服务触发即唤醒锁屏通知中心）
self.addEventListener('push', (event) => {
  let payload = {
    title: '🍼 团团喂奶时间到啦！',
    body: '已达到设定的喂养间隔时间，请及时给团团喂奶哦。'
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch (e) {
    if (event.data) payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: 'tuantuan-feed-reminder',
      renotify: true,
      requireInteraction: true,
      vibrate: [300, 150, 300],
      data: { url: './' }
    })
  );
});

// 支持 Periodic Background Sync 后台周期唤醒
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'tuantuan-feed-check') {
    event.waitUntil(Promise.resolve(checkAndTriggerInBackground()));
  }
});

// 点击锁屏或通知中心的横幅时，直接唤起或聚焦团团喂养主界面
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })
  );
});

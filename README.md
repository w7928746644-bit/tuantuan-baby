# 团团宝宝喂养记录 - 部署与后台推送指南

## 目录结构（直接上传到 GitHub 仓库根目录）
- `index.html`：主应用页面（含尿不湿记录、WHO 成长曲线、评分报告、科学指南及 Web Push 订阅）
- `sw.js`：Service Worker 后台推送服务脚本
- `manifest.json`：iPhone 主屏幕桌面 App 配置文件
- `supabase/setup_push.sql`：Supabase 后台推送调度建表 SQL
- `supabase/functions/send-feed-reminders/index.ts`：Supabase 云端定时推送函数

## 一、上传 GitHub 并自动发布
1. 将本压缩包内的所有文件解压后，直接推送到你的 GitHub 仓库根目录（Cloudflare Pages 会自动识别并构建更新）。

## 二、启用“退掉后台也能推送”所需配置（全部免费）
1. **生成一对 VAPID 密钥**（在电脑终端运行一次即可，无需注册账号）：
   `npx web-push generate-vapid-keys`
   会得到一串 `Public Key` 和一串 `Private Key`。
2. **Supabase 建表与云函数**：
   - 登录你的 **Supabase 控制台** $ightarrow$ 进入 **SQL Editor** $ightarrow$ 粘贴执行 `supabase/setup_push.sql`。
   - 进入 **Edge Functions** $ightarrow$ 新建函数 `send-feed-reminders`，粘贴 `supabase/functions/send-feed-reminders/index.ts` 的代码，并在 Secrets 中填入 `VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY`、`VAPID_SUBJECT`（填 `mailto:你的邮箱`）。
3. **免费定时触发器（每分钟检查到点提醒）**：
   - 注册免费定时监控工具 **cron-job.org**（无需绑卡）或使用 Supabase 自带的 `pg_cron`。
   - 新建每 1 分钟访问一次你的 Supabase Edge Function URL（带上 `Authorization: Bearer 你的SUPABASE_ANON_KEY`），到点就会自动给手机锁屏发推送。
4. **手机端激活**：
   - 用 iPhone Safari 打开网址 $ightarrow$ 添加到主屏幕 $ightarrow$ 从桌面图标打开 $ightarrow$ 进入「设置备份」粘贴你的 `VAPID Public Key` 并点击「激活」。

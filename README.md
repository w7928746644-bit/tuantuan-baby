# 团团宝宝喂养记录 GitHub 版

## 部署
1. GitHub 新建仓库并上传全部文件。
2. 编辑 `supabase.js`，填入 Supabase **anon/publishable key**。
3. Supabase Dashboard -> SQL Editor 执行 `supabase.sql`。
4. GitHub Settings -> Pages -> Deploy from branch -> main/root。
5. iPhone Safari 打开网址，可“添加到主屏幕”。

## 安全
不要把 `service_role` 或 `sb_secret_...` 放进前端/GitHub。你之前发出的 service_role 密钥建议立即撤销并重新生成。

## 已包含
母乳左右、奶粉 ml、小便、大便、换尿不湿、今日时间轴、7天统计、本机保存、备份恢复、深色模式、Supabase 登录和家庭代码同步、提醒设置。

## 📖 喂养参考
已加入新生儿母乳/奶粉、尿布、饥饿与饱腹信号，以及需要联系医生的提醒。参考 CDC 与 American Academy of Pediatrics / HealthyChildren 的公开资料，仅作一般参考。

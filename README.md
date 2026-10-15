# 减脂追踪 · fitness-tracker 🦞

Perkins 的减脂追踪 Web App —— **180cm · 105kg → 88kg**。

深色炫酷界面，四大模块：

- **📊 总览**：当前体重、目标进度、本周训练、今日安排
- **⚖️ 身体**：体重 / 体脂率 / 腰围 记录 + 趋势曲线 + 目标进度
- **🍽️ 饮食**：每日用餐记录 + 食堂菜谱上传
- **🏋️ 训练**：按日历计划打卡（**保留护膝要点**）+ 周循环视图

> 膝盖有旧伤，所有下肢训练强调 **护膝 / 轻重量 / 稳膝**，每天可加「居家护膝底座」。

---

## 技术栈

- **前端**：React 19 + TypeScript + Vite 8
- **图表**：Recharts
- **后端**：Supabase（数据库 + 存储）—— 可选，不配也能本地跑
- **部署**：GitHub Pages（GitHub Actions 自动）

**双模式设计**：不配 Supabase 时自动用浏览器 `localStorage`，配了就走云端。

---

## 本地运行

```bash
npm install
npm run dev        # 打开 http://localhost:5173/fitness-tracker/
```

生产构建预览：

```bash
npm run build
npm run preview
```

> 注意：`vite.config.ts` 里 `base` 默认是 `/fitness-tracker/`，
> 本地 dev 打开时 URL 也带这个前缀。想改直接改该文件，或用 `VITE_BASE=/ npm run dev`。

---

## 接入 Supabase（云端）

1. 到 [supabase.com](https://supabase.com) 新建一个项目（免费）。
2. **SQL Editor** 里粘贴运行 `supabase/schema.sql`（建表 + 存储桶 + 策略）。
3. **Project Settings → API** 复制 `Project URL` 和 `anon public key`。
4. 本地：复制 `.env.example` 为 `.env`，填入：

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

5. 重启 `npm run dev`，右上角徽章会变成「☁️ 云端已连接」。

> ⚠️ 当前 schema 的 RLS 策略是「个人自用全开放」。
> 若要公开或多用户，请改成按 `auth.uid()` 隔离，别直接把 `anon key` 当作安全边界。

---

## 部署到 GitHub Pages

```bash
# 1. 建仓库并推送
gh repo create fitness-tracker --public --source=. --push

# 2. 在仓库 Settings → Pages → Source 选 "GitHub Actions"

# 3.（可选）配置 Supabase 密钥，供构建时注入
gh secret set VITE_SUPABASE_URL   --body "https://xxxx.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY --body "xxxx"
```

推送到 `main` 后，Actions 会自动构建并部署。
访问地址：`https://<你的用户名>.github.io/fitness-tracker/`

---

## 目录结构

```
src/
  App.tsx                # 主框架 + 标签导航
  index.css              # 深色主题（CSS 变量）
  types.ts               # 数据模型
  lib/
    supabase.ts          # Supabase 客户端（可空）
    db.ts                # 数据层：本地 / 云端双后端
    training.ts          # 训练计划加载 + 按日推断
  pages/
    Dashboard.tsx        # 总览
    BodyTracking.tsx     # 身体指标
    Meals.tsx            # 用餐 + 食堂菜谱
    Training.tsx         # 训练打卡
data/
  training-plan.json     # 训练计划（从日历导出整理）
supabase/
  schema.sql             # 建表脚本
```

---

*Built with 🦞 by 鲲 (Clawdbot)*

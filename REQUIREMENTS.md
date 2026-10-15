# 需求说明 —— 减肥追踪 Web App (fitness-tracker)

## 用户
- Perkins，大连人，身高 180cm，当前体重 105kg，**目标体重 88kg**，正在减肥。喜欢足球。
- **膝盖有旧伤**，训练强调护膝、轻重量、稳膝（务必在训练模块体现）。

## 技术栈（已定）
- 前端：**React + Vite + TypeScript + TailwindCSS**
- 图表：**Recharts**
- 后端：**Supabase**（数据库 + 存储 + 认证，免费额度）
  - 用环境变量配置：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
  - 提供 `.env.example`
  - 提供 SQL 迁移脚本（建表）放在 `supabase/migrations/` 或 `supabase/schema.sql`
- 部署：**GitHub Pages**（用 GitHub Actions 自动部署）；提供部署说明
- 视觉：**深色炫酷**（暗色背景 + 霓虹/渐变点缀 + 玻璃拟态卡片），响应式（手机也能用）

## 功能模块
1. **身体跟踪 (Body Tracking)**
   - 记录指标：**体重(kg)**、**体脂率(%)**、**腰围(cm)**（主要指标），可扩展
   - 支持按日期记录，展示**趋势曲线**（Recharts）
   - **目标进度**：起始 105kg → 目标 88kg，显示进度条 / 剩余 / 已减
2. **每日用餐记录 (Meals)**
   - 手动记录每餐（早/午/晚/加餐），文字描述 + 可选图片
   - **食堂菜谱上传口子**：用户可上传每周食堂菜单（图片或表格），存到 Supabase Storage
   - 预留"根据菜单给建议"的位置（当前由 AI 助手手动产出建议，网站展示）
3. **训练计划 (Training)**
   - 页面展示当日/本周训练内容，可**勾选完成**
   - 数据源见 `data/training-plan.json`（从用户日历导出，保留护膝要点）
4. **目标 / 概览 (Dashboard)**
   - 汇总：当前体重、距目标差值、本周训练完成数、最近体重趋势

## 交付要求
- 完整可运行项目（`npm install && npm run dev` 可本地跑）
- README：安装 / 配置 Supabase / 本地运行 / 部署到 GitHub Pages 的完整步骤
- 代码整洁、组件化、有基本类型定义
- 中文界面（用户是中文用户）

## 注意
- 这是**新项目**，从零开始。
- 不要把任何密钥硬编码，用环境变量。
- 深色主题是硬要求，要"炫酷"，不要"朴素"。

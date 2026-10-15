-- 减脂追踪 App · Supabase 数据库结构
-- 在 Supabase 控制台 -> SQL Editor 里粘贴运行一次即可。

-- 身体指标
create table if not exists body_metrics (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  weight numeric not null,
  body_fat numeric,
  waist numeric,
  note text,
  created_at timestamptz default now()
);

-- 用餐记录
create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  type text not null check (type in ('breakfast','lunch','dinner','snack')),
  content text not null,
  calories int,
  note text,
  created_at timestamptz default now()
);

-- 食堂菜谱
create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  week_of date not null,
  file_name text,
  storage_path text,
  advice text,
  created_at timestamptz default now()
);

-- 训练完成记录
create table if not exists training_completions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  workout_key text not null,
  items jsonb not null default '[]',
  created_at timestamptz default now(),
  unique (date, workout_key)
);

-- ============ 行级安全 (RLS) ============
-- 个人自用：这里放开匿名访问，方便快速上手。
-- ⚠️ 若日后要公开或多用户，请改成按 auth.uid() 隔离。
alter table body_metrics enable row level security;
alter table meals enable row level security;
alter table meal_plans enable row level security;
alter table training_completions enable row level security;

create policy "public all body_metrics" on body_metrics for all using (true) with check (true);
create policy "public all meals" on meals for all using (true) with check (true);
create policy "public all meal_plans" on meal_plans for all using (true) with check (true);
create policy "public all training_completions" on training_completions for all using (true) with check (true);

-- ============ 存储桶 ============
-- 用于存放食堂菜谱文件
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "public read uploads" on storage.objects for select using (bucket_id = 'uploads');
create policy "public write uploads" on storage.objects for insert with check (bucket_id = 'uploads');
create policy "public update uploads" on storage.objects for update using (bucket_id = 'uploads');

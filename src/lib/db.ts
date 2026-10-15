import { getSupabase } from './supabase';
import type { BodyMetric, Meal, MealPlan, TrainingCompletion } from '../types';

/**
 * 数据层：统一封装「本地 localStorage」与「云端 Supabase」两种后端。
 * - 未配置 Supabase -> 全部走 localStorage
 * - 配置了 Supabase -> 走云端（失败时回退本地，避免白屏）
 *
 * 表结构见 supabase/schema.sql
 */

const LS_KEYS = {
  body: 'ft_body_metrics',
  meals: 'ft_meals',
  mealPlans: 'ft_meal_plans',
  training: 'ft_training_completions',
} as const;

function readLS<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLS<T>(key: string, rows: T[]): void {
  localStorage.setItem(key, JSON.stringify(rows));
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---------- 身体指标 ----------

export async function getBodyMetrics(): Promise<BodyMetric[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('body_metrics')
      .select('*')
      .order('date', { ascending: true });
    if (!error && data) return data as BodyMetric[];
    console.warn('Supabase 读取失败，回退本地', error);
  }
  return readLS<BodyMetric>(LS_KEYS.body).sort((a, b) => a.date.localeCompare(b.date));
}

export async function saveBodyMetric(m: Omit<BodyMetric, 'id'>): Promise<BodyMetric> {
  const row: BodyMetric = { ...m, id: uid() };
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('body_metrics').insert(m).select().single();
    if (!error && data) return data as BodyMetric;
    console.warn('Supabase 写入失败，回退本地', error);
  }
  const rows = readLS<BodyMetric>(LS_KEYS.body);
  rows.push(row);
  writeLS(LS_KEYS.body, rows);
  return row;
}

export async function deleteBodyMetric(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('body_metrics').delete().eq('id', id);
    if (!error) return;
  }
  writeLS(LS_KEYS.body, readLS<BodyMetric>(LS_KEYS.body).filter((r) => r.id !== id));
}

// ---------- 用餐 ----------

export async function getMeals(): Promise<Meal[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('meals').select('*').order('date', { ascending: false });
    if (!error && data) return data as Meal[];
  }
  return readLS<Meal>(LS_KEYS.meals).sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveMeal(m: Omit<Meal, 'id'>): Promise<Meal> {
  const row: Meal = { ...m, id: uid() };
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('meals').insert(m).select().single();
    if (!error && data) return data as Meal;
  }
  const rows = readLS<Meal>(LS_KEYS.meals);
  rows.push(row);
  writeLS(LS_KEYS.meals, rows);
  return row;
}

export async function deleteMeal(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('meals').delete().eq('id', id);
    if (!error) return;
  }
  writeLS(LS_KEYS.meals, readLS<Meal>(LS_KEYS.meals).filter((r) => r.id !== id));
}

// ---------- 食堂菜谱 ----------

export async function getMealPlans(): Promise<MealPlan[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('meal_plans')
      .select('*')
      .order('weekOf', { ascending: false });
    if (!error && data) return data as MealPlan[];
  }
  return readLS<MealPlan>(LS_KEYS.mealPlans);
}

export async function saveMealPlan(
  file: File,
  weekOf: string,
  advice?: string,
): Promise<MealPlan> {
  const sb = getSupabase();
  const row: MealPlan = {
    id: uid(),
    weekOf,
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
    advice,
  };

  if (sb) {
    const path = `meal-plans/${weekOf}/${Date.now()}-${file.name}`;
    const { error: upErr } = await sb.storage.from('uploads').upload(path, file, { upsert: true });
    if (!upErr) {
      const { data, error } = await sb
        .from('meal_plans')
        .insert({ weekOf, file_name: file.name, storage_path: path, advice })
        .select()
        .single();
      if (!error && data) return data as MealPlan;
    }
    console.warn('Supabase 菜谱上传失败，仅本地记录', upErr);
  }

  const rows = readLS<MealPlan>(LS_KEYS.mealPlans);
  rows.push(row);
  writeLS(LS_KEYS.mealPlans, rows);
  return row;
}

// ---------- 训练完成 ----------

export async function getTrainingCompletions(): Promise<TrainingCompletion[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('training_completions').select('*');
    if (!error && data) return data as TrainingCompletion[];
  }
  return readLS<TrainingCompletion>(LS_KEYS.training);
}

export async function toggleTrainingItem(
  date: string,
  workoutKey: string,
  item: string,
): Promise<void> {
  const all = await getTrainingCompletions();
  const existing = all.find((t) => t.date === date && t.workoutKey === workoutKey);
  const items = existing ? [...existing.items] : [];
  const idx = items.indexOf(item);
  if (idx >= 0) items.splice(idx, 1);
  else items.push(item);

  const sb = getSupabase();
  if (sb) {
    if (existing) {
      await sb
        .from('training_completions')
        .update({ items })
        .eq('id', existing.id);
    } else {
      await sb.from('training_completions').insert({ date, workout_key: workoutKey, items });
    }
    return;
  }

  const rows = readLS<TrainingCompletion>(LS_KEYS.training).filter(
    (t) => !(t.date === date && t.workoutKey === workoutKey),
  );
  rows.push({ id: existing?.id ?? uid(), date, workoutKey, items });
  writeLS(LS_KEYS.training, rows);
}

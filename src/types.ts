// 数据模型定义

export interface BodyMetric {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  bodyFat?: number; // %
  waist?: number; // cm
  note?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD
  type: MealType;
  content: string;
  calories?: number;
  note?: string;
}

export interface MealPlan {
  id: string;
  weekOf: string; // YYYY-MM-DD (那一周的周一)
  fileName: string;
  uploadedAt: string; // ISO
  advice?: string; // AI 或人工给的饮食建议
  storagePath?: string; // Supabase storage path
}

export interface TrainingCompletion {
  id: string;
  date: string; // YYYY-MM-DD
  workoutKey: string; // legs/cardio/push/pull/swim/rest
  items: string[]; // 已完成的项目文本
}

export interface Goal {
  startWeight: number;
  targetWeight: number;
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

import plan from '../../data/training-plan.json';

export interface WorkoutType {
  name: string;
  emoji: string;
  color: string;
  items: string[];
}

export interface TrainingPlan {
  meta: {
    owner: string;
    source: string;
    note: string;
    dailyKneeBase: string[];
  };
  workoutTypes: Record<string, WorkoutType>;
  weekPattern: string[];
  weekPatternNote: string;
}

export const trainingPlan = plan as unknown as TrainingPlan;

/** 按周循环推断某天的训练类型 */
export function workoutKeyForDate(date: Date): string {
  const day = date.getDay(); // 0=Sun .. 6=Sat
  // weekPattern: [legs, cardio, rest, push, legs, swim, pull] 对应 周一..周日
  const idx = (day + 6) % 7;
  return trainingPlan.weekPattern[idx] ?? 'rest';
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

import { useEffect, useState } from 'react';
import { getBodyMetrics, getMeals, getTrainingCompletions } from '../lib/db';
import { trainingPlan, workoutKeyForDate, todayISO } from '../lib/training';

const START_WEIGHT = 105;
const TARGET_WEIGHT = 88;

interface Props {
  onJump: (tab: 'dashboard' | 'body' | 'meals' | 'training') => void;
}

export default function Dashboard({ onJump }: Props) {
  const [weight, setWeight] = useState<number | null>(null);
  const [loggedToday, setLoggedToday] = useState(false);
  const [weekTraining, setWeekTraining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [metrics, meals, comps] = await Promise.all([
        getBodyMetrics(),
        getMeals(),
        getTrainingCompletions(),
      ]);
      if (metrics.length) setWeight(metrics[metrics.length - 1].weight);
      const today = todayISO();
      setLoggedToday(meals.some((m) => m.date === today));

      // 本周（近 7 天）完成的训练天数
      const recent = comps.filter((c) => {
        const d = new Date(c.date + 'T00:00:00').getTime();
        return Date.now() - d < 7 * 864e5 && c.items.length > 0;
      });
      setWeekTraining(recent.length);
      setLoading(false);
    })();
  }, []);

  const lost = weight ? START_WEIGHT - weight : 0;
  const progress = Math.max(0, Math.min(100, (lost / (START_WEIGHT - TARGET_WEIGHT)) * 100));
  const todayWorkout = trainingPlan.workoutTypes[workoutKeyForDate(new Date())];

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="grid grid-3">
        <div className="card stat">
          <span className="label">当前体重</span>
          <span className="value">
            {weight ?? '--'}
            <span className="unit">kg</span>
          </span>
          <span className={`delta ${lost > 0 ? 'good' : ''}`}>
            起点 105kg {weight ? `· 已减 ${lost.toFixed(1)}kg` : ''}
          </span>
        </div>
        <div className="card stat">
          <span className="label">目标进度</span>
          <span className="value">
            {progress.toFixed(0)}
            <span className="unit">%</span>
          </span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="card stat">
          <span className="label">近 7 天训练</span>
          <span className="value">
            {weekTraining}
            <span className="unit">天</span>
          </span>
          <span className="delta">{weekTraining >= 4 ? '🔥 很稳！' : '继续加油'}</span>
        </div>
      </div>

      <div className="card">
        <h2>🎯 今日安排</h2>
        <div className="workout-header">
          <span className="emoji">{todayWorkout.emoji}</span>
          <span className="name" style={{ color: todayWorkout.color }}>
            {todayWorkout.name}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {todayWorkout.items.map((i) => (
            <span className="pill" key={i}>
              {i}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => onJump('training')}>
            去打卡训练
          </button>
          <button className="btn ghost" onClick={() => onJump('body')}>
            记录体重
          </button>
          <button className="btn ghost" onClick={() => onJump('meals')}>
            {loggedToday ? '查看今日饮食' : '记录今日饮食'}
          </button>
        </div>
      </div>

      {loading && <div className="empty">加载中…</div>}

      <div className="card">
        <h2>💡 使用提示</h2>
        <p className="hint">
          · 「身体」页记录体重 / 体脂 / 腰围，自动出趋势曲线和目标进度。
          <br />· 「饮食」页记录每餐，并可上传每周食堂菜谱，我来给饮食建议。
          <br />· 「训练」页按日历计划打卡，勾选完成项；护膝要点已保留。
          <br />· 未连接云端时数据存在本设备浏览器；配置 Supabase 后自动上云。
        </p>
      </div>
    </div>
  );
}

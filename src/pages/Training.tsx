import { useEffect, useState } from 'react';
import { trainingPlan, workoutKeyForDate, todayISO } from '../lib/training';
import { getTrainingCompletions, toggleTrainingItem } from '../lib/db';
import type { TrainingCompletion } from '../types';

export default function Training() {
  const [date, setDate] = useState(todayISO());
  const [completions, setCompletions] = useState<TrainingCompletion[]>([]);

  async function load() {
    setCompletions(await getTrainingCompletions());
  }

  useEffect(() => {
    load();
  }, []);

  const wKey = workoutKeyForDate(new Date(date + 'T00:00:00'));
  const workout = trainingPlan.workoutTypes[wKey] ?? trainingPlan.workoutTypes.rest;
  const done =
    completions.find((c) => c.date === date && c.workoutKey === wKey)?.items ?? [];

  async function toggle(item: string) {
    await toggleTrainingItem(date, wKey, item);
    await load();
  }

  const doneCount = workout.items.filter((i) => done.includes(i)).length;
  const pct = Math.round((doneCount / workout.items.length) * 100);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2>🏋️ 今日训练</h2>
        <div className="form-row" style={{ marginBottom: 14 }}>
          <label className="field">
            日期
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <div className="field">
            完成度
            <div style={{ minWidth: 180 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>
                {doneCount}/{workout.items.length} · {pct}%
              </span>
              <div className="progress-track" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="workout-header">
          <span className="emoji">{workout.emoji}</span>
          <span className="name" style={{ color: workout.color }}>
            {workout.name}
          </span>
          <span className="pill">护膝重点</span>
        </div>

        {workout.items.map((item) => {
          const isDone = done.includes(item);
          return (
            <div
              key={item}
              className={`train-item ${isDone ? 'done' : ''}`}
              onClick={() => toggle(item)}
            >
              <span className="checkbox">{isDone ? '✓' : ''}</span>
              <span className="train-text">{item}</span>
            </div>
          );
        })}
      </div>

      {/* 居家护膝底座 */}
      <div className="card">
        <h2>🧘 居家护膝底座（建议每天）</h2>
        <p className="hint">{trainingPlan.meta.note}</p>
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {trainingPlan.meta.dailyKneeBase.map((k) => (
            <span className="pill" key={k}>
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* 周计划 */}
      <div className="card">
        <h2>📅 本周循环</h2>
        <p className="hint">{trainingPlan.weekPatternNote}</p>
        <div style={{ marginTop: 12 }}>
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((dayName, i) => {
            const key = trainingPlan.weekPattern[i];
            const w = trainingPlan.workoutTypes[key];
            return (
              <div className="row-item" key={dayName}>
                <div>
                  <strong>{dayName}</strong>
                  <span style={{ marginLeft: 12, color: w.color }}>
                    {w.emoji} {w.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

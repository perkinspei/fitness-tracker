import { useEffect, useState } from 'react';
import type { Meal, MealType, MealPlan } from '../types';
import { MEAL_TYPE_LABELS } from '../types';
import { getMeals, saveMeal, deleteMeal, getMealPlans, saveMealPlan } from '../lib/db';

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function Meals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<MealType>('breakfast');
  const [content, setContent] = useState('');
  const [weekOf, setWeekOf] = useState(new Date().toISOString().slice(0, 10));
  const [uploading, setUploading] = useState(false);

  async function load() {
    setMeals(await getMeals());
    setPlans(await getMealPlans());
  }

  useEffect(() => {
    load();
  }, []);

  async function addMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await saveMeal({ date, type, content: content.trim() });
    setContent('');
    await load();
  }

  async function uploadPlan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await saveMealPlan(file, weekOf);
    setUploading(false);
    e.target.value = '';
    await load();
  }

  // 按日期分组
  const grouped = meals.reduce<Record<string, Meal[]>>((acc, m) => {
    (acc[m.date] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* 记录用餐 */}
      <div className="card">
        <h2>🍽️ 记录用餐</h2>
        <form className="form-row" onSubmit={addMeal}>
          <label className="field">
            日期
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            餐次
            <select value={type} onChange={(e) => setType(e.target.value as MealType)}>
              {MEAL_ORDER.map((t) => (
                <option key={t} value={t}>
                  {MEAL_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="field" style={{ flex: 1, minWidth: 220 }}>
            吃了什么
            <input
              placeholder="例如：食堂 红烧肉 + 米饭 + 青菜"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </label>
          <button className="btn" type="submit">
            添加
          </button>
        </form>
      </div>

      {/* 食堂菜谱上传 */}
      <div className="card">
        <h2>📤 食堂菜谱上传</h2>
        <p className="hint">
          每周把食堂菜单（图片 / Excel / 表格）传上来。我会根据菜单帮你规划怎么吃、避开高油高糖。
          上传的记录会保存在下方列表里。
        </p>
        <div className="form-row" style={{ marginTop: 12 }}>
          <label className="field">
            所属周（选那天所在的日期即可）
            <input type="date" value={weekOf} onChange={(e) => setWeekOf(e.target.value)} />
          </label>
          <label className="field">
            选择文件
            <input type="file" accept="image/*,.xlsx,.xls,.csv,.pdf" onChange={uploadPlan} />
          </label>
          {uploading && <span className="hint">上传中…</span>}
        </div>

        {plans.length > 0 && (
          <div style={{ marginTop: 14 }}>
            {plans.map((p) => (
              <div className="row-item" key={p.id}>
                <div>
                  <strong>📄 {p.fileName}</strong>
                  <div className="meta">
                    周次：{p.weekOf} · 上传于 {p.uploadedAt.slice(0, 10)}
                  </div>
                  {p.advice && <div className="meta">💡 {p.advice}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 用餐历史 */}
      <div className="card">
        <h2>🗂️ 用餐记录</h2>
        {Object.keys(grouped).length === 0 ? (
          <div className="empty">还没有记录</div>
        ) : (
          Object.entries(grouped)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([d, items]) => (
              <div key={d} style={{ marginBottom: 16 }}>
                <div className="section-sub">{d}</div>
                {items
                  .sort((a, b) => MEAL_ORDER.indexOf(a.type) - MEAL_ORDER.indexOf(b.type))
                  .map((m) => (
                    <div className="row-item" key={m.id}>
                      <div>
                        <span className="pill">{MEAL_TYPE_LABELS[m.type]}</span>
                        <span style={{ marginLeft: 10 }}>{m.content}</span>
                      </div>
                      <button
                        className="btn danger"
                        onClick={() => deleteMeal(m.id).then(load)}
                      >
                        删除
                      </button>
                    </div>
                  ))}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

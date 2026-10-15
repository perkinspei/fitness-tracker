import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { BodyMetric } from '../types';
import { getBodyMetrics, saveBodyMetric, deleteBodyMetric } from '../lib/db';

const START_WEIGHT = 105;
const TARGET_WEIGHT = 88;

export default function BodyTracking() {
  const [rows, setRows] = useState<BodyMetric[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setRows(await getBodyMetrics());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight) return;
    await saveBodyMetric({
      date,
      weight: Number(weight),
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      waist: waist ? Number(waist) : undefined,
    });
    setWeight('');
    setBodyFat('');
    setWaist('');
    await load();
  }

  const latest = rows.length ? rows[rows.length - 1] : null;
  const lost = latest ? START_WEIGHT - latest.weight : 0;
  const remaining = latest ? latest.weight - TARGET_WEIGHT : START_WEIGHT - TARGET_WEIGHT;
  const progress = Math.max(0, Math.min(100, (lost / (START_WEIGHT - TARGET_WEIGHT)) * 100));

  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        date: r.date.slice(5),
        体重: r.weight,
        体脂率: r.bodyFat,
        腰围: r.waist,
      })),
    [rows],
  );

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* 概览 */}
      <div className="grid grid-3">
        <div className="card stat">
          <span className="label">当前体重</span>
          <span className="value">
            {latest ? latest.weight : '--'}
            <span className="unit">kg</span>
          </span>
          <span className={`delta ${lost > 0 ? 'good' : ''}`}>
            {latest ? `已减 ${lost.toFixed(1)} kg` : '还没有记录'}
          </span>
        </div>
        <div className="card stat">
          <span className="label">距目标 (88kg)</span>
          <span className="value">
            {latest ? remaining.toFixed(1) : '--'}
            <span className="unit">kg</span>
          </span>
          <span className="delta">目标 88kg</span>
        </div>
        <div className="card stat">
          <span className="label">完成进度</span>
          <span className="value">
            {progress.toFixed(0)}
            <span className="unit">%</span>
          </span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* 输入 */}
      <div className="card">
        <h2>➕ 记录今天的身体数据</h2>
        <form className="form-row" onSubmit={submit}>
          <label className="field">
            日期
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            体重 (kg)
            <input
              type="number"
              step="0.1"
              placeholder="105.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </label>
          <label className="field">
            体脂率 (%)
            <input
              type="number"
              step="0.1"
              placeholder="可选"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
            />
          </label>
          <label className="field">
            腰围 (cm)
            <input
              type="number"
              step="0.1"
              placeholder="可选"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
            />
          </label>
          <button className="btn" type="submit">
            保存
          </button>
        </form>
      </div>

      {/* 趋势图 */}
      <div className="card">
        <h2>📈 趋势</h2>
        {chartData.length < 2 ? (
          <div className="empty">至少记录两天后显示趋势曲线</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 6, right: 16, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,130,200,0.12)" />
              <XAxis dataKey="date" stroke="#6b7299" fontSize={12} />
              <YAxis stroke="#6b7299" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#141727',
                  border: '1px solid rgba(120,130,200,0.25)',
                  borderRadius: 12,
                  color: '#f2f4ff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="体重"
                stroke="#7c5cff"
                strokeWidth={3}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="体脂率"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="腰围"
                stroke="#f472b6"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 历史 */}
      <div className="card">
        <h2>🗂️ 历史记录</h2>
        {loading ? (
          <div className="empty">加载中…</div>
        ) : rows.length === 0 ? (
          <div className="empty">还没有记录，从上面开始吧</div>
        ) : (
          [...rows].reverse().map((r) => (
            <div className="row-item" key={r.id}>
              <div>
                <strong>{r.date}</strong>
                <div className="meta">
                  {r.weight} kg
                  {r.bodyFat ? ` · 体脂 ${r.bodyFat}%` : ''}
                  {r.waist ? ` · 腰围 ${r.waist}cm` : ''}
                </div>
              </div>
              <button className="btn danger" onClick={() => deleteBodyMetric(r.id).then(load)}>
                删除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

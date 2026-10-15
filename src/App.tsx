import { useState } from 'react';
import { isCloudEnabled } from './lib/supabase';
import Dashboard from './pages/Dashboard';
import BodyTracking from './pages/BodyTracking';
import Meals from './pages/Meals';
import Training from './pages/Training';

type Tab = 'dashboard' | 'body' | 'meals' | 'training';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: '总览', icon: '📊' },
  { key: 'body', label: '身体', icon: '⚖️' },
  { key: 'meals', label: '饮食', icon: '🍽️' },
  { key: 'training', label: '训练', icon: '🏋️' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <span className="logo">🦞</span>
          <div>
            <h1>减脂追踪 · Perkins</h1>
            <div className="sub">180cm · 105kg → 88kg</div>
          </div>
        </div>
        <span className={`cloud-badge ${isCloudEnabled ? 'on' : ''}`}>
          {isCloudEnabled ? '☁️ 云端已连接' : '💾 本地模式'}
        </span>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <Dashboard onJump={setTab} />}
      {tab === 'body' && <BodyTracking />}
      {tab === 'meals' && <Meals />}
      {tab === 'training' && <Training />}
    </div>
  );
}

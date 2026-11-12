import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import Dashboard from './components/Dashboard';
import SubmitPanel from './components/SubmitPanel';
import ReviewQueue from './components/ReviewQueue';
import AgentPanel from './components/AgentPanel';
import Ledger from './components/Ledger';
import RulesPanel from './components/RulesPanel';

export default function App() {
  const [tab, setTab] = useState('submit');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const refreshAll = useCallback(async () => {
    try {
      const [i, s, r] = await Promise.all([api('/items'), api('/stats'), api('/rules')]);
      setItems(i);
      setStats(s);
      setRules(r);
      setLoadError(null);
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncPayPal = useCallback(async () => {
    try {
      await api('/payouts/refresh', { method: 'POST' });
    } catch (e) {
      setLoadError(e.message);
    }
    await refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
  const agent = import.meta.env.VITE_AGENT_URL;
  if (agent) fetch(agent, { mode: 'no-cors' }).catch(() => {});
}, []);

  const queueCount = items.filter((i) => i.status === 'AWAITING_REVIEW').length;

  const tabs = [
    ['submit', 'New payout'],
    ['agent', 'AP agent'],
    ['queue', `Approval queue${queueCount ? ` (${queueCount})` : ''}`],
    ['ledger', 'Ledger'],
    ['rules', 'Spending rules'],
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-400 mb-2">
            PayAgent AI 🛡️
          </h1>
          <p className="text-slate-400 text-lg">
            A payment firewall for AI agents and businesses. Every payout is checked before money
            moves.
          </p>
        </header>

        {loading && (
          <p className="text-center text-slate-400 text-sm">
            Connecting to the server. It may take up to a minute to wake up.
          </p>
        )}

        {loadError && (
          <div className="bg-red-950/50 border border-red-800 text-red-200 p-4 rounded-xl text-sm break-words">
            {loadError}
          </div>
        )}

        <Dashboard stats={stats} />

        <nav className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-sm rounded-lg cursor-pointer ${
                tab === id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-indigo-500'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'submit' && <SubmitPanel onDone={refreshAll} />}
        {tab === 'agent' && <AgentPanel onDone={refreshAll} />}
        {tab === 'queue' && <ReviewQueue items={items} onChange={refreshAll} />}
        {tab === 'ledger' && <Ledger items={items} onSync={syncPayPal} />}
        {tab === 'rules' && <RulesPanel rules={rules} onSaved={refreshAll} />}

        <footer className="text-xs text-slate-600 text-center pt-4">
          Spring Boot, LangGraph, Groq, PostgreSQL, PayPal Payouts, AG Grid
        </footer>
      </div>
    </div>
  );
}
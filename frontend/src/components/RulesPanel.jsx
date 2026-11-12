import { useEffect, useState } from 'react';
import { api } from '../api';

export default function RulesPanel({ rules, onSaved }) {
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rules) {
      setForm({
        maxPerPayout: rules.maxPerPayout,
        monthlyBudget: rules.monthlyBudget,
        newRecipientLimit: rules.newRecipientLimit,
        blockedKeywords: rules.blockedKeywords || '',
      });
    }
  }, [rules]);

  if (!form) return <p className="text-slate-400">Loading rules...</p>;

  const inputClass =
    'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500';

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api('/rules', {
        method: 'PUT',
        body: JSON.stringify({
          maxPerPayout: Number(form.maxPerPayout),
          monthlyBudget: Number(form.monthlyBudget),
          newRecipientLimit: Number(form.newRecipientLimit),
          blockedKeywords: form.blockedKeywords,
        }),
      });
      await onSaved();
      setMsg('Saved. The agent applies these rules to the next request.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-indigo-300">Spending rules</h2>
      <p className="text-sm text-slate-400">
        These are hard guardrails. The AI can tighten a decision but can never override them.
      </p>

      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Max per payout ($). Above this goes to review.
        </label>
        <input type="number" step="0.01" value={form.maxPerPayout} onChange={set('maxPerPayout')} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Monthly budget ($). Going over goes to review.
        </label>
        <input type="number" step="0.01" value={form.monthlyBudget} onChange={set('monthlyBudget')} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">
          New-recipient limit ($). Larger first payments go to review.
        </label>
        <input type="number" step="0.01" value={form.newRecipientLimit} onChange={set('newRecipientLimit')} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Blocked keywords (comma separated). A match is rejected outright.
        </label>
        <input type="text" value={form.blockedKeywords} onChange={set('blockedKeywords')} className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
      >
        {saving ? 'Saving...' : 'Save rules'}
      </button>
      {msg && <p className="text-sm text-slate-300">{msg}</p>}
    </form>
  );
}
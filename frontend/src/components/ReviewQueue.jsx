import { useState } from 'react';
import { api } from '../api';
import { ItemCard } from './common';

export default function ReviewQueue({ items, onChange }) {
  const queue = items.filter((i) => i.status === 'AWAITING_REVIEW');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  async function act(id, action) {
    setBusy(id);
    setError(null);
    try {
      await api(`/items/${id}/${action}`, { method: 'POST' });
      await onChange();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-200 p-4 rounded-xl text-sm break-words">
          {error}
        </div>
      )}

      {queue.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500">
          Nothing waiting. Flagged payments will appear here for a human decision.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {queue.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            open
            actions={
              <div className="flex gap-3">
                <button
                  disabled={busy === item.id}
                  onClick={() => act(item.id, 'approve')}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {busy === item.id ? 'Working...' : 'Approve and pay'}
                </button>
                <button
                  disabled={busy === item.id}
                  onClick={() => act(item.id, 'reject')}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  Reject
                </button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
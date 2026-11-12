export const money = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const STATUS = {
  REJECTED: ['Rejected by AI', 'bg-red-500/20 text-red-300 border-red-500/30'],
  REVIEW_REJECTED: ['Rejected by reviewer', 'bg-red-500/20 text-red-300 border-red-500/30'],
  AWAITING_REVIEW: ['Needs review', 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'],
  PENDING: ['Sent to PayPal', 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'],
  SUCCESS: ['Paid', 'bg-green-500/20 text-green-400 border-green-500/30'],
  PAYMENT_FAILED: ['Payment failed', 'bg-orange-500/20 text-orange-300 border-orange-500/30'],
};

export function statusLabel(s) {
  return (STATUS[s] || [s || 'Unknown'])[0];
}

export function StatusBadge({ status }) {
  const [label, style] = STATUS[status] || [
    status || 'Unknown',
    'bg-slate-700 text-slate-300 border-slate-600',
  ];
  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${style}`}>
      {label}
    </span>
  );
}

export function RiskBar({ score }) {
  const v = Math.min(Math.max(Number(score) || 0, 0), 1);
  const color = v >= 0.8 ? 'bg-red-500' : v >= 0.4 ? 'bg-yellow-400' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-slate-400 w-16 shrink-0">Risk {v.toFixed(2)}</span>
      <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${v * 100}%` }} />
      </div>
    </div>
  );
}

const DOT = {
  pass: 'bg-green-500',
  flag: 'bg-yellow-400',
  fail: 'bg-red-500',
  skip: 'bg-slate-600',
};

export function Timeline({ steps }) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return <p className="text-sm text-slate-500">No reasoning steps recorded.</p>;
  }
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 text-sm">
          <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${DOT[s.status] || DOT.skip}`} />
          <div className="min-w-0">
            <p className="font-medium text-slate-200">{s.step}</p>
            <p className="text-slate-400 break-words">{s.result}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ItemCard({ item, actions, open = false }) {
  const count = Array.isArray(item.steps) ? item.steps.length : 0;
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-slate-100 break-words">
            {item.description || '(no description)'}
          </p>
          <p className="text-xs text-slate-400 break-all">
            {money(item.amount)} to {item.receiver}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <RiskBar score={item.riskScore} />
      {item.reason && <p className="text-sm text-slate-300">{item.reason}</p>}
      <details open={open}>
        <summary className="cursor-pointer text-sm text-indigo-300">
          Agent reasoning ({count} steps)
        </summary>
        <div className="mt-3">
          <Timeline steps={item.steps} />
        </div>
      </details>
      {actions}
    </div>
  );
}
import { money } from './common';

function Card({ label, value, sub, tone }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-2xl font-extrabold mt-1 ${tone}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

export default function Dashboard({ stats }) {
  if (!stats) return null;
  const budget = Number(stats.monthlyBudget) || 0;
  const spent = Number(stats.spentThisMonth) || 0;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card
          label="Blocked by PayAgent"
          value={money(stats.blockedAmount)}
          sub={`${stats.blockedCount} payments stopped`}
          tone="text-red-300"
        />
        <Card
          label="Paid out"
          value={money(stats.paidAmount)}
          sub={`${stats.paidCount} payments sent`}
          tone="text-green-400"
        />
        <Card
          label="Waiting for review"
          value={money(stats.reviewAmount)}
          sub={`${stats.reviewCount} in the queue`}
          tone="text-yellow-300"
        />
        <Card
          label="Injection attempts caught"
          value={stats.injectionsCaught}
          sub="hidden instructions blocked"
          tone="text-indigo-300"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Monthly budget used</span>
          <span>
            {money(spent)} of {money(budget)}
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-indigo-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </section>
  );
}
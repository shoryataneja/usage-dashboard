import RouteBadge from './RouteBadge';

const STATUS_COLORS = {
  pendingReview: 'var(--amber)',
  negotiation: 'var(--blue)',
  approved: 'var(--green)',
  rejected: 'var(--red)',
  purchased: 'var(--violet)',
};

export default function BranchCards({ branches, period }) {
  return (
    <section className="section">
      <RouteBadge
        method="GET"
        path="/analytics/operations → branches[]"
        powers="branch cards — server-side rollup of every member bucket in that branch"
      />
      <div className="branch-grid">
        {branches.map((branch) => {
          const bucket = branch.periods?.[period] ?? {};
          const total = bucket.total || 0;
          return (
            <div key={branch.id} className="branch-card">
              <div className="branch-card__head">
                <div>
                  <div className="branch-card__name">{branch.name}</div>
                  <div className="branch-card__th">TH: {branch.thName ?? '—'}</div>
                </div>
                <div className="branch-card__total">
                  <span className="branch-card__total-value">{total}</span>
                  <span className="branch-card__total-label">{period.toUpperCase()}</span>
                </div>
              </div>
              <div className="branch-card__bar">
                {Object.entries(STATUS_COLORS).map(([key, color]) => {
                  const n = bucket[key] ?? 0;
                  const w = total ? (n / total) * 100 : 0;
                  return w > 0 ? <span key={key} style={{ width: `${w}%`, background: color }} title={`${key}: ${n}`} /> : null;
                })}
              </div>
              <div className="branch-card__meta">{branch.membersCount} members</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

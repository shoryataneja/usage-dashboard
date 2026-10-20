import RouteBadge from './RouteBadge';

const STATUS_CARDS = [
  { key: 'total', label: 'Valuations Done' },
  { key: 'pendingReview', label: 'Pending Reviews' },
  { key: 'negotiation', label: 'Negotiations' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'purchased', label: 'Purchased' },
];

export default function KpiCards({ totals, period, avgTat }) {
  const bucket = totals?.[period] ?? {};
  const total = bucket.total || 0;
  const pct = (n) => (total ? ((n / total) * 100).toFixed(1) : '0.0');

  return (
    <section className="kpi-section">
      <RouteBadge
        method="GET"
        path="/analytics/operations → totals[]"
        powers={`KPI cards read totals.${period} of the same response the table uses`}
      />
      <div className="kpi-grid">
        {STATUS_CARDS.map(({ key, label }) => (
          <div key={key} className={`kpi-card ${key === 'total' ? 'kpi-card--primary' : ''}`}>
            <div className="kpi-card__label">{label}</div>
            <div className="kpi-card__value">{bucket[key] ?? 0}</div>
            {key !== 'total' && <div className="kpi-card__sub">{pct(bucket[key] ?? 0)}% of valuations</div>}
            {key === 'total' && <div className="kpi-card__sub">DRAFTs excluded</div>}
          </div>
        ))}
        <div className="kpi-card kpi-card--wide">
          <div className="kpi-card__label">AVG TAT</div>
          <div className="kpi-card__value">{avgTat != null ? `${avgTat}d` : '—'}</div>
          <div className="kpi-card__sub">submission → purchased/rejected (meta.avgTat)</div>
        </div>
      </div>
    </section>
  );
}

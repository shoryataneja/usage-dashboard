import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import RouteBadge from './RouteBadge';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'wtd', label: 'WTD' },
  { id: 'mtd', label: 'MTD' },
  { id: 'overall', label: 'Overall' },
];

const STATUS_KEYS = [
  { key: 'pendingReview', label: 'Pending Review', color: 'var(--amber)' },
  { key: 'negotiation', label: 'Negotiation', color: 'var(--blue)' },
  { key: 'approved', label: 'Approved', color: 'var(--green)' },
  { key: 'rejected', label: 'Rejected', color: 'var(--red)' },
  { key: 'purchased', label: 'Purchased', color: 'var(--violet)' },
];

export default function MemberDrawer({ member, onClose }) {
  // Loading is DERIVED: until a response tagged with this member's id arrives,
  // the drawer shows the loading state — no synchronous setState in the effect.
  const [queue, setQueue] = useState({ memberId: null, error: null, rows: null, elapsed: null });

  useEffect(() => {
    if (!member) return undefined;
    let cancelled = false;
    apiFetch('/evaluations/queue', { query: { poId: member.id, limit: 5 } })
      .then(({ data, elapsed }) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : (data?.items ?? data?.evaluations ?? []);
        setQueue({ memberId: member.id, error: null, rows, elapsed });
      })
      .catch((err) => {
        if (cancelled) return;
        setQueue({ memberId: member.id, error: err.message, rows: null, elapsed: null });
      });
    return () => {
      cancelled = true;
    };
  }, [member]);

  useEffect(() => {
    if (!member) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [member, onClose]);

  if (!member) return null;

  const queueLoading = queue.memberId !== member.id;
  const queueError = queueLoading ? null : queue.error;
  const queueRows = queueLoading ? null : queue.rows;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <header className="drawer__head">
          <div>
            <div className="drawer__name">{member.fullName}</div>
            <div className="drawer__meta">
              <span className={`role-badge role-badge--${member.role}`}>{member.role}</span>
              {member.branchName} ·{' '}
              {member.role === 'PO'
                ? `reports to ${member.tlName ?? 'TH directly'}`
                : member.role === 'TL'
                  ? `${member.thName ?? '—'}'s team lead`
                  : 'territory head'}
            </div>
          </div>
          <button className="btn btn--ghost" onClick={onClose}>
            ✕ Esc
          </button>
        </header>

        <div className="drawer__body">
          <RouteBadge
            method="GET"
            path="/analytics/operations → members[id]"
            powers="the four stat tiles + status split below (already in memory — no extra call)"
          />
          <div className="drawer__tiles">
            {PERIODS.map((p) => (
              <div key={p.id} className="drawer__tile">
                <div className="drawer__tile-label">{p.label}</div>
                <div className="drawer__tile-value">{member.periods?.[p.id]?.total ?? 0}</div>
              </div>
            ))}
            <div className="drawer__tile">
              <div className="drawer__tile-label">AVG TAT</div>
              <div className="drawer__tile-value">{member.avgTat != null ? `${member.avgTat}d` : '—'}</div>
            </div>
          </div>

          <h3 className="drawer__section-title">Status split (selected period in table = MTD below)</h3>
          <div className="drawer__split">
            {STATUS_KEYS.map(({ key, label, color }) => {
              const bucket = member.periods?.overall ?? {};
              const n = bucket[key] ?? 0;
              const w = bucket.total ? (n / bucket.total) * 100 : 0;
              return (
                <div key={key} className="drawer__split-row">
                  <span className="drawer__split-label">{label}</span>
                  <span className="drawer__split-bar">
                    <span style={{ width: `${w}%`, background: color }} />
                  </span>
                  <span className="drawer__split-value">{n}</span>
                </div>
              );
            })}
          </div>

          <h3 className="drawer__section-title">Recent valuations</h3>
          <RouteBadge
            method="GET"
            path={`/evaluations/queue?poId=${member.id.slice(0, 8)}…&limit=5`}
            powers="second network call fired when this drawer opened"
            compact
          />
          {queueLoading && <div className="alert">Loading recent valuations…</div>}
          {queueError && (
            <div className="alert alert--error">
              {queueError}
              <div className="alert__hint">
                This route requires the TL / TH / ADMIN role — log in as one of those to see the list.
              </div>
            </div>
          )}
          {queueRows && (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Reg No</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueRows.map((ev) => (
                      <tr key={ev.id}>
                        <td>{[ev.vehicle?.make, ev.vehicle?.model].filter(Boolean).join(' ') || '—'}</td>
                        <td><code>{ev.vehicle?.registrationNumber ?? '—'}</code></td>
                        <td>
                          <span className={`status-dot status-dot--${(ev.status ?? '').toLowerCase()}`}>{ev.status}</span>
                        </td>
                        <td>{ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                    {queueRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="table__empty">
                          No valuations found for this member.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="section__hint">Response time: {queue.elapsed}ms</p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

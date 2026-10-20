import { useMemo, useState } from 'react';
import RouteBadge from './RouteBadge';

const ROLE_CHIPS = [
  { id: 'all', label: 'All Tiers' },
  { id: 'TH', label: 'TH (L1)' },
  { id: 'TL', label: 'TL (L2)' },
  { id: 'PO', label: 'PO (L3)' },
];

const COLUMNS = [
  { key: 'today', label: "Today's" },
  { key: 'wtd', label: 'WTD' },
  { key: 'mtd', label: 'MTD' },
  { key: 'overall', label: 'Cumulative' },
];

export default function HierarchyTable({ members, onInspect }) {
  const [search, setSearch] = useState('');
  const [roleChip, setRoleChip] = useState('all');
  const [sort, setSort] = useState({ key: 'mtd', dir: 'desc' });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = members.filter((m) => {
      if (roleChip !== 'all' && m.role !== roleChip) return false;
      if (!q) return true;
      return (
        m.fullName.toLowerCase().includes(q) ||
        (m.branchName ?? '').toLowerCase().includes(q) ||
        (m.thName ?? '').toLowerCase().includes(q) ||
        (m.tlName ?? '').toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      let cmp;
      if (sort.key === 'name') cmp = a.fullName.localeCompare(b.fullName);
      else cmp = (a.periods?.[sort.key]?.total ?? 0) - (b.periods?.[sort.key]?.total ?? 0);
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [members, search, roleChip, sort]);

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }));
  }

  return (
    <section className="section">
      <RouteBadge
        method="GET"
        path="/analytics/operations → members[]"
        powers="hierarchy table — one row per TH/TL/PO with the same 4 buckets the KPI cards sum"
      />
      <div className="table-toolbar">
        <input
          className="field__input table-toolbar__search"
          placeholder="Search member / branch / TH / TL…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="table-toolbar__chips">
          {ROLE_CHIPS.map((chip) => (
            <button
              key={chip.id}
              className={`chip ${roleChip === chip.id ? 'chip--active' : ''}`}
              onClick={() => setRoleChip(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <span className="table-toolbar__count">{rows.length} members</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th className="table__sortable" onClick={() => toggleSort('name')}>
                Member {sort.key === 'name' ? (sort.dir === 'desc' ? '↓' : '↑') : ''}
              </th>
              <th>Role</th>
              <th>Branch</th>
              <th>Reports to</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="table__sortable table__num" onClick={() => toggleSort(col.key)}>
                  {col.label} {sort.key === col.key ? (sort.dir === 'desc' ? '↓' : '↑') : ''}
                </th>
              ))}
              <th>AVG TAT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m, i) => (
              <tr key={m.id} onClick={() => onInspect(m)} className="table__row">
                <td>{i + 1}</td>
                <td className="table__member">{m.fullName}</td>
                <td>
                  <span className={`role-badge role-badge--${m.role}`}>{m.role}</span>
                </td>
                <td>{m.branchName ?? '—'}</td>
                <td>{m.role === 'TL' ? `TH: ${m.thName ?? '—'}` : m.role === 'PO' ? `TL: ${m.tlName ?? 'Direct to TH'}` : '—'}</td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className="table__num">
                    {m.periods?.[col.key]?.total ?? 0}
                  </td>
                ))}
                <td className="table__num">{m.avgTat != null ? `${m.avgTat}d` : '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="table__empty">
                  No members match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="section__hint">Click any row to open the performance drawer (fetches GET /evaluations/queue?poId=…).</p>
    </section>
  );
}

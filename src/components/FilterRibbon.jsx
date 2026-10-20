import RouteBadge from './RouteBadge';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'wtd', label: 'WTD' },
  { id: 'mtd', label: 'MTD' },
  { id: 'overall', label: 'Overall' },
];

export default function FilterRibbon({ members, filters, onFilters, period, onPeriod }) {
  const ths = members.filter((m) => m.role === 'TH');
  const tls = members.filter((m) => m.role === 'TL' && (filters.thId === 'all' || m.thId === filters.thId));
  const branches = [
    ...new Map(
      members
        .filter((m) => m.branchId && (filters.thId === 'all' || m.thId === filters.thId))
        .map((m) => [m.branchId, { id: m.branchId, name: m.branchName }]),
    ).values(),
  ];

  const isFiltered = filters.thId !== 'all' || filters.tlId !== 'all' || filters.branchId !== 'all';

  function changeTH(value) {
    onFilters({ thId: value, tlId: 'all', branchId: 'all' });
  }
  function changeTL(value) {
    const tl = members.find((m) => m.id === value);
    onFilters(tl ? { thId: tl.thId ?? 'all', tlId: value, branchId: tl.branchId ?? 'all' } : { ...filters, tlId: value });
  }
  function changeBranch(value) {
    onFilters({ ...filters, branchId: value, tlId: 'all' });
  }

  return (
    <div className="filter-ribbon">
      <div className="filter-ribbon__left">
        <span className="filter-ribbon__title">Scope filters</span>
        <label className="field field--inline">
          <span className="field__label">Team Head</span>
          <select className="field__input" value={filters.thId} onChange={(e) => changeTH(e.target.value)}>
            <option value="all">All Team Heads</option>
            {ths.map((th) => (
              <option key={th.id} value={th.id}>
                {th.fullName}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--inline">
          <span className="field__label">Team Lead</span>
          <select className="field__input" value={filters.tlId} onChange={(e) => changeTL(e.target.value)}>
            <option value="all">All Team Leads</option>
            {tls.map((tl) => (
              <option key={tl.id} value={tl.id}>
                {tl.fullName}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--inline">
          <span className="field__label">Branch</span>
          <select className="field__input" value={filters.branchId} onChange={(e) => changeBranch(e.target.value)}>
            <option value="all">All Branches ({branches.length})</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        {isFiltered && (
          <button className="btn btn--ghost" onClick={() => onFilters({ thId: 'all', tlId: 'all', branchId: 'all' })}>
            Clear filters ✕
          </button>
        )}
      </div>

      <div className="filter-ribbon__right">
        <span className="period-switch">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              className={`period-switch__btn ${period === p.id ? 'period-switch__btn--active' : ''}`}
              onClick={() => onPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </span>
      </div>

      <div className="filter-ribbon__route">
        <RouteBadge
          method="GET"
          path="/analytics/operations?thId&tlId&branchId"
          powers="changing any filter above re-fires this route with the query params; the period switch is client-side (all 4 buckets arrive in one response)"
        />
      </div>
    </div>
  );
}

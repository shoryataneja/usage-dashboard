import { useEffect, useState } from 'react';
import { apiFetch, getToken, setToken } from './api/client';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import FilterRibbon from './components/FilterRibbon';
import KpiCards from './components/KpiCards';
import BranchCards from './components/BranchCards';
import HierarchyTable from './components/HierarchyTable';
import MemberDrawer from './components/MemberDrawer';
import RouteExplorer from './components/RouteExplorer';
import RouteBadge from './components/RouteBadge';

const EMPTY_FILTERS = { thId: 'all', tlId: 'all', branchId: 'all' };

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(getToken()));
  const [view, setView] = useState('dashboard');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [period, setPeriod] = useState('mtd');
  const [ops, setOps] = useState({ filterKey: null, data: null, error: null });
  const [lastFetch, setLastFetch] = useState(null);
  const [drawerMember, setDrawerMember] = useState(null);

  // ── Session restore: GET /auth/me with the stored token ──────────────────
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    apiFetch('/auth/me')
      .then(({ data }) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) setToken(null);
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Main dashboard fetch: GET /analytics/operations?thId&tlId&branchId ───
  // Loading is DERIVED from filterKey vs the active filters (no synchronous
  // setState in the effect — keeps react-hooks/set-state-in-effect happy).
  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    if (!user) return undefined;
    const key = filterKey;
    let cancelled = false;
    apiFetch('/analytics/operations', {
      query: {
        thId: filters.thId !== 'all' ? filters.thId : undefined,
        tlId: filters.tlId !== 'all' ? filters.tlId : undefined,
        branchId: filters.branchId !== 'all' ? filters.branchId : undefined,
      },
    })
      .then(({ data, status, elapsed }) => {
        if (cancelled) return;
        setOps({ filterKey: key, data, error: null });
        setLastFetch({ status, elapsed, at: Date.now() });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) {
          setToken(null);
          setUser(null);
        }
        setOps({ filterKey: key, data: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [user, filters, filterKey]);

  function handleLogout() {
    // Fire-and-forget: clears the server-side refresh token too.
    apiFetch('/auth/logout', { method: 'POST', body: { clearPushToken: false } }).catch(() => {});
    setToken(null);
    setUser(null);
    setOps({ filterKey: null, data: null, error: null });
  }

  if (booting) {
    return <div className="boot">Restoring session…</div>;
  }
  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  const activeOps = ops.filterKey === filterKey ? ops : null;
  const opsLoading = !activeOps;
  const opsError = activeOps?.error ?? null;
  const opsData = activeOps?.data ?? null;
  const members = opsData?.members ?? [];

  return (
    <div className="layout">
      <Sidebar user={user} view={view} onView={setView} onLogout={handleLogout} lastFetch={lastFetch} />

      <main className="main">
        {view === 'dashboard' && (
          <>
            <header className="main__header">
              <div>
                <h1 className="main__title">Executive Overview</h1>
                <p className="main__subtitle">
                  Live org-wide valuation analytics — each section is annotated with the route and
                  response field that feeds it.
                </p>
              </div>
              {opsData?.meta && (
                <div className="main__meta">
                  <RouteBadge
                    method="GET"
                    path="/analytics/operations → meta.generatedAt"
                    powers={`data generated ${new Date(opsData.meta.generatedAt).toLocaleString()}`}
                    compact
                  />
                </div>
              )}
            </header>

            <FilterRibbon
              members={members}
              filters={filters}
              onFilters={setFilters}
              period={period}
              onPeriod={setPeriod}
            />

            {opsLoading && <div className="alert">Loading /analytics/operations…</div>}
            {opsError && <div className="alert alert--error">{opsError}</div>}

            {opsData && (
              <>
                <KpiCards totals={opsData.totals} period={period} avgTat={opsData.meta?.avgTat} />
                <BranchCards branches={opsData.branches} period={period} />
                <HierarchyTable members={members} onInspect={setDrawerMember} />
              </>
            )}
          </>
        )}

        {view === 'explorer' && <RouteExplorer user={user} />}
      </main>

      <MemberDrawer member={drawerMember} onClose={() => setDrawerMember(null)} />
    </div>
  );
}

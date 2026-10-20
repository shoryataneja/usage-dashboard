import { ROUTES } from '../api/routes';

export default function Sidebar({ user, view, onView, onLogout, lastFetch }) {
  const operations = ROUTES.find((r) => r.id === 'operations');
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">CM</span>
        <div>
          <div className="sidebar__name">CarMetrik</div>
          <div className="sidebar__tag">Usage Dashboard</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        <button
          className={`sidebar__link ${view === 'dashboard' ? 'sidebar__link--active' : ''}`}
          onClick={() => onView('dashboard')}
        >
          Operations Dashboard
          <span className="sidebar__link-meta">{operations.path}</span>
        </button>
        <button
          className={`sidebar__link ${view === 'explorer' ? 'sidebar__link--active' : ''}`}
          onClick={() => onView('explorer')}
        >
          Route Explorer
          <span className="sidebar__link-meta">{ROUTES.filter((r) => r.explorer).length} routes</span>
        </button>
      </nav>

      <div className="sidebar__footer">
        {lastFetch && (
          <div className="sidebar__sync">
            Last fetch: {lastFetch.status} · {lastFetch.elapsed}ms
            <br />
            {new Date(lastFetch.at).toLocaleTimeString()}
          </div>
        )}
        <div className="sidebar__user">
          <span className="sidebar__avatar">{user?.fullName?.[0] ?? '?'}</span>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.fullName}</div>
            <div className="sidebar__user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn--ghost btn--block" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}

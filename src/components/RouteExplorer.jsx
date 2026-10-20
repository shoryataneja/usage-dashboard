import { useState } from 'react';
import { apiFetch, getBaseUrl } from '../api/client';
import { ROUTES } from '../api/routes';

function buildPath(route, params, user) {
  let path = route.path;
  if (route.dynamicPath) {
    path = path.replace('{organizationId}', params.organizationId || user?.organizationId || '{organizationId}');
  }
  return path;
}

function RouteCard({ route, user }) {
  const initialParams = Object.fromEntries(
    route.params.map((p) => [p, route.id === 'queue' && p === 'limit' ? '5' : '']),
  );
  const [params, setParams] = useState(initialParams);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const query = { ...params };
      if (route.dynamicPath) query.organizationId = undefined; // path segment, not query
      const path = buildPath(route, params, user);
      const res = await apiFetch(path, { method: route.method, query });
      setResult(res);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const resolvedPath = buildPath(route, params, user);

  return (
    <article className="route-card">
      <header className="route-card__head">
        <span className={`route-card__method route-card__method--${route.method}`}>{route.method}</span>
        <code className="route-card__path">
          {getBaseUrl().replace(/^https?:\/\/[^/]+/, '')}{resolvedPath}
        </code>
        {route.restrictedTo && <span className="route-card__roles">roles: {route.restrictedTo}</span>}
      </header>

      <h3 className="route-card__title">{route.title}</h3>
      <p className="route-card__purpose">{route.purpose}</p>
      <p className="route-card__powers">
        <strong>Powers:</strong> {route.powers}
      </p>

      {(route.params.length > 0 || route.dynamicPath) && (
        <div className="route-card__params">
          {route.dynamicPath && (
            <label className="field field--inline">
              <span className="field__label">organizationId (from session)</span>
              <input
                className="field__input"
                value={params.organizationId ?? user?.organizationId ?? ''}
                onChange={(e) => setParams((p) => ({ ...p, organizationId: e.target.value }))}
              />
            </label>
          )}
          {route.params.map((p) => (
            <label key={p} className="field field--inline">
              <span className="field__label">{p}</span>
              <input
                className="field__input"
                value={params[p]}
                placeholder={p === 'poId' ? 'member id (try one from the dashboard)' : ''}
                onChange={(e) => setParams((p2) => ({ ...p2, [p]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      )}

      <button className="btn btn--primary" onClick={run} disabled={busy}>
        {busy ? 'Running…' : 'Run route'}
      </button>

      {error && (
        <div className="alert alert--error">
          {error.status > 0 ? `${error.status} — ` : ''}
          {error.message}
        </div>
      )}

      {result && (
        <div className="route-card__result">
          <div className="route-card__result-meta">
            <span className="status-ok">{result.status} OK</span>
            <span>{result.elapsed}ms</span>
          </div>
          <pre className="route-card__json">{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
    </article>
  );
}

export default function RouteExplorer({ user }) {
  const routes = ROUTES.filter((r) => r.explorer);
  return (
    <div className="explorer">
      <header className="explorer__intro">
        <h2>Route Explorer</h2>
        <p>
          Every route the Usage Dashboard consumes, with its purpose and live output. The dashboard
          itself only calls <code>/analytics/operations</code> (+ <code>/evaluations/queue</code> in
          the drawer); the rest are here so you can compare what each endpoint returns.
        </p>
      </header>
      <div className="explorer__grid">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} user={user} />
        ))}
      </div>
    </div>
  );
}

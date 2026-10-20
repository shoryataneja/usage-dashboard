/**
 * Single source of truth for every backend route this dashboard consumes.
 * Drives the route badges on the dashboard AND the live Route Explorer page.
 *
 * `powers` describes exactly which UI section renders the response, so the
 * mapping "route → purpose → screen" is readable in one place.
 */
export const ROUTES = [
  {
    id: 'login',
    method: 'POST',
    path: '/auth/login',
    title: 'Login',
    purpose:
      'Exchanges mobile number + password for a JWT access token and the user profile. The token is stored in localStorage and sent as a Bearer header on every later call.',
    powers: 'Login screen → opens the dashboard',
    params: [],
    bodySample: { mobileNumber: '9663456013', password: '••••••' },
    explorer: true,
  },
  {
    id: 'me',
    method: 'GET',
    path: '/auth/me',
    title: 'Current user profile',
    purpose:
      'Returns the full DB profile for the logged-in token (name, role, organizationId, branch). Used on page reload to restore the session without re-typing credentials.',
    powers: 'App boot (session restore) + user chip in the sidebar',
    params: [],
    explorer: true,
  },
  {
    id: 'operations',
    method: 'GET',
    path: '/analytics/operations',
    title: 'Operations dashboard',
    purpose:
      'The main route. Returns every active TH/TL/PO with today / WTD / MTD / overall valuation buckets and a per-status split, plus branch rollups and grand totals. DRAFT evaluations are excluded. Filtering by ?thId / ?tlId / ?branchId is applied server-side.',
    powers:
      'Filter ribbon (refetch on change), KPI cards ← totals[], branch cards ← branches[], hierarchy table + drawer stats ← members[]',
    params: ['thId', 'tlId', 'branchId'],
    explorer: true,
  },
  {
    id: 'queue',
    method: 'GET',
    path: '/evaluations/queue',
    title: 'Team valuation queue',
    purpose:
      'Team/branch-scoped list of valuations with status, date-range and search filters. The drawer calls it with ?poId=<member> to show that member\'s most recent valuations.',
    powers: 'Member drawer → "Recent valuations" table',
    params: ['poId', 'status', 'search', 'from', 'to', 'page', 'limit'],
    restrictedTo: 'TL / TH / ADMIN',
    explorer: true,
  },
  {
    id: 'home',
    method: 'GET',
    path: '/home',
    title: 'Role-aware home dashboard',
    purpose:
      'The mobile/web home screen feed. For a PO it returns own summary + recents; for TL/TH/ADMIN it aggregates the caller\'s whole team (valuationsDone, avgTat, poPipeline, teamBreakdown). Compare it with /analytics/operations: /home is "my team only", /operations is "any team via filters".',
    powers: 'Route Explorer demo only',
    params: ['branchId', 'from', 'to'],
    explorer: true,
  },
  {
    id: 'analytics',
    method: 'GET',
    path: '/analytics',
    title: 'Valuation analytics (funnel & distributions)',
    purpose:
      'Market-style analytics for the caller\'s scope: status funnel with percentages, avg RF cost, make/fuel/body-type distributions, PO leaderboard and top price gaps. Single arbitrary from/to window — unlike /operations which always returns the 4 fixed periods.',
    powers: 'Route Explorer demo only',
    params: ['branchId', 'from', 'to'],
    restrictedTo: 'TL / TH / ADMIN',
    explorer: true,
  },
  {
    id: 'users',
    method: 'GET',
    path: '/users',
    title: 'Staff directory',
    purpose:
      'Paginated user list filtered by ?role / ?branchId / ?status. This is where the TH/TL/PO dropdowns would come from in a production app; the dashboard reuses members[] from /analytics/operations instead to save a round-trip.',
    powers: 'Route Explorer demo only',
    params: ['role', 'branchId', 'status', 'page', 'limit'],
    restrictedTo: 'ADMIN / TH / TL',
    explorer: true,
  },
  {
    id: 'branches',
    method: 'GET',
    path: '/organizations/{organizationId}/branches',
    title: 'Branch master list',
    purpose:
      'Lists the branches of an organization (organizationId is taken from your session automatically). The dashboard uses branches[] from /analytics/operations, which arrives pre-rolled-up with valuation counts.',
    powers: 'Route Explorer demo only',
    params: ['page', 'limit'],
    dynamicPath: true,
    restrictedTo: 'ADMIN / TH / TL',
    explorer: true,
  },
];

export const ROUTE_BY_ID = Object.fromEntries(ROUTES.map((r) => [r.id, r]));

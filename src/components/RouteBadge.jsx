export default function RouteBadge({ method = 'GET', path, powers, compact = false }) {
  return (
    <span className={`route-badge ${compact ? 'route-badge--compact' : ''}`} title={powers}>
      <span className="route-badge__method">{method}</span>
      <code className="route-badge__path">{path}</code>
      {powers && !compact && <span className="route-badge__powers">→ {powers}</span>}
    </span>
  );
}

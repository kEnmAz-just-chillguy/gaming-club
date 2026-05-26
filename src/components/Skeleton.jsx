/**
 * Reusable skeleton loading primitives.
 * All shapes use the shared `.skeleton` CSS class for the shimmer animation.
 */

/** Single skeleton bar — use for text lines */
export function SkeletonLine({ width = '100%', height = 14, radius = 6, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

/** Skeleton block — use for cards / images / icon squares */
export function SkeletonBlock({ width = '100%', height = 80, radius = 12, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

/** Skeleton circle — use for avatars / icon circles */
export function SkeletonCircle({ size = 40 }) {
  return (
    <div
      className="skeleton"
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }}
    />
  );
}

/** 4-column stat card skeleton row */
export function SkeletonStatRow({ cols = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, marginBottom: 28 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="stat-card" style={{ padding: '18px 20px', gap: 12 }}>
          <SkeletonCircle size={44} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonLine width="60%" height={11} />
            <SkeletonLine width="80%" height={22} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Room card skeleton */
export function SkeletonRoomCard() {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonLine width={80} height={20} />
          <SkeletonLine width={100} height={12} />
        </div>
        <SkeletonLine width={70} height={22} radius={999} />
      </div>
      <SkeletonLine width="100%" height={1} radius={0} style={{ opacity: 0.5 }} />
      <SkeletonLine width="70%" height={13} />
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <SkeletonLine width={80} height={12} />
      </div>
    </div>
  );
}

/** Room card grid skeleton — renders N placeholder cards */
export function SkeletonRoomGrid({ count = 8 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRoomCard key={i} />
      ))}
    </div>
  );
}

/** Session list row skeleton */
export function SkeletonSessionRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
      <SkeletonBlock width={40} height={40} radius={11} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonLine width="50%" height={13} />
        <SkeletonLine width="75%" height={11} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <SkeletonLine width={70} height={16} />
        <SkeletonLine width={50} height={10} />
      </div>
      <SkeletonLine width={42} height={11} />
    </div>
  );
}

/** Last-7-sessions panel skeleton (small rows) */
export function SkeletonSmallSessionRow() {
  return (
    <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SkeletonCircle size={7} />
          <SkeletonLine width={60} height={12} />
          <SkeletonLine width={50} height={16} radius={999} />
        </div>
        <SkeletonLine width="65%" height={10} />
        <SkeletonLine width="50%" height={10} />
      </div>
      <SkeletonLine width={70} height={14} />
    </div>
  );
}

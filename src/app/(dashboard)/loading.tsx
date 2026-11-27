export default function DashboardLoading() {
  return (
    <div className="page-loading" aria-busy="true" aria-live="polite">
      <div className="page-loading-bar" />
      <div className="page-loading-stack">
        <div className="page-loading-line page-loading-line-lg" />
        <div className="page-loading-line" />
        <div className="page-loading-line page-loading-line-sm" />
        <div className="page-loading-grid">
          <div className="page-loading-card" />
          <div className="page-loading-card" />
          <div className="page-loading-card" />
          <div className="page-loading-card" />
        </div>
      </div>
    </div>
  );
}

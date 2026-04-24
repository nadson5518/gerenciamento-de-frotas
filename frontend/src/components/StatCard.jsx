export function StatCard({ label, value, trend }) {
  return (
    <article className="stat-card">
      <p className="stat-card__label">{label}</p>
      <h3 className="stat-card__value">{value}</h3>
      <p className="stat-card__trend">{trend}</p>
    </article>
  );
}

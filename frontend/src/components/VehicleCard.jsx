const alertasLabels = {
  documentoVencido: 'Documento vencido',
  manutencaoPendente: 'Manutenção pendente',
  kmDesatualizado: 'KM desatualizado'
};

export function VehicleCard({ vehicle, onOpenDetails }) {
  const activeAlerts = Object.entries(vehicle.computedAlerts ?? vehicle.alertas).filter(
    ([, active]) => active
  );

  return (
    <article
      className="vehicle-card"
      onClick={() => onOpenDetails(vehicle)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onOpenDetails(vehicle);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <img
        src={vehicle.imageUrl}
        alt={`${vehicle.modelo} - ${vehicle.placa}`}
        className="vehicle-card__image"
      />

      <div className="vehicle-card__content">
        <div className="vehicle-card__header">
          <h3>{vehicle.placa}</h3>
          <span className={`status-badge status-badge--${vehicle.status.toLowerCase()}`}>
            {vehicle.status}
          </span>
        </div>

        <p>{vehicle.modelo}</p>
        <p className="vehicle-card__meta">Tipo: {vehicle.tipo}</p>

        <ul className="alert-list">
          {activeAlerts.length > 0 ? (
            activeAlerts.map(([key]) => (
              <li
                key={key}
                className={
                  key === 'manutencaoPendente'
                    ? 'alert-item alert-item--critical'
                    : 'alert-item'
                }
              >
                {alertasLabels[key]}
              </li>
            ))
          ) : (
            <li>Sem alertas</li>
          )}
        </ul>
      </div>
    </article>
  );
}
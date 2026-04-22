export function VehicleDetailsModal({ vehicle, onClose }) {
  if (!vehicle) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" onClick={(event) => event.stopPropagation()}>
        <header className="modal__header">
          <h3>Detalhes do veículo</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <img src={vehicle.imageUrl} alt={vehicle.placa} className="modal__image" />

        <dl className="modal__details">
          <div>
            <dt>Placa</dt>
            <dd>{vehicle.placa}</dd>
          </div>
          <div>
            <dt>Modelo</dt>
            <dd>{vehicle.modelo}</dd>
          </div>
          <div>
            <dt>Marca</dt>
            <dd>{vehicle.detalhes.marca}</dd>
          </div>
          <div>
            <dt>Ano</dt>
            <dd>{vehicle.detalhes.ano}</dd>
          </div>
          <div>
            <dt>Tipo</dt>
            <dd>{vehicle.tipo}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{vehicle.status}</dd>
          </div>
          <div>
            <dt>Chassi</dt>
            <dd>{vehicle.detalhes.chassi}</dd>
          </div>
          <div>
            <dt>Renavam</dt>
            <dd>{vehicle.detalhes.renavam}</dd>
          </div>
          <div>
            <dt>KM atual</dt>
            <dd>{vehicle.detalhes.kmAtual.toLocaleString('pt-BR')} km</dd>
          </div>
          <div>
            <dt>Última atualização de KM</dt>
            <dd>{new Date(vehicle.detalhes.ultimaAtualizacaoKm).toLocaleDateString('pt-BR')}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

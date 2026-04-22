export function Header({ onNewVehicle, onNewDriver, onNewRoute, onNewTrip, onNewContract, onMonthlyClosing }) {
  return (
    <header className="header">
      <div>
        <p className="header__subtitle">Tela de Veículos</p>
        <h2>Gestão de Veículos da Frota</h2>
      </div>

      <div className="header__actions">
        <button className="header__action header__action--ghost" type="button" onClick={onMonthlyClosing}>
          + Fechamento
        </button>
        <button className="header__action header__action--ghost" type="button" onClick={onNewContract}>
          + Contrato
        </button>
        <button className="header__action header__action--ghost" type="button" onClick={onNewTrip}>
          + Nova Rota
        </button>
        <button className="header__action header__action--ghost" type="button" onClick={onNewRoute}>
          + Rota Fixa
        </button>
        <button className="header__action header__action--ghost" type="button" onClick={onNewDriver}>
          + Motorista
        </button>
        <button className="header__action" type="button" onClick={onNewVehicle}>
          + Novo Veículo
        </button>
      </div>
    </header>
  );
}

export function VehiclesToolbar({ search, onSearchChange, filters, onFilterChange }) {
  return (
    <section className="toolbar panel">
      <input
        className="toolbar__search"
        type="search"
        placeholder="Buscar por placa ou modelo"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <div className="toolbar__filters">
        <select value={filters.tipo} onChange={(event) => onFilterChange('tipo', event.target.value)}>
          <option value="TODOS">Tipo: todos</option>
          <option value="PROPRIO">Próprio</option>
          <option value="ALUGADO">Alugado</option>
        </select>

        <select value={filters.status} onChange={(event) => onFilterChange('status', event.target.value)}>
          <option value="TODOS">Status: todos</option>
          <option value="ATIVO">Ativo</option>
          <option value="PARADO">Parado</option>
        </select>

        <select value={filters.alerta} onChange={(event) => onFilterChange('alerta', event.target.value)}>
          <option value="TODOS">Alertas: todos</option>
          <option value="documentoVencido">Documento vencido</option>
          <option value="manutencaoPendente">Manutenção pendente</option>
          <option value="kmDesatualizado">KM desatualizado</option>
        </select>
      </div>
    </section>
  );
}

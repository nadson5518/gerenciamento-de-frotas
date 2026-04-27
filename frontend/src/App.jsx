import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContractForm } from './components/ContractForm.jsx';
import { DriverForm } from './components/DriverForm.jsx';
import { Header } from './components/Header.jsx';
import { MonthlyClosingForm } from './components/MonthlyClosingForm.jsx';
import { RouteForm } from './components/RouteForm.jsx';
import { RouteModelForm } from './components/RouteModelForm.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { VehicleCard } from './components/VehicleCard.jsx';
import { VehicleDetailsPage } from './components/VehicleDetailsPage.jsx';
import { VehicleForm } from './components/VehicleForm.jsx';
import { VehiclesToolbar } from './components/VehiclesToolbar.jsx';
import { fetchMaintenances, fetchVehicles } from './services/api.js';
import { calculateVehicleAlerts, countVehicleAlerts } from './utils/alerts.js';
import { mapVehicle } from './utils/mapVehicle.js';

function hasSelectedAlert(vehicle, alertFilter) {
  if (alertFilter === 'TODOS') return true;
  return vehicle.computedAlerts?.[alertFilter];
}

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    tipo: 'TODOS',
    status: 'TODOS',
    alerta: 'TODOS'
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showTripForm, setShowTripForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showMonthlyClosing, setShowMonthlyClosing] = useState(false);

  const showFeedback = useCallback((message, type = 'success') => {
    setFeedback({ message, type });
  }, []);
  
  useEffect(() => {
  async function loadVehicles() {
    try {
      const [vehiclesResponse, maintenancesResponse] = await Promise.all([
        fetch(`${API_URL}/api/veiculos`),
        fetch(`${API_URL}/api/manutencoes`)
      ]);

      if (!vehiclesResponse.ok) {
        throw new Error(`Erro ao buscar veículos: ${vehiclesResponse.status}`);
      }

  const loadVehicles = useCallback(async () => {
    try {
      setIsLoadingVehicles(true);

      const [vehiclesData, maintenancesData] = await Promise.all([
        fetchVehicles(),
        fetchMaintenances()
      ]);

      const maintenancesByVehicle = maintenancesData.reduce((acc, item) => {
        const veiculoId = item.veiculo_id;
        const mappedMaintenance = {
          id: item.id,
          data: item.data,
          tipo: item.tipo,
          descricao: item.descricao || '',
          valor: Number(item.valor || 0),
          km: Number(item.km || 0),
          proximaRevisaoData: item.proxima_revisao_data,
          proximaRevisaoKm: item.proxima_revisao_km
        };

        if (!acc[veiculoId]) {
          acc[veiculoId] = [];
        }

        acc[veiculoId].push(mappedMaintenance);
        return acc;
      }, {});

      const mappedVehicles = vehiclesData.map((vehicle) => ({
        ...mapVehicle(vehicle),
        manutencoes: maintenancesByVehicle[vehicle.id] || []
      }));

      setVehicles(mappedVehicles);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showFeedback('Não foi possível carregar os dados da frota.', 'error');
    } finally {
      setIsLoadingVehicles(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  useEffect(() => {
    if (!feedback) return undefined;

    const timeoutId = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(timeoutId);
  }, [feedback]);

  const updateVehicleInState = useCallback((updatedVehicle) => {
    setVehicles((current) =>
      current.map((vehicleItem) =>
        vehicleItem.id === updatedVehicle.id
          ? { ...vehicleItem, ...updatedVehicle }
          : vehicleItem
      )
    );
  }, []);

  const addVehicleInState = useCallback((newVehicle) => {
    setVehicles((current) => [newVehicle, ...current]);
  }, []);

  const addMaintenanceToVehicleInState = useCallback((vehicleId, newMaintenance) => {
    setVehicles((current) =>
      current.map((vehicleItem) => {
        if (vehicleItem.id !== vehicleId) return vehicleItem;

        return {
          ...vehicleItem,
          manutencoes: [newMaintenance, ...(vehicleItem.manutencoes || [])]
        };
      })
    );
  }, []);

  const vehiclesWithAlerts = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        ...vehicle,
        computedAlerts: calculateVehicleAlerts(vehicle)
      })),
    [vehicles]
  );

  const selectedVehicleUpdated = useMemo(() => {
    if (!selectedVehicle) return null;

    return vehiclesWithAlerts.find((vehicle) => vehicle.id === selectedVehicle.id) ?? null;
  }, [selectedVehicle, vehiclesWithAlerts]);

  const filteredVehicles = useMemo(() => {
    return vehiclesWithAlerts.filter((vehicle) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        vehicle.placa.toLowerCase().includes(query) ||
        vehicle.modelo.toLowerCase().includes(query);

      const matchesTipo = filters.tipo === 'TODOS' || vehicle.tipo === filters.tipo;
      const matchesStatus = filters.status === 'TODOS' || vehicle.status === filters.status;
      const matchesAlerta = hasSelectedAlert(vehicle, filters.alerta);

      return matchesSearch && matchesTipo && matchesStatus && matchesAlerta;
    });
  }, [search, filters, vehiclesWithAlerts]);

  const dashboardAlerts = useMemo(
    () =>
      vehiclesWithAlerts.reduce(
        (acc, vehicle) => {
          const alerts = vehicle.computedAlerts;
          acc.total += countVehicleAlerts(alerts);
          if (alerts.kmDesatualizado) acc.km += 1;
          if (alerts.manutencaoPendente) acc.manutencao += 1;
          if (alerts.documentoVencido) acc.documentos += 1;
          return acc;
        },
        { total: 0, km: 0, manutencao: 0, documentos: 0 }
      ),
    [vehiclesWithAlerts]
  );

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        <Header
          onNewVehicle={() => setShowVehicleForm(true)}
          onNewDriver={() => setShowDriverForm(true)}
          onNewRoute={() => setShowRouteForm(true)}
          onNewTrip={() => setShowTripForm(true)}
          onNewContract={() => setShowContractForm(true)}
          onMonthlyClosing={() => setShowMonthlyClosing(true)}
        />

        {feedback && (
          <section className={`panel feedback-banner feedback-banner--${feedback.type}`}>
            {feedback.message}
          </section>
        )}

        <section className="alert-summary panel">
          <h3>Dashboard de alertas</h3>
          <div className="summary-inline-grid">
            <article>
              <span>Total de alertas</span>
              <strong>{dashboardAlerts.total}</strong>
            </article>
            <article>
              <span>KM pendente</span>
              <strong>{dashboardAlerts.km}</strong>
            </article>
            <article>
              <span>Manutenção pendente</span>
              <strong>{dashboardAlerts.manutencao}</strong>
            </article>
            <article>
              <span>Documentos vencidos</span>
              <strong>{dashboardAlerts.documentos}</strong>
            </article>
          </div>
        </section>

        <VehiclesToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <section className="vehicles-grid">
          {isLoadingVehicles ? (
            <article className="panel vehicles-empty">Carregando veículos...</article>
          ) : filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} onOpenDetails={setSelectedVehicle} />
            ))
          ) : (
            <article className="panel vehicles-empty">
              Nenhum veículo encontrado para os filtros selecionados.
            </article>
          )}
        </section>

        {selectedVehicleUpdated && (
          <VehicleDetailsPage
            vehicle={selectedVehicleUpdated}
            onClose={() => setSelectedVehicle(null)}
            onUpdateVehicle={updateVehicleInState}
            onAddMaintenance={addMaintenanceToVehicleInState}
            onFeedback={showFeedback}
          />
        )}
      </main>

      {showVehicleForm && (
        <VehicleForm
          onClose={() => setShowVehicleForm(false)}
          onVehicleCreated={addVehicleInState}
          onFeedback={showFeedback}
        />
      )}
      {showDriverForm && (
        <DriverForm vehicles={vehiclesWithAlerts} onClose={() => setShowDriverForm(false)} />
      )}
      {showRouteForm && <RouteModelForm onClose={() => setShowRouteForm(false)} />}
      {showTripForm && (
        <RouteForm vehicles={vehiclesWithAlerts} onClose={() => setShowTripForm(false)} />
      )}
      {showContractForm && (
        <ContractForm vehicles={vehiclesWithAlerts} onClose={() => setShowContractForm(false)} />
      )}
      {showMonthlyClosing && <MonthlyClosingForm onClose={() => setShowMonthlyClosing(false)} />}
    </div>
  );
}

export default App;

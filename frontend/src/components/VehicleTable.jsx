import { useEffect, useState } from 'react';
import { fetchVehicles } from '../services/api.js';
import { mapVehicle } from '../utils/mapVehicle';

export function VehicleTable() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function loadVehicles() {
    try {
      setIsLoading(true);
      const data = await fetchVehicles();
      setVehicles(data.map(mapVehicle));
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <section className="panel">
      <div className="panel__header">
        <h3>Veículos</h3>
        <button type="button" onClick={loadVehicles} disabled={isLoading}>
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Placa</th>
              <th>Modelo</th>
              <th>Status</th>
              <th>Quilometragem</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan="4">Nenhum veículo cadastrado.</td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.placa}</td>
                  <td>{vehicle.modelo}</td>
                  <td>{vehicle.status}</td>
                  <td>{vehicle.detalhes.kmAtual.toLocaleString('pt-BR')} km</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

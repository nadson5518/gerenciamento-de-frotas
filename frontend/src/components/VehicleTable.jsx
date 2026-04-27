import { useEffect, useState } from 'react';
import { fetchVehicles } from '../services/api.js';
import { mapVehicle } from '../utils/mapVehicle';

const API_URL = import.meta.env.VITE_API_URL;

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
    fetch(`${API_URL}/api/veiculos`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(mapVehicle);
        setVehicles(mapped);
      })
      .catch(err => console.error('Erro ao buscar veículos:', err));
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

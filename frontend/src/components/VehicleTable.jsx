import { useEffect, useState } from 'react';
import { mapVehicle } from '../utils/mapVehicle';

export function VehicleTable() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/veiculos')
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
        <button type="button" onClick={() => window.location.reload()}>
          Atualizar
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
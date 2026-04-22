const vehicles = [
  { id: 1, plate: 'ABC1D23', model: 'Ford Transit', status: 'Ativo', mileage: '58.230 km' },
  { id: 2, plate: 'XYZ9K88', model: 'Mercedes Sprinter', status: 'Manutenção', mileage: '91.340 km' },
  { id: 3, plate: 'QWE4R56', model: 'Renault Master', status: 'Ativo', mileage: '34.900 km' }
];

export function VehicleTable() {
  return (
    <section className="panel">
      <div className="panel__header">
        <h3>Veículos</h3>
        <button type="button">Ver todos</button>
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
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.plate}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.status}</td>
                <td>{vehicle.mileage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

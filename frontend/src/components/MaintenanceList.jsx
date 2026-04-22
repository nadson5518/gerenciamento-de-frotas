const maintenanceItems = [
  {
    id: 1,
    title: 'Troca de óleo - XYZ9K88',
    date: '24/04/2026',
    status: 'Em andamento'
  },
  {
    id: 2,
    title: 'Revisão de freios - ABC1D23',
    date: '26/04/2026',
    status: 'Agendado'
  }
];

export function MaintenanceList() {
  return (
    <section className="panel">
      <div className="panel__header">
        <h3>Manutenções</h3>
        <button type="button">Agenda</button>
      </div>

      <ul className="maintenance-list">
        {maintenanceItems.map((item) => (
          <li key={item.id}>
            <div>
              <p>{item.title}</p>
              <span>{item.date}</span>
            </div>
            <strong>{item.status}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

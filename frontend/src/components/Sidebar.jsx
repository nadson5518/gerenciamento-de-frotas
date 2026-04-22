const menuItems = [
  'Dashboard',
  'Veículos',
  'Motoristas',
  'Manutenções',
  'Abastecimentos',
  'Relatórios'
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <h1 className="sidebar__title">FleetOps</h1>
      <nav>
        <ul className="sidebar__menu">
          {menuItems.map((item) => (
            <li key={item} className="sidebar__item">
              <button type="button">{item}</button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

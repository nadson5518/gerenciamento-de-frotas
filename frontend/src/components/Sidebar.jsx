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
      <div className="sidebar__brand" aria-label="Alpha Transportes">
        <div className="sidebar__logo" aria-hidden="true">
          <span>A</span>
        </div>
        <div className="sidebar__brand-text">
          <h1 className="sidebar__title">ALPHA</h1>
          <p className="sidebar__subtitle">TRANSPORTES</p>
        </div>
      </div>
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

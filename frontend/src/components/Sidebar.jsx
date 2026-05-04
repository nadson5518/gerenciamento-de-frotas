import alphaLogo from '../assets/alpha-transportes-logo.svg';

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
        <img className="sidebar__brand-image" src={alphaLogo} alt="Logotipo da Alpha Transportes" />
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

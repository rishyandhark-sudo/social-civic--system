import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/report', label: 'Report' },
  { to: '/my-complaints', label: 'My reports' },
  { to: '/dashboard', label: 'Public map' },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-surface">
      <ul className="mx-auto flex max-w-lg">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `block px-4 py-3 text-center text-sm font-medium ${
                  isActive ? 'text-primary' : 'text-ink/50'
                }`
              }
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

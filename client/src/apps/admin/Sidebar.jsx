import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const LINKS = [
  { to: '/admin/queue', label: 'Complaint queue' },
  { to: '/admin/analytics', label: 'Analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAdminAuth();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-surface px-4 py-6">
      <h1 className="mb-8 px-2 text-lg font-display font-semibold text-primary-dark">
        Civic Admin
      </h1>
      <nav className="flex-1 space-y-1">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-primary-light text-primary-dark' : 'text-ink/60 hover:bg-ink/5'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border pt-4">
        <p className="px-2 text-xs text-ink/50">{user?.name}</p>
        <button
          onClick={logout}
          className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-ink/60 hover:bg-ink/5"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

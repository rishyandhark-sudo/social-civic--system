import { NavLink } from 'react-router-dom';
import { useWorkerAuth } from '../../context/WorkerAuthContext';

export default function WorkerNav() {
  const { logout } = useWorkerAuth();

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-surface">
      <ul className="mx-auto flex max-w-lg">
        <li className="flex-1">
          <NavLink
            to="/worker/tasks"
            className={({ isActive }) =>
              `block px-4 py-3 text-center text-sm font-medium ${
                isActive ? 'text-primary' : 'text-ink/50'
              }`
            }
          >
            Tasks
          </NavLink>
        </li>
        <li className="flex-1">
          <button onClick={logout} className="block w-full px-4 py-3 text-center text-sm font-medium text-ink/50">
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import StatusBadge from '../../../components/StatusBadge';
import Card from '../../../components/Card';

export default function TaskList() {
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    api.get('/worker/tasks').then(({ data }) => setTasks(data.tasks));
  }, []);

  if (tasks === null) {
    return <p className="px-4 py-10 text-center text-sm text-ink/50">Loading your tasks…</p>;
  }

  const active = tasks.filter((t) => t.complaint.status !== 'resolved');
  const completed = tasks.filter((t) => t.complaint.status === 'resolved');

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Your tasks</h1>

      {active.length === 0 ? (
        <p className="text-sm text-ink/50">No active tasks right now.</p>
      ) : (
        <ul className="space-y-3">
          {active.map((t) => (
            <TaskRow key={t._id} task={t} />
          ))}
        </ul>
      )}

      {completed.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-medium text-ink/50">Completed</h2>
          <ul className="space-y-3">
            {completed.map((t) => (
              <TaskRow key={t._id} task={t} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function TaskRow({ task }) {
  return (
    <Link to={`/worker/tasks/${task._id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{task.complaint.category?.name}</p>
            <p className="mt-0.5 line-clamp-1 text-sm text-ink/60">{task.complaint.address}</p>
            {task.deadline && (
              <p className="mt-1 font-mono text-xs text-ink/40">
                Due {new Date(task.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
          <StatusBadge status={task.complaint.status} />
        </div>
      </Card>
    </Link>
  );
}

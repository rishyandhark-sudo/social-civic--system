import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import StatusBadge from '../../../components/StatusBadge';
import Card from '../../../components/Card';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState(null);

  useEffect(() => {
    api.get('/complaints/mine').then(({ data }) => setComplaints(data.complaints));
  }, []);

  if (complaints === null) {
    return <p className="px-4 py-10 text-center text-sm text-ink/50">Loading your complaints…</p>;
  }

  if (complaints.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 text-center">
        <p className="text-sm text-ink/60">You haven't reported anything yet.</p>
        <Link to="/report" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
          Report your first issue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Your complaints</h1>
      <ul className="space-y-3">
        {complaints.map((c) => (
          <li key={c._id}>
            <Link to={`/complaints/${c._id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{c.category?.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-sm text-ink/60">{c.description}</p>
                    <p className="mt-1 font-mono text-xs text-ink/40">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

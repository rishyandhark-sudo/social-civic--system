import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import StatusBadge from '../../../components/StatusBadge';
import { Select, Input } from '../../../components/Input';
import Card from '../../../components/Card';

const STATUSES = ['pending', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function ComplaintQueue() {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', area: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api
      .get('/admin/complaints', { params })
      .then(({ data }) => {
        setComplaints(data.complaints);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">Complaint queue</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </Select>
        <Select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={filters.priority} onChange={(e) => updateFilter('priority', e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Search area…"
          value={filters.area}
          onChange={(e) => updateFilter('area', e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : complaints.length === 0 ? (
        <p className="text-sm text-ink/50">No complaints match these filters.</p>
      ) : (
        <div className="space-y-2">
          {complaints.map((c) => (
            <Link key={c._id} to={`/admin/complaints/${c._id}`}>
              <Card className="flex items-center justify-between gap-4 transition-shadow hover:shadow-md">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{c.category?.name}</p>
                    <span className="font-mono text-xs text-ink/40">
                      {c.priority}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink/60">{c.address}</p>
                  <p className="mt-0.5 text-xs text-ink/40">{c.citizen?.name}</p>
                </div>
                <StatusBadge status={c.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <p className="mt-4 text-center text-xs text-ink/50">
          Page {pagination.page} of {pagination.pages} · {pagination.total} total
        </p>
      )}
    </div>
  );
}

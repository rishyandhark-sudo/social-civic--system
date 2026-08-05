import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../../services/api';
import Card from '../../../components/Card';

const STATUS_ORDER = ['pending', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [hotspots, setHotspots] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics/summary').then(({ data }) => setSummary(data.summary));
    api.get('/admin/analytics/hotspots').then(({ data }) => setHotspots(data.hotspots));
  }, []);

  if (!summary || !hotspots) return <p className="p-8 text-sm text-ink/50">Loading…</p>;

  const statusData = STATUS_ORDER.map((status) => ({
    status: status.replace('_', ' '),
    count: summary.byStatus[status] || 0,
  }));

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">Analytics</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total complaints" value={summary.total} />
        <StatCard label="Pending review" value={summary.byStatus.pending || 0} />
        <StatCard label="Resolved" value={summary.byStatus.resolved || 0} />
        <StatCard
          label="Avg. resolution time"
          value={summary.avgResolutionHours ? `${summary.avgResolutionHours.toFixed(1)}h` : '—'}
        />
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-medium text-ink/70">Complaints by status</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE5E3" />
            <XAxis dataKey="status" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1F6F6B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-ink/70">Most reported categories</h2>
        <ResponsiveContainer width="100%" height={Math.max(200, hotspots.byCategory.length * 40)}>
          <BarChart data={hotspots.byCategory} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE5E3" />
            <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
            <YAxis type="category" dataKey="category" width={140} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#B8712B" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <p className="text-xs text-ink/50">{label}</p>
      <p className="mt-1 font-mono text-2xl font-medium">{value}</p>
    </Card>
  );
}

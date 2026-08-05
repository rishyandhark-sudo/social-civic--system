import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../../../services/api';
import StatusBadge from '../../../components/StatusBadge';
import { Select } from '../../../components/Input';
import Card from '../../../components/Card';

const DEFAULT_CENTER = [20.5937, 78.9629]; // India centroid — swap for your city's coordinates

export default function PublicDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    const params = category ? { category } : {};
    api.get('/complaints/public', { params }).then(({ data }) => setComplaints(data.complaints));
  }, [category]);

  const withCoordinates = complaints.filter((c) => c.location?.coordinates?.length === 2);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Public dashboard</h1>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-48">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <Card className="mb-6 overflow-hidden !p-0">
        <MapContainer center={DEFAULT_CENTER} zoom={5} style={{ height: '360px', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {withCoordinates.map((c) => (
            <Marker
              key={c._id}
              position={[c.location.coordinates[1], c.location.coordinates[0]]}
            >
              <Popup>
                <p className="font-medium">{c.category?.name}</p>
                <p className="text-xs">{c.address}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {withCoordinates.length === 0 && complaints.length > 0 && (
          <p className="border-t border-border px-4 py-2 text-xs text-ink/50">
            None of the current complaints have map coordinates yet — see the list below.
          </p>
        )}
      </Card>

      <ul className="space-y-3">
        {complaints.map((c) => (
          <li key={c._id}>
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{c.category?.name}</p>
                  <p className="mt-0.5 text-sm text-ink/60">{c.address}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Button from '../../../components/Button';
import { Field, Input, Select, Textarea } from '../../../components/Input';
import MediaUploader from '../../../components/MediaUploader';
import Card from '../../../components/Card';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [priority, setPriority] = useState('medium');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(data.categories);
      if (data.categories[0]) setCategoryId(data.categories[0]._id);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('categoryId', categoryId);
    formData.append('description', description);
    formData.append('address', address);
    formData.append('priority', priority);
    files.forEach((file) => formData.append('media', file));

    try {
      const { data } = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(data.complaint);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <Card>
          <h1 className="mb-2 text-2xl font-semibold text-success">Complaint submitted</h1>
          <p className="mb-1 text-sm text-ink/70">Your tracking ID:</p>
          <p className="mb-6 font-mono text-lg">{submitted._id}</p>
          <div className="flex gap-3">
            <Button onClick={() => navigate(`/complaints/${submitted._id}`)}>Track this complaint</Button>
            <Button variant="secondary" onClick={() => setSubmitted(null)}>
              Report another issue
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Report an issue</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="space-y-5">
          <Field label="Category" htmlFor="category">
            <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Describe the issue" htmlFor="description">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's happening, and how bad is it?"
              required
            />
          </Field>

          <Field label="Location" htmlFor="address" hint="Street, landmark, or area name">
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. MG Road, near City Hospital"
              required
            />
          </Field>

          <Field label="Priority" htmlFor="priority">
            <Select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p[0].toUpperCase() + p.slice(1)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Photos or video">
            <MediaUploader files={files} onChange={setFiles} />
          </Field>
        </Card>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={submitting} className="w-full">
          Submit complaint
        </Button>
      </form>
    </div>
  );
}

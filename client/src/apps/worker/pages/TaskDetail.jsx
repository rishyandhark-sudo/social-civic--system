import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import StatusBadge from '../../../components/StatusBadge';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import { Field, Textarea } from '../../../components/Input';
import MediaUploader from '../../../components/MediaUploader';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [proofFiles, setProofFiles] = useState([]);
  const [notes, setNotes] = useState('');

  function refetch() {
    return api.get(`/worker/tasks/${id}`).then(({ data }) => setTask(data.task));
  }

  useEffect(() => {
    refetch();
  }, [id]);

  async function handleStart() {
    setError('');
    setBusy(true);
    try {
      await api.patch(`/worker/tasks/${id}/start`);
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start this task.');
    } finally {
      setBusy(false);
    }
  }

  async function handleResolve(e) {
    e.preventDefault();
    setError('');
    if (proofFiles.length === 0) {
      setError('Add at least one photo of the completed work.');
      return;
    }
    setBusy(true);

    const formData = new FormData();
    proofFiles.forEach((file) => formData.append('proof', file));
    formData.append('notes', notes);

    try {
      await api.post(`/worker/tasks/${id}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/worker/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark this task resolved.');
    } finally {
      setBusy(false);
    }
  }

  if (!task) return <p className="px-4 py-10 text-center text-sm text-ink/50">Loading…</p>;

  const { complaint } = task;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-ink/50 hover:text-ink">
        ← Back to tasks
      </button>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ink/40">{complaint._id}</p>
          <h1 className="mt-1 text-xl font-semibold">{complaint.category?.name}</h1>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <Card className="mb-5 space-y-2">
        <p className="text-sm text-ink/80">{complaint.description}</p>
        <p className="text-xs text-ink/50">{complaint.address}</p>
      </Card>

      {complaint.mediaUrls?.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-ink/50">Citizen's photos</p>
          <div className="grid grid-cols-3 gap-2">
            {complaint.mediaUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="aspect-square rounded-lg border border-border object-cover" />
            ))}
          </div>
        </div>
      )}

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      {complaint.status === 'assigned' && (
        <Button onClick={handleStart} loading={busy} className="w-full">
          Start work
        </Button>
      )}

      {complaint.status === 'in_progress' && (
        <Card>
          <h2 className="mb-4 text-sm font-medium">Mark as resolved</h2>
          <form onSubmit={handleResolve} className="space-y-4">
            <Field label="Proof of completion" hint="At least one photo required">
              <MediaUploader files={proofFiles} onChange={setProofFiles} />
            </Field>
            <Field label="Notes (optional)">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
            <Button type="submit" loading={busy} className="w-full">
              Mark resolved
            </Button>
          </form>
        </Card>
      )}

      {complaint.status === 'resolved' && task.proofUrls?.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-medium text-success">Completed</h2>
          <div className="grid grid-cols-3 gap-2">
            {task.proofUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="aspect-square rounded-lg border border-border object-cover" />
            ))}
          </div>
          {task.notes && <p className="mt-3 text-sm text-ink/70">{task.notes}</p>}
        </Card>
      )}
    </div>
  );
}

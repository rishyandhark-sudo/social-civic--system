import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import StatusBadge from '../../../components/StatusBadge';
import StatusTimeline from '../../../components/StatusTimeline';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Modal from '../../../components/Modal';
import { Field, Select, Input, Textarea } from '../../../components/Input';

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [showAssign, setShowAssign] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [workerId, setWorkerId] = useState('');
  const [deadline, setDeadline] = useState('');

  function refetch() {
    return api.get(`/complaints/${id}`).then(({ data }) => {
      setComplaint(data.complaint);
      setStatusHistory(data.statusHistory);
    });
  }

  useEffect(() => {
    refetch();
  }, [id]);

  useEffect(() => {
    if (showAssign) {
      api.get('/admin/workers').then(({ data }) => setWorkers(data.workers));
    }
  }, [showAssign]);

  async function handleVerify() {
    setActionError('');
    setBusy(true);
    try {
      await api.patch(`/admin/complaints/${id}/verify`);
      await refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not verify this complaint.');
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(e) {
    e.preventDefault();
    setActionError('');
    setBusy(true);
    try {
      await api.patch(`/admin/complaints/${id}/reject`, { reason: rejectReason });
      setShowReject(false);
      await refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not reject this complaint.');
    } finally {
      setBusy(false);
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    setActionError('');
    setBusy(true);
    try {
      await api.post('/admin/assignments', { complaintId: id, workerId, deadline: deadline || undefined });
      setShowAssign(false);
      await refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not assign a worker.');
    } finally {
      setBusy(false);
    }
  }

  if (!complaint) return <p className="p-8 text-sm text-ink/50">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-ink/50 hover:text-ink">
        ← Back to queue
      </button>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ink/40">{complaint._id}</p>
          <h1 className="mt-1 text-xl font-semibold">{complaint.category?.name}</h1>
          <p className="mt-0.5 text-sm text-ink/50">
            Reported by {complaint.citizen?.name} · {complaint.citizen?.phone}
          </p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <Card className="mb-5 space-y-3">
        <p className="text-sm text-ink/80">{complaint.description}</p>
        <p className="text-xs text-ink/50">{complaint.address}</p>
        <p className="text-xs text-ink/50">Priority: {complaint.priority}</p>
      </Card>

      {complaint.mediaUrls?.length > 0 && (
        <div className="mb-5 grid grid-cols-4 gap-2">
          {complaint.mediaUrls.map((url, i) => (
            <img key={i} src={url} alt="" className="aspect-square rounded-lg border border-border object-cover" />
          ))}
        </div>
      )}

      {actionError && <p className="mb-3 text-sm text-danger">{actionError}</p>}

      <div className="mb-6 flex gap-3">
        {complaint.status === 'pending' && (
          <>
            <Button onClick={handleVerify} loading={busy}>
              Verify
            </Button>
            <Button variant="danger" onClick={() => setShowReject(true)}>
              Reject
            </Button>
          </>
        )}
        {complaint.status === 'verified' && (
          <Button onClick={() => setShowAssign(true)}>Assign worker</Button>
        )}
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-ink/70">Status</h2>
        <StatusTimeline statusHistory={statusHistory} currentStatus={complaint.status} />
      </Card>

      {showReject && (
        <Modal title="Reject complaint" onClose={() => setShowReject(false)}>
          <form onSubmit={handleReject} className="space-y-4">
            <Field label="Reason" hint="Shown to the citizen">
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required />
            </Field>
            <Button type="submit" variant="danger" loading={busy} className="w-full">
              Confirm rejection
            </Button>
          </form>
        </Modal>
      )}

      {showAssign && (
        <Modal title="Assign a worker" onClose={() => setShowAssign(false)}>
          <form onSubmit={handleAssign} className="space-y-4">
            <Field label="Worker" htmlFor="worker">
              <Select id="worker" value={workerId} onChange={(e) => setWorkerId(e.target.value)} required>
                <option value="" disabled>
                  Choose a worker
                </option>
                {workers.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Deadline (optional)" htmlFor="deadline">
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </Field>
            <Button type="submit" loading={busy} className="w-full" disabled={!workerId}>
              Assign
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

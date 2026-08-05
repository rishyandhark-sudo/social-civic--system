import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { joinRoom, onStatusChanged } from '../../../services/socket';
import StatusBadge from '../../../components/StatusBadge';
import StatusTimeline from '../../../components/StatusTimeline';
import Card from '../../../components/Card';

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);

  useEffect(() => {
    api.get(`/complaints/${id}`).then(({ data }) => {
      setComplaint(data.complaint);
      setStatusHistory(data.statusHistory);
    });

    joinRoom(`complaint:${id}`);
    // Live update: when the server emits a status change for this complaint,
    // refetch so the timeline and badge update without a page reload.
    const unsubscribe = onStatusChanged((payload) => {
      if (payload.complaintId === id) {
        api.get(`/complaints/${id}`).then(({ data }) => {
          setComplaint(data.complaint);
          setStatusHistory(data.statusHistory);
        });
      }
    });
    return unsubscribe;
  }, [id]);

  if (!complaint) {
    return <p className="px-4 py-10 text-center text-sm text-ink/50">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ink/40">{complaint._id}</p>
          <h1 className="mt-1 text-xl font-semibold">{complaint.category?.name}</h1>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <Card className="mb-5">
        <p className="text-sm text-ink/80">{complaint.description}</p>
        <p className="mt-3 text-xs text-ink/50">{complaint.address}</p>
        {complaint.status === 'rejected' && complaint.rejectionReason && (
          <p className="mt-3 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
            Reason: {complaint.rejectionReason}
          </p>
        )}
      </Card>

      {complaint.mediaUrls?.length > 0 && (
        <div className="mb-5 grid grid-cols-3 gap-2">
          {complaint.mediaUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Complaint evidence ${i + 1}`}
              className="aspect-square rounded-lg border border-border object-cover"
            />
          ))}
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-sm font-medium text-ink/70">Status</h2>
        <StatusTimeline statusHistory={statusHistory} currentStatus={complaint.status} />
      </Card>
    </div>
  );
}

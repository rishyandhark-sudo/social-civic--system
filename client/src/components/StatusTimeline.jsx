const FULL_SEQUENCE = ['pending', 'verified', 'assigned', 'in_progress', 'resolved'];

const STEP_LABELS = {
  pending: 'Submitted',
  verified: 'Verified by admin',
  assigned: 'Assigned to worker',
  in_progress: 'Work in progress',
  resolved: 'Resolved',
};

function formatTimestamp(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * statusHistory: array of { status, changedAt } from GET /api/complaints/:id
 * currentStatus: the complaint's current status (handles "rejected" as a
 * branch off the main sequence rather than forcing it into the happy path)
 */
export default function StatusTimeline({ statusHistory, currentStatus }) {
  const historyByStatus = Object.fromEntries(statusHistory.map((h) => [h.status, h.changedAt]));
  const isRejected = currentStatus === 'rejected';
  const currentIndex = FULL_SEQUENCE.indexOf(currentStatus);

  return (
    <ol className="relative ml-3 space-y-6 border-l-2 border-border pl-6">
      {FULL_SEQUENCE.map((step, i) => {
        const reached = historyByStatus[step];
        const isCurrent = step === currentStatus;
        const isPast = i < currentIndex;
        const isFuture = !reached && !isCurrent && !isRejected;

        return (
          <li key={step} className="relative">
            <span
              className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 border-bg ${
                reached ? 'bg-primary' : 'bg-border'
              } ${isCurrent && !isRejected ? 'ring-4 ring-primary-light' : ''}`}
              aria-hidden="true"
            />
            <p className={`text-sm font-medium ${isFuture ? 'text-ink/40' : 'text-ink'}`}>
              {STEP_LABELS[step]}
            </p>
            {reached && (
              <p className="mt-0.5 font-mono text-xs text-ink/50">{formatTimestamp(reached)}</p>
            )}
          </li>
        );
      })}
      {isRejected && (
        <li className="relative">
          <span
            className="absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 border-bg bg-danger ring-4 ring-danger-light"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-danger">Rejected</p>
          {historyByStatus.rejected && (
            <p className="mt-0.5 font-mono text-xs text-ink/50">
              {formatTimestamp(historyByStatus.rejected)}
            </p>
          )}
        </li>
      )}
    </ol>
  );
}

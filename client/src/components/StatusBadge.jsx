const STATUS_CONFIG = {
  pending: { label: 'Pending review', className: 'bg-amber-light text-amber' },
  verified: { label: 'Verified', className: 'bg-primary-light text-primary-dark' },
  rejected: { label: 'Rejected', className: 'bg-danger-light text-danger' },
  assigned: { label: 'Assigned', className: 'bg-primary-light text-primary-dark' },
  in_progress: { label: 'In progress', className: 'bg-amber-light text-amber' },
  resolved: { label: 'Resolved', className: 'bg-success-light text-success' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-ink/10 text-ink' };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

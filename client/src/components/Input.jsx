export function Field({ label, hint, error, children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink/60">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

const baseInputClasses =
  'w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export function Input({ className = '', ...props }) {
  return <input className={`${baseInputClasses} ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${baseInputClasses} min-h-[100px] resize-y ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${baseInputClasses} ${className}`} {...props}>
      {children}
    </select>
  );
}

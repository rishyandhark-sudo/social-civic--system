export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-primary/40',
  secondary: 'bg-white text-primary border border-primary hover:bg-primary-light disabled:opacity-40',
  ghost: 'text-ink hover:bg-ink/5 disabled:opacity-40',
  danger: 'bg-danger text-white hover:bg-danger/90 disabled:bg-danger/40',
};

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

import Spinner from './Spinner';

const variants = {
  primary: `
    bg-accent text-white
    hover:opacity-90
    focus:ring-accent
  `,
  secondary: `
    bg-transparent text-text-primary
    border border-border-card
    hover:bg-bg-page
    focus:ring-accent
  `,
};

export default function Button({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`
        text-md font-medium tracking-tight
        px-6 py-[11px] rounded-sm
        transition-colors duration-base
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-40 disabled:cursor-not-allowed
        inline-flex items-center justify-center gap-2
        ${variants[variant]}
      `}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}

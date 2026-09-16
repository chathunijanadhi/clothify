import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({ variant = 'primary', children, className = '', style, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    fontWeight: 700,
    fontSize: '0.97rem',
    minHeight: 50,
    padding: '13px 24px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    ...(variant === 'primary' ? {
      background: 'var(--grad-primary)',
      color: 'white',
      boxShadow: 'var(--shadow-accent)',
    } : variant === 'secondary' ? {
      background: 'var(--accent-soft)',
      color: 'var(--primary)',
      border: '1.5px solid var(--border)',
    } : {
      background: 'transparent',
      color: 'var(--text)',
      border: '1.5px solid var(--border)',
    }),
    ...style,
  };

  return (
    <button style={baseStyle} className={className} {...props}>
      {children}
    </button>
  );
}

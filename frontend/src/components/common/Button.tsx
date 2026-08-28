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
      background: 'linear-gradient(135deg, #e91e8c 0%, #ff6b35 100%)',
      color: 'white',
      boxShadow: '0 6px 20px rgba(233, 30, 140, 0.32)',
    } : variant === 'secondary' ? {
      background: '#f8f4ff',
      color: '#4c3a8a',
      border: '1.5px solid #e0d9f0',
    } : {
      background: 'transparent',
      color: '#1a0a2e',
      border: '1.5px solid rgba(26,10,46,0.12)',
    }),
    ...style,
  };

  return (
    <button style={baseStyle} className={className} {...props}>
      {children}
    </button>
  );
}

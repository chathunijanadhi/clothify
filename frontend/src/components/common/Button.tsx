import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const variantClass =
    variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'ghost'
        ? 'btn-ghost'
        : 'btn-primary';

  return (
    <button className={`btn ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

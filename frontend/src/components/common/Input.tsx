import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="field">
      {label ? <span>{label}</span> : null}
      <input className={`input ${className}`.trim()} {...props} />
    </label>
  );
}

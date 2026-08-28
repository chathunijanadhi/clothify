import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = '', style, ...props }: InputProps) {
  const inputStyle: React.CSSProperties = {
    appearance: 'none',
    width: '100%',
    border: '1.5px solid rgba(26,10,46,0.12)',
    background: '#f8f4ff',
    borderRadius: 14,
    padding: '13px 16px',
    minHeight: 50,
    color: '#1a0a2e',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
    outline: 'none',
    boxSizing: 'border-box' as const,
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  };

  const spanStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '0.88rem',
    color: '#4c3a8a',
  };

  return (
    <label style={labelStyle} className={className}>
      {label ? <span style={spanStyle}>{label}</span> : null}
      <input style={inputStyle} {...props} />
    </label>
  );
}

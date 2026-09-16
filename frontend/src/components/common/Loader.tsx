interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
}

export function Loader({ size = 'md', label = 'Loading Collections...', fullScreen = false }: LoaderProps) {
  const content = (
    <div className={`monic-luxury-loader size-${size}`} role="status" aria-label={label || 'Loading'}>
      <div className="monic-loader-rings">
        <div className="monic-loader-ring-outer" />
        <div className="monic-loader-ring-inner" />
        <div className="monic-loader-mark">
          <img
            src="https://res.cloudinary.com/efjuzuge/image/upload/v1787922904/icon_only.png"
            alt="Clothify"
          />
        </div>
      </div>
      {label && <span className="monic-loader-label">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="monic-loader-fullscreen">
        {content}
      </div>
    );
  }

  return content;
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Copy, Check, ArrowRight } from 'lucide-react';

export function FlashDealSection() {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('WELCOME15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="section-block" style={{ padding: '20px 0' }}>
      <div className="container">
        <div className="flash-deal-box">
          {/* Decorative glowing blobs */}
          <div className="flash-deal-blob" />

          {/* Left copy */}
          <div className="flash-deal-content">
            <div className="flash-deal-badge">
              <Flame size={14} /> LIMITED TIME FLASH OFFER
            </div>

            <h2 className="flash-deal-title">
              Unlock <span style={{ color: '#00d4aa' }}>15% Extra Off</span> on Your First Bag
            </h2>

            <p className="flash-deal-subtitle">
              Upgrade your seasonal wardrobe with premium fabrics, tailored silhouettes, and effortless everyday essentials.
            </p>

            {/* Voucher copy bar */}
            <div className="flash-voucher-row">
              <div className="flash-voucher-box">
                <span className="flash-voucher-label">Voucher:</span>
                <strong className="flash-voucher-code">WELCOME15</strong>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flash-copy-btn"
                  style={{ background: copied ? '#00d4aa' : 'var(--accent)' }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <Link
                to="/products"
                className="btn btn-primary flash-shop-btn"
              >
                Shop Now <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Countdown Boxes */}
          <div className="flash-countdown-wrap">
            <div className="flash-countdown-title">
              ? Offer Ends In:
            </div>

            <div className="flash-countdown-boxes">
              <div className="flash-time-box">
                <div className="flash-time-num">{pad(timeLeft.hours)}</div>
                <div className="flash-time-unit">Hours</div>
              </div>

              <div className="flash-time-box">
                <div className="flash-time-num">{pad(timeLeft.minutes)}</div>
                <div className="flash-time-unit">Mins</div>
              </div>

              <div className="flash-time-box">
                <div className="flash-time-num highlight">{pad(timeLeft.seconds)}</div>
                <div className="flash-time-unit">Secs</div>
              </div>
            </div>

            <div className="flash-countdown-note">
              ? Automatically applied at checkout
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

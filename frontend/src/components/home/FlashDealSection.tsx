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
        <div
          style={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #4c1d95 100%)',
            borderRadius: 24,
            padding: '36px 32px',
            color: 'white',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28,
            alignItems: 'center',
            boxShadow: '0 20px 50px rgba(26,10,46,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative glowing blobs */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(233,30,140,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Left copy */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(233,30,140,0.2)',
                color: '#ff6b9d',
                padding: '6px 14px',
                borderRadius: 999,
                fontWeight: 800,
                fontSize: '0.78rem',
                marginBottom: 12,
                border: '1px solid rgba(233,30,140,0.35)',
              }}
            >
              <Flame size={14} /> LIMITED TIME FLASH OFFER
            </div>

            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', margin: '0 0 10px', color: 'white', fontWeight: 800 }}>
              Unlock <span style={{ color: '#00d4aa' }}>15% Extra Off</span> on Your First Bag
            </h2>

            <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.94rem', lineHeight: 1.6 }}>
              Upgrade your seasonal wardrobe with premium fabrics, tailored silhouettes, and effortless everyday essentials.
            </p>

            {/* Voucher copy bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1.5px dashed rgba(255,255,255,0.3)',
                  padding: '10px 18px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Voucher:
                </span>
                <strong style={{ letterSpacing: '0.1em', fontSize: '1.05rem', color: 'white' }}>
                  WELCOME15
                </strong>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    background: copied ? '#00d4aa' : 'var(--accent)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <Link
                to="/products"
                className="btn btn-primary"
                style={{ padding: '11px 22px', fontSize: '0.9rem' }}
              >
                Shop Now <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Countdown Boxes */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.86rem', fontWeight: 700 }}>
              ⚡ Offer Ends In:
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 16,
                  padding: '14px 18px',
                  textAlign: 'center',
                  minWidth: 72,
                }}
              >
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', fontFamily: 'monospace' }}>
                  {pad(timeLeft.hours)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Hours
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 16,
                  padding: '14px 18px',
                  textAlign: 'center',
                  minWidth: 72,
                }}
              >
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', fontFamily: 'monospace' }}>
                  {pad(timeLeft.minutes)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Mins
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 16,
                  padding: '14px 18px',
                  textAlign: 'center',
                  minWidth: 72,
                }}
              >
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ff6b9d', fontFamily: 'monospace' }}>
                  {pad(timeLeft.seconds)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Secs
                </div>
              </div>
            </div>

            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.76rem' }}>
              ✓ Automatically applied at checkout
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

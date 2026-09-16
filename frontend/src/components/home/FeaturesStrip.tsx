import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    desc: 'On orders over LKR 5,000',
    color: 'var(--primary)',
    bg: 'var(--accent-soft)',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: '30-day hassle-free returns',
    color: 'var(--accent-3)',
    bg: 'var(--accent-3-soft)',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    desc: '100% safe & protected',
    color: 'var(--accent)',
    bg: 'var(--accent-2-soft)',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Always here to help you',
    color: 'var(--primary-dark)',
    bg: 'var(--accent-soft)',
  },
];

export function FeaturesStrip() {
  return (
    <section className="features-strip-section">
      <div className="container">
        <div className="features-strip">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="feature-item">
              <div className="feature-icon" style={{ background: bg }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <div className="feature-title" style={{ color }}>{title}</div>
                <div className="feature-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

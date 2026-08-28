import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    desc: 'On orders over LKR 5,000',
    color: '#e91e8c',
    bg: 'rgba(233,30,140,0.08)',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: '30-day hassle-free returns',
    color: '#00d4aa',
    bg: 'rgba(0,212,170,0.08)',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    desc: '100% safe & protected',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Always here to help you',
    color: '#ff6b35',
    bg: 'rgba(255,107,53,0.08)',
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

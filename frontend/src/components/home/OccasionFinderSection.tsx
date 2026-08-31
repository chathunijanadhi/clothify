import { ArrowRight, Briefcase, Coffee, Wine, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const occasions = [
  {
    id: 'workwear',
    title: 'Work & Formal',
    subtitle: 'Sharp blazers, tailored trousers, and crisp shirts.',
    icon: Briefcase,
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(79,70,229,0.06) 100%)',
    link: '/products?category=Shirts',
    tag: 'Professional',
  },
  {
    id: 'casual',
    title: 'Casual Weekend',
    subtitle: 'Breathable tees, relaxed denim, and everyday comfort.',
    icon: Coffee,
    color: '#e91e8c',
    bg: 'linear-gradient(135deg, rgba(233,30,140,0.1) 0%, rgba(255,107,53,0.06) 100%)',
    link: '/products?category=T-Shirts',
    tag: 'Daily Wear',
  },
  {
    id: 'evening',
    title: 'Evening & Party',
    subtitle: 'Statement dresses, sophisticated fits, and sleek silks.',
    icon: Wine,
    color: '#00d4aa',
    bg: 'linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(0,180,216,0.06) 100%)',
    link: '/products?category=Dresses',
    tag: 'Night Out',
  },
  {
    id: 'vacay',
    title: 'Resort & Summer',
    subtitle: 'Linen essentials, airy skirts, and vibrant seasonal hues.',
    icon: Sun,
    color: '#ff6b35',
    bg: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(245,158,11,0.06) 100%)',
    link: '/products?category=Skirts',
    tag: 'Sunny Days',
  },
];

export function OccasionFinderSection() {
  return (
    <section className="section-block" style={{ background: 'var(--panel)' }}>
      <div className="container">
        <div className="section-heading" style={{ textAlign: 'center' }}>
          <p>Dressing for an event?</p>
          <h2>Shop by <span>Occasion &amp; Mood</span></h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {occasions.map((occ) => {
            const Icon = occ.icon;
            return (
              <Link
                key={occ.id}
                to={occ.link}
                style={{
                  background: occ.bg,
                  border: '1.5px solid var(--border)',
                  borderRadius: 20,
                  padding: '24px 22px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                className="occasion-card"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'white',
                        display: 'grid',
                        placeItems: 'center',
                        color: occ.color,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: occ.color,
                        background: 'white',
                        padding: '4px 10px',
                        borderRadius: 999,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      }}
                    >
                      {occ.tag}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 800 }}>
                    {occ.title}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                    {occ.subtitle}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: occ.color,
                    fontWeight: 800,
                    fontSize: '0.86rem',
                  }}
                >
                  Explore Collection <ArrowRight size={15} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

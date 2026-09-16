import { ArrowRight, Briefcase, Coffee, Wine, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const occasions = [
  {
    id: 'workwear',
    title: 'Work & Formal',
    subtitle: 'Sharp blazers, tailored trousers, and crisp shirts.',
    icon: Briefcase,
    color: '#A83A1F',
    bg: 'linear-gradient(135deg, rgba(168,58,31,0.08) 0%, rgba(196,75,43,0.04) 100%)',
    link: '/products?category=Shirts',
    tag: 'Professional',
  },
  {
    id: 'casual',
    title: 'Casual Weekend',
    subtitle: 'Breathable tees, relaxed denim, and everyday comfort.',
    icon: Coffee,
    color: '#C44B2B',
    bg: 'linear-gradient(135deg, rgba(196,75,43,0.08) 0%, rgba(212,98,43,0.04) 100%)',
    link: '/products?category=T-Shirts',
    tag: 'Daily Wear',
  },
  {
    id: 'evening',
    title: 'Evening & Party',
    subtitle: 'Statement dresses, sophisticated fits, and sleek silks.',
    icon: Wine,
    color: '#D4622B',
    bg: 'linear-gradient(135deg, rgba(212,98,43,0.08) 0%, rgba(232,115,90,0.04) 100%)',
    link: '/products?category=Dresses',
    tag: 'Night Out',
  },
  {
    id: 'vacay',
    title: 'Resort & Summer',
    subtitle: 'Linen essentials, airy skirts, and vibrant seasonal hues.',
    icon: Sun,
    color: '#D4A574',
    bg: 'linear-gradient(135deg, rgba(212,165,116,0.12) 0%, rgba(196,75,43,0.04) 100%)',
    link: '/products?category=Skirts',
    tag: 'Sunny Days',
  },
];

export function OccasionFinderSection() {
  return (
    <section className="section-block" style={{ background: 'transparent', padding: '56px 0' }}>
      <div className="container">
        <div className="monic-section-top-row" style={{ marginBottom: 28 }}>
          <div>
            <h2 className="monic-section-title">Shop by Occasion &amp; Mood</h2>
            <p className="monic-section-sub">Curated styling inspiration tailored for every moment</p>
          </div>
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
                  background: 'rgba(255, 255, 255, 0.78)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                  borderRadius: 20,
                  padding: '26px 22px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
                  boxShadow: '0 6px 24px rgba(196, 75, 43, 0.06)',
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

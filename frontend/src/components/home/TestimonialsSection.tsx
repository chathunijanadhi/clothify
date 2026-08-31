import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Dilini Senanayake',
    location: 'Colombo, Sri Lanka',
    rating: 5,
    title: 'Flawless tailoring & premium fabric',
    comment: 'The quality of the Linen Maxi Dress exceeded all my expectations! The cut is flattering, the stitching is impeccable, and delivery arrived the very next day.',
    itemPurchased: 'Linen Belted Maxi Dress',
    avatar: 'DS',
    verified: true,
  },
  {
    id: 2,
    name: 'Kavinda Perera',
    location: 'Kandy, Sri Lanka',
    rating: 5,
    title: 'Best men\'s formal shirts I own',
    comment: 'Ordered two slim-fit oxford shirts for work. They hold shape brilliantly after multiple washes and breathe well in the humidity. 10/10 recommend!',
    itemPurchased: 'Classic Oxford Button-Down',
    avatar: 'KP',
    verified: true,
  },
  {
    id: 3,
    name: 'Ananya Fernando',
    location: 'Galle, Sri Lanka',
    rating: 5,
    title: 'Seamless bank transfer checkout',
    comment: 'I uploaded my bank deposit slip directly during checkout and the order was verified and confirmed within 15 minutes. Truly impressive customer support!',
    itemPurchased: 'Relaxed Wide-Leg Trousers',
    avatar: 'AF',
    verified: true,
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-block" style={{ background: 'var(--panel-soft)' }}>
      <div className="container">
        <div className="section-heading" style={{ textAlign: 'center' }}>
          <p>Real Stories &amp; Feedback</p>
          <h2>Loved by <span>Our Shoppers</span></h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: 'var(--panel)',
                borderRadius: 20,
                padding: '28px 24px',
                border: '1.5px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              <div>
                {/* Rating stars & Quote */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <Quote size={24} style={{ color: 'var(--accent)', opacity: 0.25 }} />
                </div>

                <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 800 }}>
                  "{rev.title}"
                </h3>
                <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {rev.comment}
                </p>
              </div>

              <div>
                {/* Purchased tag */}
                <div style={{ fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 700, marginBottom: 12 }}>
                  Purchased: {rev.itemPurchased}
                </div>

                {/* Author row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'var(--grad-accent)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {rev.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.92rem' }}>
                      {rev.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)', fontSize: '0.74rem' }}>
                      {rev.location} {rev.verified && <span style={{ color: 'var(--accent-3)', fontWeight: 700 }}>• Verified Buyer ✓</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import * as reviewService from '../../services/review.service';

interface TestimonialItem {
  id: string | number;
  name: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  itemPurchased: string;
  avatar: string;
  verified: boolean;
}

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadReviews() {
      try {
        const data = await reviewService.getFeaturedReviews(3);
        if (mounted && Array.isArray(data) && data.length > 0) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Failed to load featured reviews:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadReviews();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading && reviews.length === 0) {
    return null;
  }
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

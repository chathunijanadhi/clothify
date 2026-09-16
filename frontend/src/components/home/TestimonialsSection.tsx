import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import * as reviewService from '../../services/review.service';

interface TestimonialItem {
  id: string | number;
  name: string;
  location: string;
  rating: number;
  title?: string;
  comment: string;
  itemPurchased?: string;
  initials: string;
  isFeatured?: boolean;
}

function SkeletonReview() {
  return (
    <div className="monic-test-card" style={{ pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--panel-soft)', animation: 'shimmer 1.4s ease infinite' }} />
        ))}
      </div>
      <div style={{ height: 14, borderRadius: 8, background: 'var(--panel-soft)', width: '90%', animation: 'shimmer 1.4s ease infinite', marginBottom: 8 }} />
      <div style={{ height: 14, borderRadius: 8, background: 'var(--panel-soft)', width: '75%', animation: 'shimmer 1.4s ease infinite', marginBottom: 8 }} />
      <div style={{ height: 14, borderRadius: 8, background: 'var(--panel-soft)', width: '60%', animation: 'shimmer 1.4s ease infinite', marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--panel-soft)', animation: 'shimmer 1.4s ease infinite', flexShrink: 0 }} />
        <div>
          <div style={{ height: 13, borderRadius: 8, background: 'var(--panel-soft)', width: 80, animation: 'shimmer 1.4s ease infinite', marginBottom: 6 }} />
          <div style={{ height: 11, borderRadius: 8, background: 'var(--panel-soft)', width: 60, animation: 'shimmer 1.4s ease infinite' }} />
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      const data = await reviewService.getFeaturedReviews(3);
      if (Array.isArray(data) && data.length > 0) {
        const mapped: TestimonialItem[] = data.slice(0, 3).map((r: any) => {
          const rawName = r.name || r.userName || 'Fashion Enthusiast';
          const initials = r.avatar || r.userInitials || rawName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'FE';
          const comment = r.comment || r.reviewText || '';
          return {
            id: r.id,
            name: rawName,
            location: r.location || (r.isVerified || r.verified ? 'Verified Buyer' : 'Clothify Member'),
            rating: Math.min(5, Math.max(1, Math.round(Number(r.rating || 5)))),
            title: r.title || '',
            comment,
            itemPurchased: r.productName || r.itemPurchased || 'Clothify Experience',
            initials,
            isFeatured: Boolean(r.isFeatured),
          };
        });
        setReviews(mapped);
      } else {
        setReviews([]);
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <section className="section-block" style={{ padding: '56px 0', background: 'transparent' }}>
      <div className="container">
        {/* Header */}
        <div className="monic-section-top-row">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Sparkles size={14} color="var(--accent)" />
              <span className="eyebrow" style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Curated Community Reviews
              </span>
            </div>
            <h2 className="monic-section-title">What Our Customers Say</h2>
            <p className="monic-section-sub">Genuine experiences from verified Clothify shoppers across Sri Lanka</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/products" className="monic-view-all-link">
              Shop Collection <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Cards Grid (Max 3 reviews displayed in balanced 3-column layout) */}
        {loading ? (
          <div className="monic-testimonials-grid">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonReview key={i} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Sparkles size={24} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', margin: '0 0 6px', fontWeight: 800 }}>Delivering Excellence Daily</h3>
            <p style={{ color: 'var(--muted)', maxWidth: 360, margin: '0 auto', fontSize: '0.88rem' }}>
              Customer feedbacks for delivered orders are curated and displayed here.
            </p>
            <Link
              to="/products"
              className="btn btn-primary"
              style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <ShoppingBag size={16} /> Explore Collection
            </Link>
          </div>
        ) : (
          <div className="monic-testimonials-grid">
            {reviews.map((rev) => (
              <div key={rev.id} className="monic-test-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div className="monic-test-stars">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="#F59E0B" stroke="none" />
                      ))}
                      {Array.from({ length: 5 - rev.rating }).map((_, i) => (
                        <Star key={`e${i}`} size={14} fill="none" stroke="#D4A574" />
                      ))}
                    </div>
                    {rev.isFeatured && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          padding: '2px 8px',
                          borderRadius: 999,
                          border: '1px solid rgba(196, 75, 43, 0.18)',
                        }}
                      >
                        ★ Featured
                      </span>
                    )}
                  </div>

                  {rev.title && (
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--primary)', marginBottom: 6 }}>
                      {rev.title}
                    </strong>
                  )}

                  {rev.comment && (
                    <p className="monic-test-quote" style={{ margin: '0 0 16px' }}>
                      "{rev.comment}"
                    </p>
                  )}
                </div>

                <div className="monic-test-author">
                  <div className="monic-test-avatar">{rev.initials}</div>
                  <div>
                    <h4 className="monic-test-name">{rev.name}</h4>
                    <p className="monic-test-loc">
                      {rev.location} {rev.itemPurchased ? `· ${rev.itemPurchased}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}



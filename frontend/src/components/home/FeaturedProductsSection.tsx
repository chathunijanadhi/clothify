import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Flame, Tag } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import type { UIProduct, Product as BackendProduct } from '../../types/product.types';
import * as productService from '../../services/product.service';

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'deals'>('trending');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const raw = await productService.getProducts({ limit: 12 });
        if (mounted) {
          const transformed: UIProduct[] = raw.map((p: BackendProduct) => {
            const rawPrice = Number(p.price || 0);
            const discountNum = Number(p.discount_percentage || 0);
            const finalPrice = discountNum > 0 ? Math.round(rawPrice * (1 - discountNum / 100)) : rawPrice;
            const sizes = p.variants ? Array.from(new Set(p.variants.map((v) => v.size))) : [];
            const colors = p.variants ? Array.from(new Set(p.variants.map((v) => v.color))) : [];
            const firstImg = p.images && p.images.length > 0 ? p.images[0].image_url : undefined;

            return {
              id: p.id,
              name: p.name,
              category: p.category_name || 'Fashion',
              description: p.description,
              brand: p.brand || 'Clothify Exclusive',
              price: finalPrice,
              oldPrice: discountNum > 0 ? rawPrice : undefined,
              discount: discountNum > 0 ? discountNum : undefined,
              rating: Number(p.rating || 4.8),
              reviewCount: p.review_count || 12,
              image: firstImg || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg',
              sizes,
              colors,
              stock: p.stock_quantity || 10,
            };
          });
          setProducts(transformed);
        }
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const displayedProducts = useMemo(() => {
    if (activeTab === 'deals') {
      const deals = products.filter((p) => p.discount && p.discount > 0);
      return deals.length ? deals.slice(0, 8) : products.slice(0, 8);
    }
    if (activeTab === 'new') {
      return [...products].reverse().slice(0, 8);
    }
    return products.slice(0, 8);
  }, [products, activeTab]);

  return (
    <section className="section-block" style={{ background: 'var(--bg)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} /> Handpicked For You
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', color: 'var(--primary)', margin: '6px 0 0', fontWeight: 800 }}>
              Curated <span className="gradient-text">Favorites</span>
            </h2>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, background: 'var(--panel)', padding: 5, borderRadius: 999, border: '1px solid var(--border)' }}>
            <button
              type="button"
              className={`tag ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={() => setActiveTab('trending')}
              style={{ padding: '8px 16px', borderRadius: 999, fontSize: '0.84rem' }}
            >
              <Flame size={13} /> Trending
            </button>
            <button
              type="button"
              className={`tag ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
              style={{ padding: '8px 16px', borderRadius: 999, fontSize: '0.84rem' }}
            >
              <Sparkles size={13} /> New Drops
            </button>
            <button
              type="button"
              className={`tag ${activeTab === 'deals' ? 'active' : ''}`}
              onClick={() => setActiveTab('deals')}
              style={{ padding: '8px 16px', borderRadius: 999, fontSize: '0.84rem' }}
            >
              <Tag size={13} /> Special Deals
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="loader" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading latest collection…</p>
          </div>
        ) : displayedProducts.length ? (
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, background: 'var(--panel)', borderRadius: 18, border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--muted)' }}>No products found in this category.</p>
          </div>
        )}

        {/* View all footer CTA */}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link to="/products" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
            View Full Catalog ({products.length > 0 ? products.length : '100+'} Styles) <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

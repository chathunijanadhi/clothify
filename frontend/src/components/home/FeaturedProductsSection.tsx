import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import type { UIProduct, Product as BackendProduct } from '../../types/product.types';
import * as productService from '../../services/product.service';

const FILTER_TABS = [
  { key: 'all',       label: 'Top Selling'   },
  { key: 'week',      label: 'New Arrivals'  },
  { key: 'nova',      label: 'Premium Picks' },
  { key: 'favorites', label: 'Top Rated'     },
  { key: 'discount',  label: 'Best Deals'    },
];

function SkeletonCard() {
  return (
    <div className="monic-product-card" style={{ pointerEvents: 'none' }}>
      <div className="monic-product-img-box" style={{ background: 'var(--panel-soft)', animation: 'shimmer 1.4s ease infinite' }} />
      <div className="monic-product-info" style={{ gap: 10, padding: '14px 16px' }}>
        <div style={{ height: 14, borderRadius: 8, background: 'var(--panel-soft)', width: '70%', animation: 'shimmer 1.4s ease infinite' }} />
        <div style={{ height: 12, borderRadius: 8, background: 'var(--panel-soft)', width: '90%', animation: 'shimmer 1.4s ease infinite', marginTop: 6 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <div style={{ height: 18, borderRadius: 8, background: 'var(--panel-soft)', width: '32%', animation: 'shimmer 1.4s ease infinite' }} />
          <div style={{ height: 32, borderRadius: 999, background: 'var(--panel-soft)', width: '38%', animation: 'shimmer 1.4s ease infinite' }} />
        </div>
      </div>
    </div>
  );
}

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const raw = await productService.getProducts({ limit: 100 });
        if (!mounted) return;
        if (Array.isArray(raw) && raw.length > 0) {
          const transformed: UIProduct[] = raw.map((p: BackendProduct) => {
            const rawPrice    = Number(p.price || 0);
            const discountNum = Number(p.discount_percentage || 0);
            const finalPrice  = Number(p.final_price) || (discountNum > 0 ? Math.round(rawPrice * (1 - discountNum / 100)) : rawPrice);
            const sizes  = p.variants ? Array.from(new Set(p.variants.map((v) => v.size).filter(Boolean))) : [];
            const colors = p.variants ? Array.from(new Set(p.variants.map((v) => v.color).filter(Boolean))) : [];
            const firstImg = p.images && p.images.length > 0 ? p.images[0].image_url : undefined;
            return {
              id:          p.id,
              name:        p.name,
              category:    p.category_name || 'Fashion',
              segment:     p.segment || null,
              description: p.description,
              brand:       p.brand || 'Clothify',
              price:       finalPrice,
              oldPrice:    discountNum > 0 ? rawPrice : undefined,
              discount:    discountNum > 0 ? discountNum : undefined,
              rating:      Number(p.rating || 4.5),
              reviewCount: p.review_count || 0,
              image:       firstImg || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg',
              sizes,
              colors,
              stock:       p.stock_quantity || 0,
            };
          });
          setProducts(transformed);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load featured products', err);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const displayedProducts = useMemo(() => {
    if (products.length === 0) return [];
    switch (activeTab) {
      case 'nova':
        return [...products].sort((a, b) => b.price - a.price).slice(0, 8);
      case 'favorites':
        return [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
      case 'discount':
        return [...products].filter((p) => (p.discount || 0) > 0)
          .sort((a, b) => (b.discount || 0) - (a.discount || 0)).slice(0, 8);
      case 'week':
        return [...products].reverse().slice(0, 8);
      default:
        return products.slice(0, 8);
    }
  }, [products, activeTab]);

  return (
    <section className="section-block" style={{ padding: '56px 0' }}>
      <div className="container">
        {/* Section Header */}
        <div className="monic-section-top-row">
          <div>
            <h2 className="monic-section-title">Top Selling Products</h2>
            <p className="monic-section-sub">Curated premium fashion for every style &amp; season</p>
          </div>
          <Link to="/products" className="monic-view-all-link">
            View all Products <ArrowRight size={15} />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="monic-filter-pills">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`monic-filter-pill ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="monic-product-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <ShoppingBag size={28} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: '0 0 8px', fontWeight: 800 }}>No products found</h3>
            <p style={{ color: 'var(--muted)', maxWidth: 360, margin: '0 auto', fontSize: '0.92rem' }}>Our catalog is being updated. Check back soon for fresh arrivals.</p>
            <Link to="/products" className="monic-btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
              Browse All <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="monic-product-grid">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


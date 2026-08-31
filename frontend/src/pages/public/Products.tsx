import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  X,
  RotateCcw,
  Sparkles,
  Filter,
} from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import type { UIProduct, Product as BackendProduct, Category } from '../../types/product.types';
import * as productService from '../../services/product.service';

const CATEGORIES = [
  'All',
  'T-Shirts',
  'Shirts',
  'Dresses',
  'Jackets',
  'Jeans',
  'Trousers',
  'Skirts',
  'Blouses',
];

const SEGMENTS = ['All', 'Men', 'Women', 'Kids'] as const;

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') ?? 'All';
  const initialSegment = searchParams.get('segment') ?? 'All';
  const initialSearch = searchParams.get('search') ?? '';

  const [selectedType, setSelectedType] = useState(initialCategory);
  const [selectedSegment, setSelectedSegment] = useState(initialSegment);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendProducts, setBackendProducts] = useState<BackendProduct[]>([]);
  const [_categories, setCategories] = useState<Category[]>([]);

  // Sync state with URL params
  useEffect(() => {
    const s = searchParams.get('segment') ?? 'All';
    const c = searchParams.get('category') ?? 'All';
    const q = searchParams.get('search') ?? '';
    setSelectedSegment(s);
    setSelectedType(c);
    setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = { limit: 100 };
        if (selectedSegment && selectedSegment !== 'All') params.segment = selectedSegment;
        if (selectedType && selectedType !== 'All') params.category = selectedType;
        const [products, cats] = await Promise.all([
          productService.getProducts(params),
          productService.getCategories(),
        ]);
        if (!mounted) return;
        setBackendProducts(products);
        setCategories(cats);
      } catch (err) {
        console.error(err);
        setError('Unable to load products. Please try again.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [selectedSegment, selectedType]);

  // map backend products to UIProduct
  const uiProducts: UIProduct[] = useMemo(() => {
    return backendProducts.map((p) => {
      const price = Number(p.final_price || p.price || 0);
      const oldPrice = Number(p.price || 0);
      const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;
      return {
        id: p.id,
        name: p.name,
        category: p.category_name || '',
        description: p.description ?? undefined,
        brand: p.brand ?? undefined,
        price,
        oldPrice: oldPrice && oldPrice !== price ? oldPrice : undefined,
        discount,
        rating: Number(p.rating || 0),
        reviewCount: p.review_count || 0,
        image: p.images && p.images.length ? p.images[0].image_url : undefined,
        sizes: p.variants ? Array.from(new Set(p.variants.map((v) => v.size))) : [],
        colors: p.variants ? Array.from(new Set(p.variants.map((v) => v.color))) : [],
        stock: p.stock_quantity || 0,
      };
    });
  }, [backendProducts]);

  const filteredProducts = useMemo(() => {
    const list = uiProducts.filter((product) => {
      const matchesType = selectedType === 'All' || product.category === selectedType;
      const matchesSearch = !search || product.name.toLowerCase().includes(search.toLowerCase());
      const matchesPrice = maxPrice ? product.price <= maxPrice : true;
      return matchesType && matchesSearch && matchesPrice;
    });

    switch (sortBy) {
      case 'low-high':
        return [...list].sort((a, b) => a.price - b.price);
      case 'high-low':
        return [...list].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating);
      default:
        return list;
    }
  }, [uiProducts, search, selectedType, sortBy, maxPrice]);

  const clearAllFilters = () => {
    setSelectedSegment('All');
    setSelectedType('All');
    setSearch('');
    setMaxPrice(null);
    setSearchParams({});
  };

  const hasActiveFilters = selectedSegment !== 'All' || selectedType !== 'All' || search || maxPrice !== null;

  return (
    <div className="page-shell">
      <div className="container product-page">
        {/* Breadcrumbs */}
        <div className="cf-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/products">Shop</Link>
          {selectedSegment !== 'All' && (
            <>
              <span className="breadcrumb-sep">/</span>
              <span>{selectedSegment}</span>
            </>
          )}
          {selectedType !== 'All' && (
            <>
              <span className="breadcrumb-sep">/</span>
              <span className="active">{selectedType}</span>
            </>
          )}
        </div>

        {/* Page Header */}
        <div className="page-header">
          <div>
            <p className="eyebrow">
              <Sparkles size={13} />
              {selectedSegment !== 'All' ? `${selectedSegment}'s Collection` : 'All Collections'}
            </p>
            <h1>Browse Our Styles</h1>
          </div>

          <div className="sort-box">
            <label htmlFor="sort" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              style={{ fontWeight: 600 }}
            >
              <option value="featured">✨ Featured &amp; Trending</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* Segment Tabs Strip */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 24,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          {SEGMENTS.map((seg) => {
            const isSelected = selectedSegment === seg;
            return (
              <button
                key={seg}
                type="button"
                className={`tag ${isSelected ? 'active' : ''}`}
                style={{
                  padding: '10px 20px',
                  borderRadius: 999,
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                  background: isSelected ? 'var(--grad-accent)' : 'var(--panel)',
                  color: isSelected ? 'white' : 'var(--primary)',
                  boxShadow: isSelected ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  setSelectedSegment(seg);
                  setSearchParams(seg === 'All' ? {} : { segment: seg });
                }}
              >
                {seg === 'All' ? '🌟 All Styles' : `${seg}'s Fashion`}
              </button>
            );
          })}
        </div>

        <div className="shop-layout">
          {/* ── Left Filter Sidebar ── */}
          <aside className="filter-panel">
            <div className="filter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={18} color="var(--accent)" />
                <strong>Filter Items</strong>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>

            {/* Search Filter */}
            <div className="filter-group">
              <label>Search Keyword</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Search size={15} />
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="e.g. linen shirt, summer dress"
                  className="auth-input-element"
                  style={{ minHeight: 42, paddingLeft: 36, paddingRight: search ? 30 : 12 }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="auth-input-action"
                    style={{ right: 8 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label>Category</label>
              <div className="tag-row">
                {CATEGORIES.map((category) => {
                  const isActive = selectedType === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      className={`tag ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedType(category)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter Quick Chips */}
            <div className="filter-group">
              <label>Price Range</label>
              <div className="tag-row">
                <button
                  type="button"
                  className={`tag ${maxPrice === null ? 'active' : ''}`}
                  onClick={() => setMaxPrice(null)}
                >
                  All Prices
                </button>
                <button
                  type="button"
                  className={`tag ${maxPrice === 3000 ? 'active' : ''}`}
                  onClick={() => setMaxPrice(3000)}
                >
                  Under 3K
                </button>
                <button
                  type="button"
                  className={`tag ${maxPrice === 6000 ? 'active' : ''}`}
                  onClick={() => setMaxPrice(6000)}
                >
                  Under 6K
                </button>
                <button
                  type="button"
                  className={`tag ${maxPrice === 10000 ? 'active' : ''}`}
                  onClick={() => setMaxPrice(10000)}
                >
                  Under 10K
                </button>
              </div>
            </div>

            {/* Popular Size Filters */}
            <div className="filter-group">
              <label>Popular Sizes</label>
              <div className="tag-row">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <span
                    key={size}
                    className="tag"
                    style={{ minWidth: 34, textAlign: 'center', cursor: 'default' }}
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Catalog Main Panel ── */}
          <main className="catalog-panel">
            <div className="catalog-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Style' : 'Styles'} Available
                </span>
                {hasActiveFilters && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    (Filtered view)
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  Clear All Filters <X size={14} />
                </button>
              )}
            </div>

            {/* Product Grid */}
            {loading ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <div className="loader" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Curating collection...</p>
              </div>
            ) : error ? (
              <div
                style={{
                  background: 'var(--panel)',
                  padding: 40,
                  borderRadius: 20,
                  textAlign: 'center',
                  border: '1px solid var(--border)',
                }}
              >
                <p style={{ color: '#ef4444', fontWeight: 700, marginBottom: 16 }}>{error}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                style={{
                  background: 'var(--panel)',
                  padding: '60px 20px',
                  borderRadius: 24,
                  textAlign: 'center',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'var(--panel-soft)',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 16px',
                    color: 'var(--muted)',
                  }}
                >
                  <Filter size={26} />
                </div>
                <h3 style={{ margin: '0 0 8px', color: 'var(--primary)' }}>No styles match your filters</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 20px' }}>
                  Try relaxing your search terms, changing the category, or clearing active filters to view all products.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={clearAllFilters}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="product-grid product-grid--wide">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}


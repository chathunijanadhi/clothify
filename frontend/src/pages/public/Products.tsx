import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  X,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  ShoppingBag,
  Grid2X2,
  Square,
} from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import type { UIProduct, Product as BackendProduct } from '../../types/product.types';
import * as productService from '../../services/product.service';

const SEGMENTS = ['All', 'Men', 'Women', 'Kids'] as const;
type SegmentType = (typeof SEGMENTS)[number];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const segmentLabel = (segment: SegmentType) => (segment === 'Kids' ? "Kids'" : `${segment}'s`);

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const segmentParam = (searchParams.get('segment') as SegmentType) || 'All';
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';

  const [selectedSegment, setSelectedSegment] = useState<SegmentType>(segmentParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [search, setSearch] = useState(searchParam);
  const [sortBy, setSortBy] = useState('featured');

  // Mobile UX state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'two' | 'one'>('two');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<UIProduct[]>([]);

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  // Sync state with URL params when they change externally
  useEffect(() => {
    const s = (searchParams.get('segment') as SegmentType) || 'All';
    const c = searchParams.get('category') || 'All';
    const q = searchParams.get('search') || '';
    setSelectedSegment(s);
    setSelectedCategory(c);
    setSearch(q);
  }, [searchParams]);

  // Load all products from API
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const rawProducts = await productService.getProducts({ limit: 200 });

        if (!mounted) return;

        const transformed: UIProduct[] = rawProducts.map((p: BackendProduct) => {
          const rawPrice = Number(p.price || 0);
          const discountNum = Number(p.discount_percentage || 0);
          const finalPrice = Number(p.final_price) || (discountNum > 0 ? Math.round(rawPrice * (1 - discountNum / 100)) : rawPrice);
          const sizes = p.variants ? Array.from(new Set(p.variants.map((v) => v.size).filter(Boolean))) : [];
          const colors = p.variants ? Array.from(new Set(p.variants.map((v) => v.color).filter(Boolean))) : [];
          const image = p.images && p.images.length > 0 ? p.images[0].image_url : undefined;

          // Normalize segment
          let segmentVal = p.segment || null;
          if (!segmentVal) {
            const lowerName = (p.name || '').toLowerCase();
            const lowerCat = (p.category_name || '').toLowerCase();
            if (lowerName.includes('kid') || lowerCat.includes('kid')) segmentVal = 'Kids';
            else if (lowerName.includes('men') || lowerName.includes('shirt') || lowerCat.includes('men')) segmentVal = 'Men';
            else segmentVal = 'Women';
          }

          return {
            id: p.id,
            name: p.name,
            category: p.category_name || 'Fashion',
            segment: segmentVal,
            description: p.description,
            brand: p.brand || 'Clothify',
            price: finalPrice,
            oldPrice: discountNum > 0 ? rawPrice : undefined,
            discount: discountNum > 0 ? discountNum : undefined,
            rating: Number(p.rating || 4.8),
            reviewCount: p.review_count || 12,
            image: image || 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg',
            sizes,
            colors,
            stock: p.stock_quantity ?? 10,
          };
        });

        setAllProducts(transformed);
      } catch (err) {
        console.error('Failed to load catalog products', err);
        setError('Unable to load catalog products. Please check your connection.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter pool by selected segment first
  const segmentProducts = useMemo(() => {
    if (selectedSegment === 'All') return allProducts;
    return allProducts.filter((p) => {
      const seg = (p.segment || '').toLowerCase();
      return seg === selectedSegment.toLowerCase();
    });
  }, [allProducts, selectedSegment]);

  // Derive available categories dynamically for current segment
  const dynamicCategories = useMemo(() => {
    const categoryCounts = new Map<string, number>();

    segmentProducts.forEach((p) => {
      const cat = p.category?.trim();
      if (cat) {
        categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
      }
    });

    const categoryList = Array.from(categoryCounts.keys()).sort();
    return [
      { name: 'All', count: segmentProducts.length },
      ...categoryList.map((name) => ({
        name,
        count: categoryCounts.get(name) || 0,
      })),
    ];
  }, [segmentProducts]);

  // Automatically reset category if selected category has no items in the active segment
  useEffect(() => {
    if (selectedCategory !== 'All') {
      const exists = dynamicCategories.some((c) => c.name.toLowerCase() === selectedCategory.toLowerCase() && c.count > 0);
      if (!exists && dynamicCategories.length > 0) {
        setSelectedCategory('All');
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('category');
        setSearchParams(nextParams);
      }
    }
  }, [selectedSegment, dynamicCategories, selectedCategory, searchParams, setSearchParams]);

  // Derive size counts for the current segment & category
  const sizeAvailability = useMemo(() => {
    const counts = new Map<string, number>();
    SIZES.forEach((s) => counts.set(s, 0));

    segmentProducts.forEach((p) => {
      if (selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase()) {
        (p.sizes || []).forEach((sz) => {
          const upper = sz.toUpperCase();
          if (counts.has(upper)) {
            counts.set(upper, (counts.get(upper) || 0) + 1);
          }
        });
      }
    });

    return counts;
  }, [segmentProducts, selectedCategory]);

  // Compute final filtered products
  const filteredProducts = useMemo(() => {
    const list = segmentProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      const searchTerms = search.toLowerCase().trim();
      const matchesSearch =
        !searchTerms ||
        product.name.toLowerCase().includes(searchTerms) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerms)) ||
        product.category.toLowerCase().includes(searchTerms) ||
        (product.description && product.description.toLowerCase().includes(searchTerms));

      const matchesPrice = maxPrice === null || product.price <= maxPrice;

      const matchesSize =
        !selectedSize ||
        (product.sizes && product.sizes.map((s) => s.toUpperCase()).includes(selectedSize.toUpperCase()));

      const matchesStock = !inStockOnly || product.stock > 0;

      return matchesCategory && matchesSearch && matchesPrice && matchesSize && matchesStock;
    });

    switch (sortBy) {
      case 'low-high':
        return [...list].sort((a, b) => a.price - b.price);
      case 'high-low':
        return [...list].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating);
      case 'discount':
        return [...list].sort((a, b) => (b.discount || 0) - (a.discount || 0));
      case 'featured':
      default:
        return list;
    }
  }, [segmentProducts, selectedCategory, search, maxPrice, selectedSize, inStockOnly, sortBy]);

  const handleSegmentChange = (seg: SegmentType) => {
    setSelectedSegment(seg);
    setSelectedCategory('All');
    const nextParams = new URLSearchParams(searchParams);
    if (seg === 'All') {
      nextParams.delete('segment');
    } else {
      nextParams.set('segment', seg);
    }
    nextParams.delete('category');
    setSearchParams(nextParams);
  };

  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    const nextParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', catName);
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSelectedSegment('All');
    setSelectedCategory('All');
    setSelectedSize(null);
    setMaxPrice(null);
    setInStockOnly(false);
    setSearch('');
    setSearchParams({});
  };

  const activeFilterCount =
    (selectedSegment !== 'All' ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedSize !== null ? 1 : 0) +
    (maxPrice !== null ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (search ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  // Reusable Filter Body controls
  const renderFilterControls = () => (
    <>
      {/* Keyword Search */}
      <div className="filter-group">
        <label>Search Keyword</label>
        <div className="auth-input-wrapper">
          <span className="auth-input-icon">
            <Search size={15} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Linen, Cotton, Dress..."
            className="auth-input-element"
            style={{ minHeight: 40, paddingLeft: 36, paddingRight: search ? 30 : 12 }}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                const next = new URLSearchParams(searchParams);
                next.delete('search');
                setSearchParams(next);
              }}
              className="auth-input-action"
              style={{ right: 8 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Sort selection (inside mobile filter drawer) */}
      <div className="filter-group show-in-drawer-only">
        <label>Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="auth-input-element"
          style={{ paddingLeft: 14 }}
        >
          <option value="featured">✨ Featured &amp; Trending</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
          <option value="rating">Top Customer Rated (★)</option>
          <option value="discount">Biggest Discounts (%)</option>
        </select>
      </div>

      {/* Categories */}
      <div className="filter-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label>Category ({selectedSegment})</label>
          <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600 }}>
            {dynamicCategories.length - 1} options
          </span>
        </div>
        <div className="tag-row">
          {dynamicCategories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                type="button"
                className={`tag ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.name)}
                style={{
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{cat.name}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: isActive ? 'var(--accent)' : 'var(--border)',
                    color: isActive ? 'white' : 'var(--muted)',
                    padding: '1px 6px',
                    borderRadius: 999,
                    fontWeight: 800,
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="filter-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label>Filter By Size</label>
          {selectedSize && (
            <button
              type="button"
              onClick={() => setSelectedSize(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear Size
            </button>
          )}
        </div>
        <div className="tag-row">
          {SIZES.map((size) => {
            const isSelected = selectedSize === size;
            const count = sizeAvailability.get(size) || 0;
            const isDisabled = count === 0;

            return (
              <button
                key={size}
                type="button"
                className={`tag ${isSelected ? 'active' : ''}`}
                disabled={isDisabled}
                onClick={() => setSelectedSize(isSelected ? null : size)}
                style={{
                  minWidth: 42,
                  textAlign: 'center',
                  padding: '7px 10px',
                  fontWeight: 800,
                  opacity: isDisabled ? 0.35 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                title={`${count} styles in size ${size}`}
              >
                <span>{size}</span>
                <span style={{ fontSize: '0.64rem', opacity: 0.75 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <label>Budget / Price Range</label>
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
            onClick={() => setMaxPrice(maxPrice === 3000 ? null : 3000)}
          >
            Under 3K
          </button>
          <button
            type="button"
            className={`tag ${maxPrice === 6000 ? 'active' : ''}`}
            onClick={() => setMaxPrice(maxPrice === 6000 ? null : 6000)}
          >
            Under 6K
          </button>
          <button
            type="button"
            className={`tag ${maxPrice === 10000 ? 'active' : ''}`}
            onClick={() => setMaxPrice(maxPrice === 10000 ? null : 10000)}
          >
            Under 10K
          </button>
        </div>
      </div>

      {/* In Stock Only */}
      <div className="filter-group" style={{ marginTop: 14 }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'var(--primary)',
          }}
        >
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <span>In Stock Only ({segmentProducts.filter((p) => p.stock > 0).length})</span>
        </label>
      </div>
    </>
  );

  return (
    <div className="page-shell">
      <div className="container product-page">
        {/* Breadcrumbs */}
        <div className="cf-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/products" onClick={clearAllFilters}>Shop Catalog</Link>
          {selectedSegment !== 'All' && (
            <>
              <span className="breadcrumb-sep">/</span>
              <span className={selectedCategory === 'All' ? 'active' : ''}>
                {segmentLabel(selectedSegment)} Fashion
              </span>
            </>
          )}
          {selectedCategory !== 'All' && (
            <>
              <span className="breadcrumb-sep">/</span>
              <span className="active">{selectedCategory}</span>
            </>
          )}
        </div>

        {/* Page Header */}
        <div className="page-header">
          <div>
            <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} />
              {selectedSegment !== 'All' ? `${segmentLabel(selectedSegment)} Collection` : 'All Seasonal Collections'}
            </p>
            <h1>
              {selectedSegment === 'All'
                ? 'Curated Wardrobe'
                : `${segmentLabel(selectedSegment)} Style Collection`}
            </h1>
          </div>

          <div className="sort-box hide-on-mobile">
            <label htmlFor="sort" style={{ fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <ArrowUpDown size={14} /> Sort:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ fontWeight: 600, padding: '9px 14px', borderRadius: 12 }}
            >
              <option value="featured">✨ Featured &amp; Trending</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="rating">Top Customer Rated (★)</option>
              <option value="discount">Biggest Discounts (%)</option>
            </select>
          </div>
        </div>

        {/* ── Segment Tabs Bar (Horizontal swipeable) ── */}
        <div className="segment-tabs-wrap">
          {SEGMENTS.map((seg) => {
            const isSelected = selectedSegment === seg;
            const count =
              seg === 'All'
                ? allProducts.length
                : allProducts.filter((p) => (p.segment || '').toLowerCase() === seg.toLowerCase()).length;

            return (
              <button
                key={seg}
                type="button"
                className={`tag segment-pill ${isSelected ? 'active' : ''}`}
                onClick={() => handleSegmentChange(seg)}
              >
                <span>{seg === 'All' ? '🌟 All Styles' : `${segmentLabel(seg)} Fashion`}</span>
                <span className="segment-count-badge">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Mobile Filter Toolbar (Visible only on mobile/tablets) ── */}
        <div className="mobile-catalog-toolbar">
          <button
            type="button"
            className="mobile-filter-trigger-btn"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={17} color="var(--accent)" />
            <span>Filter &amp; Sort</span>
            {activeFilterCount > 0 && (
              <span className="mobile-filter-badge">{activeFilterCount}</span>
            )}
          </button>

          <div className="mobile-view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'two' ? 'active' : ''}`}
              onClick={() => setViewMode('two')}
              aria-label="2-column compact grid"
              title="2-column view"
            >
              <Grid2X2 size={18} />
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'one' ? 'active' : ''}`}
              onClick={() => setViewMode('one')}
              aria-label="1-column detailed card view"
              title="1-column view"
            >
              <Square size={18} />
            </button>
          </div>
        </div>

        {/* ── Quick Category Chips (Mobile Horizontal Scroll) ── */}
        <div className="mobile-category-scroll show-on-mobile">
          {dynamicCategories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                type="button"
                className={`mobile-cat-chip ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.name)}
              >
                {cat.name} ({cat.count})
              </button>
            );
          })}
        </div>

        {/* ── Active Filters Chips Bar ── */}
        {hasActiveFilters && (
          <div className="active-filters-bar">
            <span className="active-filters-label">Active:</span>

            {selectedSegment !== 'All' && (
              <button
                type="button"
                className="tag active filter-chip-removable"
                onClick={() => handleSegmentChange('All')}
              >
                Dept: {selectedSegment} <X size={13} />
              </button>
            )}

            {selectedCategory !== 'All' && (
              <button
                type="button"
                className="tag active filter-chip-removable"
                onClick={() => handleCategoryChange('All')}
              >
                Cat: {selectedCategory} <X size={13} />
              </button>
            )}

            {selectedSize && (
              <button
                type="button"
                className="tag active filter-chip-removable"
                onClick={() => setSelectedSize(null)}
              >
                Size: {selectedSize} <X size={13} />
              </button>
            )}

            {maxPrice !== null && (
              <button
                type="button"
                className="tag active filter-chip-removable"
                onClick={() => setMaxPrice(null)}
              >
                &le; LKR {maxPrice.toLocaleString()} <X size={13} />
              </button>
            )}

            {inStockOnly && (
              <button
                type="button"
                className="tag active filter-chip-removable"
                onClick={() => setInStockOnly(false)}
              >
                In Stock <X size={13} />
              </button>
            )}

            {search && (
              <button
                type="button"
                className="tag active filter-chip-removable"
                onClick={() => {
                  setSearch('');
                  const next = new URLSearchParams(searchParams);
                  next.delete('search');
                  setSearchParams(next);
                }}
              >
                "{search}" <X size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="clear-all-filters-btn"
            >
              <RotateCcw size={13} /> Clear
            </button>
          </div>
        )}

        <div className="shop-layout">
          {/* ── Desktop Left Filter Sidebar ── */}
          <aside className="filter-panel hide-on-mobile">
            <div className="filter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={18} color="var(--accent)" />
                <strong>Filter Styles</strong>
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

            {renderFilterControls()}
          </aside>

          {/* ── Catalog Main Grid ── */}
          <main className="catalog-panel">
            <div className="catalog-toolbar hide-on-mobile">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.02rem' }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Garment Style' : 'Garment Styles'} Found
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  (in {selectedSegment === 'All' ? 'All Collections' : `${segmentLabel(selectedSegment)} Collection`})
                </span>
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
                    fontSize: '0.86rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  Reset Filters <RotateCcw size={14} />
                </button>
              )}
            </div>

            {/* Products Rendering */}
            {loading ? (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <div className="loader" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading curated styles…</p>
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
                  Retry Loading
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                style={{
                  background: 'var(--panel)',
                  padding: '60px 24px',
                  borderRadius: 22,
                  textAlign: 'center',
                  border: '1.5px dashed var(--border)',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 18px',
                  }}
                >
                  <ShoppingBag size={26} />
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', margin: '0 0 8px', fontWeight: 800 }}>
                  No Garments Match Selected Filters
                </h3>
                <p style={{ color: 'var(--muted)', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.6, fontSize: '0.92rem' }}>
                  We couldn't find any {selectedSegment !== 'All' ? segmentLabel(selectedSegment) : ''} pieces under "{selectedCategory}". Try clearing your filters or exploring another style category.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={clearAllFilters}
                  style={{ padding: '12px 28px', fontSize: '0.92rem' }}
                >
                  <RotateCcw size={15} /> Show All Collections ({allProducts.length} Styles)
                </button>
              </div>
            ) : (
              <div className={`product-grid ${viewMode === 'one' ? 'view-single-col' : ''}`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter & Sort Drawer Modal ── */}
      {mobileFilterOpen && (
        <div className="mobile-filter-overlay" onClick={() => setMobileFilterOpen(false)}>
          <div
            className="mobile-filter-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Filter & Sort"
          >
            {/* Sheet Header */}
            <div className="mobile-filter-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <SlidersHorizontal size={20} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>Filter &amp; Sort</h3>
              </div>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 36, height: 36 }}
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sheet Scrollable Body */}
            <div className="mobile-filter-sheet-body">
              {renderFilterControls()}
            </div>

            {/* Sheet Sticky Footer */}
            <div className="mobile-filter-sheet-footer">
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn btn-secondary"
                style={{ flex: 1, minHeight: 46 }}
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-primary"
                style={{ flex: 2, minHeight: 46 }}
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  ChevronRight,
} from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import type { UIProduct, Product as BackendProduct } from '../../types/product.types';
import * as productService from '../../services/product.service';
import { Loader } from '../../components/common/Loader';

const SEGMENTS = ['All', 'Men', 'Women', 'Kids'] as const;
type SegmentType = (typeof SEGMENTS)[number];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const segmentLabel = (segment: SegmentType) => (segment === 'Kids' ? "Kids'" : `${segment}'s`);

const DEPT_METADATA: Record<SegmentType, {
  badge: string;
  titlePrefix: string;
  titleItalic: string;
  titleSuffix: string;
  subtitle: string;
  image: string;
  tags: string[];
}> = {
  All: {
    badge: '✦ Complete Seasonal Drop',
    titlePrefix: 'Curated',
    titleItalic: 'Wardrobe',
    titleSuffix: 'For Every Silhouette',
    subtitle: 'Explore our complete drops across Men’s, Women’s, and Kids’ collections. Ethically tailored with breathable linens and soft organic cottons.',
    image: '/images/summer-banner.jpg',
    tags: ['✨ 100% Organic Linens', '🚚 Free Shipping over LKR 10K', '🔄 30-Day Easy Returns'],
  },
  Men: {
    badge: "👔 Men's Collection",
    titlePrefix: 'Refined',
    titleItalic: 'Essentials',
    titleSuffix: '& Tailored Silhouettes',
    subtitle: 'From structured workwear shirts and crisp linen button-downs to relaxed weekend denim and everyday luxury tees.',
    image: '/images/mens-wear.jpg',
    tags: ['👔 Sharp Workwear', '🌿 Pure Linen Blends', '👖 Relaxed Denim'],
  },
  Women: {
    badge: "👗 Women's Collection",
    titlePrefix: 'Effortless',
    titleItalic: 'Elegance',
    titleSuffix: '& Contemporary Chic',
    subtitle: 'Breezy summer dresses, fluid silhouettes, tailored trousers, delicate blouses, and day-to-night statement ensembles.',
    image: '/images/womens-wear.jpg',
    tags: ['👗 Fluid Dresses', '✨ Chic Evening Wear', '🌾 Breathable Silhouettes'],
  },
  Kids: {
    badge: "🧸 Kids' Collection",
    titlePrefix: 'Playful',
    titleItalic: 'Comfort',
    titleSuffix: '& Gentle Organic Cotton',
    subtitle: 'Ultra-soft, pre-shrunk, tag-free everyday staples designed for endless play, daily comfort, and easy machine washing.',
    image: '/images/kids-wear.jpg',
    tags: ['🧸 100% Gentle Cotton', '🎨 Vibrant Colorways', '🧼 Machine Washable'],
  },
};

const DEPT_CARDS: Array<{ key: SegmentType; label: string; icon: string; image: string }> = [
  { key: 'All', label: 'All Garments', icon: '🌟', image: '/images/summer-banner.jpg' },
  { key: 'Men', label: "Men's Wear", icon: '👔', image: '/images/mens-wear.jpg' },
  { key: 'Women', label: "Women's Wear", icon: '👗', image: '/images/womens-wear.jpg' },
  { key: 'Kids', label: "Kids' Wear", icon: '🧸', image: '/images/kids-wear.jpg' },
];

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
      <div className="shop-filter-section">
        <span className="shop-filter-label">Search</span>
        <div className="shop-search-box">
          <Search size={15} className="shop-search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Dress, Linen, Cotton…"
            className="shop-search-input"
          />
          {search && (
            <button
              type="button"
              className="shop-search-clear"
              onClick={() => {
                setSearch('');
                const next = new URLSearchParams(searchParams);
                next.delete('search');
                setSearchParams(next);
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="shop-filter-divider" />

      {/* Sort — inside mobile drawer only */}
      <div className="shop-filter-section show-in-drawer-only">
        <span className="shop-filter-label">Sort By</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="shop-sort-select"
          style={{ width: '100%' }}
        >
          <option value="featured">✨ Featured</option>
          <option value="low-high">Price: Low → High</option>
          <option value="high-low">Price: High → Low</option>
          <option value="rating">Top Rated ★</option>
          <option value="discount">Best Deals %</option>
        </select>
      </div>

      {/* Categories */}
      <div className="shop-filter-section">
        <span className="shop-filter-label">Category</span>
        <div className="shop-cat-list">
          {dynamicCategories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                type="button"
                className={`shop-cat-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.name)}
              >
                <span>{cat.name}</span>
                <span className="shop-cat-count">{cat.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shop-filter-divider" />

      {/* Sizes */}
      <div className="shop-filter-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span className="shop-filter-label" style={{ marginBottom: 0 }}>Size</span>
          {selectedSize && (
            <button
              type="button"
              onClick={() => setSelectedSize(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
        <div className="shop-size-grid">
          {SIZES.map((size) => {
            const isSelected = selectedSize === size;
            const count = sizeAvailability.get(size) || 0;
            const isDisabled = count === 0;
            return (
              <button
                key={size}
                type="button"
                className={`shop-size-btn ${isSelected ? 'active' : ''}`}
                disabled={isDisabled}
                onClick={() => setSelectedSize(isSelected ? null : size)}
                title={`${count} styles in ${size}`}
              >
                <span>{size}</span>
                <span className="shop-size-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shop-filter-divider" />

      {/* Price Range */}
      <div className="shop-filter-section">
        <span className="shop-filter-label">Price Range</span>
        <div className="shop-price-tags">
          <button type="button" className={`shop-price-tag ${maxPrice === null ? 'active' : ''}`} onClick={() => setMaxPrice(null)}>All</button>
          <button type="button" className={`shop-price-tag ${maxPrice === 3000 ? 'active' : ''}`} onClick={() => setMaxPrice(maxPrice === 3000 ? null : 3000)}>Under 3K</button>
          <button type="button" className={`shop-price-tag ${maxPrice === 6000 ? 'active' : ''}`} onClick={() => setMaxPrice(maxPrice === 6000 ? null : 6000)}>Under 6K</button>
          <button type="button" className={`shop-price-tag ${maxPrice === 10000 ? 'active' : ''}`} onClick={() => setMaxPrice(maxPrice === 10000 ? null : 10000)}>Under 10K</button>
        </div>
      </div>

      <div className="shop-filter-divider" />

      {/* In Stock Toggle */}
      <div className="shop-filter-section">
        <button
          type="button"
          className="shop-stock-toggle"
          style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          onClick={() => setInStockOnly(!inStockOnly)}
        >
          <div className={`shop-toggle-track ${inStockOnly ? 'on' : ''}`}>
            <div className="shop-toggle-thumb" />
          </div>
          <span className="shop-toggle-label">
            In Stock Only ({segmentProducts.filter((p) => p.stock > 0).length})
          </span>
        </button>
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
                {segmentLabel(selectedSegment)} Collection
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

        {/* ── Monic Department Hero Banner ── */}
        {(() => {
          const meta = DEPT_METADATA[selectedSegment] || DEPT_METADATA.All;
          return (
            <div className="monic-shop-hero">
              <div className="monic-shop-hero-grid">
                <div>
                  <span className="monic-shop-hero-badge">
                    <Sparkles size={13} /> {meta.badge}
                  </span>
                  <h1 className="monic-shop-hero-title">
                    {meta.titlePrefix} <em>{meta.titleItalic}</em> {meta.titleSuffix}
                  </h1>
                  <p className="monic-shop-hero-sub">
                    {meta.subtitle}
                  </p>
                  <div className="monic-shop-hero-tags">
                    {meta.tags.map((tag, i) => (
                      <span key={i} className="monic-shop-hero-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="monic-shop-hero-preview">
                  <img src={meta.image} alt={meta.titlePrefix} className="monic-shop-hero-img" />
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── 4-Card Department Showcase Hub (Shop All, Men, Women, Kids) ── */}
        <div className="monic-dept-hub">
          {DEPT_CARDS.map((dept) => {
            const isSelected = selectedSegment === dept.key;
            const count = dept.key === 'All'
              ? allProducts.length
              : allProducts.filter((p) => (p.segment || '').toLowerCase() === dept.key.toLowerCase()).length;

            return (
              <button
                key={dept.key}
                type="button"
                className={`monic-dept-card ${isSelected ? 'active' : ''}`}
                onClick={() => handleSegmentChange(dept.key)}
              >
                <div className="monic-dept-thumb">
                  <img src={dept.image} alt={dept.label} />
                </div>
                <div className="monic-dept-info">
                  <h3 className="monic-dept-name">{dept.label}</h3>
                  <span className="monic-dept-count">
                    {count} {count === 1 ? 'Garment' : 'Garments'}
                  </span>
                </div>
                <div className="monic-dept-arrow">
                  <ChevronRight size={14} />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Quick Category Filter Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {dynamicCategories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  type="button"
                  className={`monic-filter-pill ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.name)}
                  style={{ margin: 0 }}
                >
                  {cat.name} ({cat.count})
                </button>
              );
            })}
          </div>

          <div className="sort-box hide-on-mobile" style={{ marginLeft: 'auto' }}>
            <label htmlFor="sort" style={{ fontWeight: 700, fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--muted)' }}>
              <ArrowUpDown size={14} /> Sort:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="shop-sort-select"
            >
              <option value="featured">✨ Featured</option>
              <option value="low-high">Price: Low → High</option>
              <option value="high-low">Price: High → Low</option>
              <option value="rating">Top Rated ★</option>
              <option value="discount">Best Deals %</option>
            </select>
          </div>
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
          <aside className="shop-glass-sidebar hide-on-mobile" style={{ minWidth: 220, width: 240 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontal size={17} color="var(--primary)" />
                <strong style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text)' }}>Filters</strong>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <RotateCcw size={11} /> Reset
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
              <div style={{ padding: '80px 0', minHeight: 360, display: 'grid', placeItems: 'center' }}>
                <Loader size="lg" label="Curating Fashion Catalog..." />
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

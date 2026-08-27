import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import type { UIProduct, Product as BackendProduct, Category } from '../../types/product.types';
import * as productService from '../../services/product.service';

export function Products() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') ?? 'All';
  const initialSegment = searchParams.get('segment') ?? 'All';
  const [selectedType, setSelectedType] = useState(initialCategory);
  const [selectedSegment, setSelectedSegment] = useState(initialSegment);

  // keep component state in sync with URL query params (so navbar navigation updates filters)
  useEffect(() => {
    const s = searchParams.get('segment') ?? 'All';
    const c = searchParams.get('category') ?? 'All';
    setSelectedSegment(s);
    setSelectedType(c);
  }, [searchParams]);
  const [sortBy, setSortBy] = useState('featured');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendProducts, setBackendProducts] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = { limit: 100 };
        if (selectedSegment && selectedSegment !== 'All') params.segment = selectedSegment;
        if (selectedType && selectedType !== 'All') params.category = selectedType;
        const [products, cats] = await Promise.all([productService.getProducts(params), productService.getCategories()]);
        if (!mounted) return;
        setBackendProducts(products);
        setCategories(cats);
      } catch (err) {
        console.error(err);
        setError('Unable to load products. Please try again.');
      } finally {
        if (mounted) setLoading(false);
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
      return matchesType && matchesSearch;
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
  }, [uiProducts, search, selectedType, sortBy]);

  return (
    <div className="page-shell">
      <div className="container product-page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Shop collection</p>
            <h1>Browse Our Styles</h1>
          </div>
          <div className="sort-box">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        <div className="shop-layout">
          <aside className="filter-panel">
            <div className="filter-header">
              <SlidersHorizontal size={18} />
              <strong>Filters</strong>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
            </div>

            <div className="filter-group">
              <label>Segment</label>
              <select value={selectedSegment} onChange={(event) => setSelectedSegment(event.target.value)}>
                <option value="All">All</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
                <option value="All">All</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Shirts">Shirts</option>
                <option value="Dresses">Dresses</option>
                <option value="Jackets">Jackets</option>
                <option value="Jeans">Jeans</option>
                <option value="Trousers">Trousers</option>
                <option value="Skirts">Skirts</option>
                <option value="Blouses">Blouses</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price</label>
              <div className="range-row">
                <span>Under LKR 5000</span>
              </div>
            </div>

            <div className="filter-group">
              <label>Sizes</label>
              <div className="tag-row">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <span key={size} className="tag">{size}</span>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Colors</label>
              <div className="tag-row">
                {['Black', 'White', 'Blue', 'Red'].map((color) => (
                  <span key={color} className="tag">{color}</span>
                ))}
              </div>
            </div>
          </aside>

          <main className="catalog-panel">
            <div className="catalog-toolbar">
              <span>{filteredProducts.length} items</span>
              <Link to="/" className="text-link">Home / Shop</Link>
            </div>

            <div className="product-grid product-grid--wide">
              {loading ? (
                <div>Loading products...</div>
              ) : error ? (
                <div>
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()}>Retry</button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div>No products found.</div>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

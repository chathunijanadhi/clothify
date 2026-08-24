import { ProductCard } from '../product/ProductCard';
import type { UIProduct } from '../../types/product.types';

const products: UIProduct[] = [
  {
    id: 'p1',
    name: 'Classic Cotton T-Shirt',
    category: 'Men',
    description: 'Soft cotton essentials for casual wear.',
    price: 2200,
    oldPrice: 2800,
    discount: 21,
    rating: 4.7,
    reviewCount: 124,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Blue'],
    stock: 12,
  },
  {
    id: 'p2',
    name: 'Premium Casual Shirt',
    category: 'Men',
    description: 'Tailored comfort for everyday sophistication.',
    price: 4200,
    oldPrice: 5000,
    discount: 16,
    rating: 4.8,
    reviewCount: 90,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    sizes: ['M', 'L', 'XL'],
    colors: ['White', 'Blue', 'Beige'],
    stock: 7,
  },
  {
    id: 'p3',
    name: "Women's Summer Dress",
    category: 'Women',
    description: 'Elegant and breezy for sunny day styling.',
    price: 5100,
    oldPrice: 6500,
    discount: 22,
    rating: 4.9,
    reviewCount: 210,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Pink', 'Yellow', 'Black'],
    stock: 10,
  },
  {
    id: 'p4',
    name: 'Slim Fit Jeans',
    category: 'Women',
    description: 'Modern silhouette with premium stretch finish.',
    price: 4800,
    oldPrice: 6200,
    discount: 19,
    rating: 4.6,
    reviewCount: 88,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
    sizes: ['S', 'M', 'L'],
    colors: ['Blue', 'Black'],
    stock: 14,
  },
];

export function FeaturedProducts() {
  return (
    <section className="section-block alt-bg">
      <div className="container">
        <div className="section-heading">
          <p>Featured Collection</p>
          <h2>Best Sellers</h2>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';

const categories = [
  { name: 'Women', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80' },
  { name: 'Men', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80' },
  { name: 'Kids', image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=700&q=80' },
  { name: 'Dresses', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80' },
  { name: 'Shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80' },
  { name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80' },
  { name: 'Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80' },
];

export function CategorySection() {
  return (
    <section className="section-block">
      <div className="container">
        <div className="section-heading">
          <p>Shop by Style</p>
          <h2>Popular Categories</h2>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link to={`/products?category=${encodeURIComponent(category.name)}`} key={category.name} className="category-card">
              <img src={category.image} alt={category.name} />
              <div className="category-overlay">
                <span>{category.name}</span>
                <small>View collection</small>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

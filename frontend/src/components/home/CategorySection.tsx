import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Women',   image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg',  count: '120+ styles' },
  { name: 'Men',     image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853838/behrouz-sasani-6OGml3UomZw-unsplash.jpg', count: '95+ styles' },
  { name: 'Kids',    image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853796/kayan-baby-kPXq-jxhMkk-unsplash.jpg', count: '60+ styles' },
  { name: 'Dresses', image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853772/pexels-rakesh-mondal-3337884-19152364.jpg', count: '45+ styles' },
  { name: 'Shirts',  image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853811/pexels-nguy-n-d-c-l-c-nguy-n-2150121692-35171075.jpg', count: '38+ styles' },
  { name: 'T-Shirts',image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787852199/clothify/h2wzzqnhgqmtsvznjvgq.jpg', count: '52+ styles' },
  { name: 'Jeans',   image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787854402/full-length-cheerful-woman-denim-clothes-posing-white-wall.jpg', count: '30+ styles' },
  { name: 'Skirts',  image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853789/pexels-rajatsahuphotography-33317708.jpg', count: '28+ styles' },
];

export function CategorySection() {
  return (
    <section className="section-block">
      <div className="container">
        <div className="section-heading">
          <p>Shop by Style</p>
          <h2>Popular <span>Categories</span></h2>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              to={`/products?category=${encodeURIComponent(category.name)}`}
              key={category.name}
              className="category-card"
            >
              <img src={category.image} alt={category.name} />
              <div className="category-overlay">
                <span>{category.name}</span>
                <small>{category.count}</small>
                <span className="arrow-icon">
                  Shop now <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

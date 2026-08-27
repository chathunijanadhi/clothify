import { Link } from 'react-router-dom';

const categories = [
  { name: 'Women', image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg' },
  { name: 'Men', image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853838/behrouz-sasani-6OGml3UomZw-unsplash.jpg' },
  { name: 'Kids', image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853796/kayan-baby-kPXq-jxhMkk-unsplash.jpg' },
  { name: 'Dresses', image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853772/pexels-rakesh-mondal-3337884-19152364.jpg' },
  { name: 'Shirts', image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853811/pexels-nguy-n-d-c-l-c-nguy-n-2150121692-35171075.jpg' },
  { name: 'T-Shirts', image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787852199/clothify/h2wzzqnhgqmtsvznjvgq.jpg' },
  { name: 'Jeans', image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787854402/full-length-cheerful-woman-denim-clothes-posing-white-wall.jpg' },
  { name: 'Skirts', image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853789/pexels-rajatsahuphotography-33317708.jpg' },
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

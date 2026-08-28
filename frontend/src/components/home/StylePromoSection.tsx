import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const promos = [
  {
    title: 'New\nArrivals',
    subtitle: 'Fresh styles every week',
    cta: 'Shop New In',
    href: '/products',
    image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853829/pexels-emrekeshavarz-19607463.jpg',
    accent: 'linear-gradient(135deg, rgba(233,30,140,0.75) 0%, rgba(255,107,53,0.65) 100%)',
    tag: '🆕 Just Dropped',
  },
  {
    title: 'Men\'s\nEssentials',
    subtitle: 'Timeless pieces for every occasion',
    cta: 'Shop Men',
    href: '/products?segment=Men',
    image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853838/behrouz-sasani-6OGml3UomZw-unsplash.jpg',
    accent: 'linear-gradient(135deg, rgba(26,10,46,0.75) 0%, rgba(45,27,105,0.65) 100%)',
    tag: '🧥 Classic Styles',
  },
  {
    title: 'Christmas\nSale',
    subtitle: 'Up to 40% off on selected items',
    cta: 'Grab the Deal',
    href: '/products',
    image: 'https://res.cloudinary.com/efjuzuge/image/upload/v1787853772/pexels-rakesh-mondal-3337884-19152364.jpg',
    accent: 'linear-gradient(135deg, rgba(0,212,170,0.7) 0%, rgba(0,180,216,0.6) 100%)',
    tag: '🔥 Up to 40% Off',
  },
];

export function StylePromoSection() {
  return (
    <section className="style-promo-section">
      <div className="container">
        <div className="section-heading" style={{ textAlign: 'center' }}>
          <p>Curated for you</p>
          <h2>Style <span>Inspiration</span></h2>
        </div>
        <div className="promo-grid">
          {promos.map((promo) => (
            <Link key={promo.title} to={promo.href} className="promo-card">
              <img src={promo.image} alt={promo.title.replace('\n', ' ')} className="promo-card-img" />
              <div className="promo-card-overlay" style={{ background: promo.accent }}>
                <div className="promo-card-tag">{promo.tag}</div>
                <div>
                  <h3 className="promo-card-title">{promo.title.split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}</h3>
                  <p className="promo-card-subtitle">{promo.subtitle}</p>
                </div>
                <div className="promo-card-cta">
                  {promo.cta} <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

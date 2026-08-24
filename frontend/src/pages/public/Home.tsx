import { HeroSection } from '../../components/home/HeroSection';
import { CategorySection } from '../../components/home/CategorySection';
import { FeaturedProducts } from '../../components/home/FeaturedProducts';
import { NewsletterSection } from '../../components/home/NewsletterSection';

export function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <section className="promo-banner">
        <div className="container promo-content">
          <div>
            <p className="eyebrow">Summer Collection</p>
            <h2>Up to 30% Off</h2>
          </div>
          <a href="/products" className="btn btn-primary">
            Shop Now
          </a>
        </div>
      </section>
      <NewsletterSection />
    </>
  );
}

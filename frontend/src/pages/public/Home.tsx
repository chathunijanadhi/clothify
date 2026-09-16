import { HeroSection } from '../../components/home/HeroSection';
import { MarqueeSection } from '../../components/home/MarqueeSection';
import { CategorySection } from '../../components/home/CategorySection';
import { FlashDealSection } from '../../components/home/FlashDealSection';
import { FeaturedProductsSection } from '../../components/home/FeaturedProductsSection';
import { OccasionFinderSection } from '../../components/home/OccasionFinderSection';
import { TestimonialsSection } from '../../components/home/TestimonialsSection';
import { NewsletterSection } from '../../components/home/NewsletterSection';

export function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <HeroSection />
      <CategorySection />
      <FlashDealSection />
      <FeaturedProductsSection />
      <MarqueeSection />
      <OccasionFinderSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}

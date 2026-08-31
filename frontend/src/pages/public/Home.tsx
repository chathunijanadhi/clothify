import { HeroSection } from '../../components/home/HeroSection';
import { MarqueeSection } from '../../components/home/MarqueeSection';
import { FeaturesStrip } from '../../components/home/FeaturesStrip';
import { OccasionFinderSection } from '../../components/home/OccasionFinderSection';
import { FeaturedProductsSection } from '../../components/home/FeaturedProductsSection';
import { FlashDealSection } from '../../components/home/FlashDealSection';
import { CategorySection } from '../../components/home/CategorySection';
import { StylePromoSection } from '../../components/home/StylePromoSection';
import { TestimonialsSection } from '../../components/home/TestimonialsSection';
import { NewsletterSection } from '../../components/home/NewsletterSection';

export function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <HeroSection />
      <MarqueeSection />
      <FeaturesStrip />
      <OccasionFinderSection />
      <FeaturedProductsSection />
      <FlashDealSection />
      <CategorySection />
      <StylePromoSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}

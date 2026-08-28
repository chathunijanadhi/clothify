import { HeroSection } from '../../components/home/HeroSection';
import { MarqueeSection } from '../../components/home/MarqueeSection';
import { FeaturesStrip } from '../../components/home/FeaturesStrip';
import { CategorySection } from '../../components/home/CategorySection';
import { StylePromoSection } from '../../components/home/StylePromoSection';
import { NewsletterSection } from '../../components/home/NewsletterSection';

export function Home() {
  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <FeaturesStrip />
      <CategorySection />
      <StylePromoSection />
      <NewsletterSection />
    </>
  );
}

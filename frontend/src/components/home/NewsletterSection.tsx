import { Button } from '../common/Button';
import { Input } from '../common/Input';

export function NewsletterSection() {
  return (
    <section className="newsletter-section">
      <div className="container newsletter-box">
        <div>
          <p className="eyebrow">Fashion updates</p>
          <h2>Stay Updated With Our Latest Styles</h2>
        </div>
        <div className="newsletter-form">
          <Input type="email" placeholder="Enter your email" aria-label="Email address" />
          <Button type="button">Subscribe</Button>
        </div>
      </div>
    </section>
  );
}

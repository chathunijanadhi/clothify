export function NewsletterSection() {
  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-box">
          <div>
            <span className="eyebrow">Fashion updates</span>
            <h2>Stay Updated With<br />Our Latest Styles</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: 10, fontSize: '0.95rem' }}>
              Join 25,000+ fashion lovers. Get exclusive deals, new arrivals, and style inspiration.
            </p>
          </div>
          <div className="newsletter-form">
            <input
              type="email"
              className="input"
              placeholder="Enter your email address"
              aria-label="Email address"
            />
            <button type="button" className="newsletter-subscribe-btn">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

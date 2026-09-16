/* Marquee ticker strip */
const items = [
  '🔥 New Season Trends Just Dropped',
  '✨ Up to 40% Off Selected Styles',
  '👗 Exclusive Monic Capsule Collection',
  '🚚 Free Express Shipping Over $100',
  '💎 Sustainable Fabrics & Artisanal Craft',
  '🌟 Exclusive Member VIP Discounts',
  '👠 Handpicked Seasonal Silhouettes',
  '🎁 Complimentary Gift Packaging',
];

export function MarqueeSection() {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-strip" style={{ background: 'linear-gradient(135deg, #C44B2B 0%, #D4622B 100%)' }}>
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item" style={{ color: '#ffffff' }}>
            {item}
            <span className="marquee-dot" style={{ color: 'rgba(255,255,255,0.45)' }}>●</span>
          </span>
        ))}
      </div>
    </div>
  );
}

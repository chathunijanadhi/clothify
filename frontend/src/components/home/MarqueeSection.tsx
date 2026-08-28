/* Marquee ticker strip */
const items = [
  '🔥 New Arrivals Just Dropped',
  '✨ Up to 40% Off Selected Styles',
  '👗 Christmas Collection is Here',
  '🚚 Free Shipping on Orders Over LKR 5,000',
  '💎 Premium Quality, Unbeatable Prices',
  '🌟 Exclusive Member Discounts',
  '👠 Shop the Latest Trends',
  '🎁 Gift Cards Available Now',
];

export function MarqueeSection() {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-strip">
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-dot">●</span>
          </span>
        ))}
      </div>
    </div>
  );
}

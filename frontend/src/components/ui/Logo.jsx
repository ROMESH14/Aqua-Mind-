function Logo({ size = 'md', showTagline = false, className = '' }) {
  const sizes = {
    sm: { img: 36, text: '0.95rem', tag: '0.55rem' },
    md: { img: 44, text: '1.15rem', tag: '0.62rem' },
    lg: { img: 120, text: '2rem', tag: '0.72rem' },
    xl: { img: 200, text: '2.5rem', tag: '0.78rem' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`logo-brand ${className}`}>
      <img
        src={`${process.env.PUBLIC_URL}/logo.png`}
        alt="Aqua Mind"
        className="logo-brand-img"
        style={{ width: s.img, height: s.img }}
      />
      <div className="logo-brand-text">
        <span className="logo-brand-name" style={{ fontSize: s.text }}>AQUA MIND</span>
        {showTagline && (
          <span className="logo-brand-tagline" style={{ fontSize: s.tag }}>
            AI-Powered Smart Aquarium Management
          </span>
        )}
      </div>
    </div>
  );
}

export default Logo;

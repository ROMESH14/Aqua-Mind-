function PageHero({ eyebrow, title, subtitle, children, tone = 'aqua', inlineActions = false }) {
  return (
    <header className={`page-hero page-hero-${tone}`}>
      <div className="page-hero-glow" aria-hidden />
      <div className="page-hero-copy">
        {eyebrow && <p className="page-hero-eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && (
        <div className={`page-header-actions${inlineActions ? ' page-header-actions--inline' : ''}`}>
          {children}
        </div>
      )}
    </header>
  );
}

export default PageHero;

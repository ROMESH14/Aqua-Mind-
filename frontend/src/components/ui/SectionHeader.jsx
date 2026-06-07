function SectionHeader({ icon, iconVariant = 'accent', title, children }) {
  return (
    <div className="section-header">
      <div className="section-title">
        <div className={`section-icon ${iconVariant}`}>{icon}</div>
        {title}
      </div>
      {children}
    </div>
  );
}

export default SectionHeader;

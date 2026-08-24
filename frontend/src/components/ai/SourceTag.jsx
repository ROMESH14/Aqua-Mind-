function SourceTag({ source }) {
  if (!source) return null;
  const label = { ml: 'ML', rules: 'Rules', 'rule-based': 'Rules', catalog: 'Catalog', expert: 'Expert' }[source] || source;
  return <span className="ai-source-tag">{label}</span>;
}

export default SourceTag;

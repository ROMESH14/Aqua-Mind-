function normalizeItem(item) {
  if (typeof item === 'string') {
    const name = item.trim();
    return name ? { name, count: 1 } : null;
  }
  const name = String(item?.name || '').trim();
  if (!name) return null;
  const count = Math.max(1, parseInt(item.count, 10) || 1);
  return { name, count };
}

function parseInhabitants(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(normalizeItem).filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(normalizeItem).filter(Boolean);
  } catch {
    return String(value)
      .split(',')
      .map((part) => normalizeItem(part))
      .filter(Boolean);
  }
  return [];
}

function serializeInhabitants(list) {
  const items = parseInhabitants(list);
  return items.length ? JSON.stringify(items) : null;
}

function countInhabitants(list) {
  return parseInhabitants(list).reduce((sum, item) => sum + (item.count || 1), 0);
}

module.exports = { parseInhabitants, serializeInhabitants, countInhabitants };

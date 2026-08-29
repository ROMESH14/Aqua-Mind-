import { useMemo, useRef, useState } from 'react';

function SpeciesTagInput({
  label,
  hint,
  placeholder,
  suggestions = [],
  quickPicks = [],
  items,
  onChange,
}) {
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const list = Array.isArray(items) ? items : [];
  const selectedNames = useMemo(
    () => new Set(list.map((item) => String(item?.name || item || '').toLowerCase()).filter(Boolean)),
    [list]
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return suggestions
      .filter((name) => name.toLowerCase().includes(q) && !selectedNames.has(name.toLowerCase()))
      .slice(0, 8);
  }, [query, suggestions, selectedNames]);

  const unusedQuick = quickPicks.filter((name) => !selectedNames.has(name.toLowerCase()));

  const add = (name) => {
    const trimmed = String(name || query).trim();
    if (!trimmed || selectedNames.has(trimmed.toLowerCase())) return;
    onChange([...list, { name: trimmed, count: Math.max(1, parseInt(count, 10) || 1) }]);
    setQuery('');
    setCount(1);
    setOpen(false);
    inputRef.current?.focus();
  };

  const remove = (name) => onChange(list.filter((item) => (item?.name || item) !== name));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add(matches[0] || query);
    }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {hint && <p className="form-hint">{hint}</p>}
      <div className="species-picker">
        <div className="species-picker-row">
          <input
            ref={inputRef}
            className="form-input"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={handleKeyDown}
          />
          <input
            className="form-input species-count"
            type="number"
            min="1"
            aria-label="How many"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
          <button type="button" className="btn btn-ghost species-add" onClick={() => add(matches[0] || query)}>
            Add
          </button>
        </div>
        {open && matches.length > 0 && (
          <ul className="species-suggest">
            {matches.map((name) => (
              <li key={name}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(name)}>
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {list.length === 0 && unusedQuick.length > 0 && (
        <div className="species-quick">
          {unusedQuick.map((name) => (
            <button key={name} type="button" className="species-quick-chip" onClick={() => add(name)}>
              {name}
            </button>
          ))}
        </div>
      )}
      {list.length > 0 && (
        <div className="species-chips">
          {list.map((item, index) => {
            const name = item?.name || item;
            const qty = Number(item?.count) || 1;
            return (
              <span key={`${name}-${index}`} className="species-chip">
                {name}{qty > 1 ? ` ×${qty}` : ''}
                <button type="button" aria-label={`Remove ${name}`} onClick={() => remove(name)}>×</button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SpeciesTagInput;

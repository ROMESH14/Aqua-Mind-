import { Children, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function parseOptions(children) {
  return Children.toArray(children)
    .filter((child) => child?.props != null)
    .map((child) => ({
      value: String(child.props.value ?? ''),
      label: child.props.children,
      disabled: Boolean(child.props.disabled),
    }));
}

function Select({
  variant,
  className = '',
  children,
  value,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const options = parseOptions(children);
  const stringValue = value == null ? '' : String(value);
  const selected = options.find((opt) => opt.value === stringValue);
  const placeholderOption = options.find((opt) => opt.value === '');

  const triggerClass = [
    'form-input',
    'form-select',
    'form-select-trigger',
    open && 'open',
    variant === 'header' && 'form-select--header',
    className,
  ].filter(Boolean).join(' ');

  const wrapClass = [
    'form-select-wrap',
    variant === 'header' && 'form-select-wrap--header',
  ].filter(Boolean).join(' ');

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = Math.min(options.length * 44 + 12, 220);
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;

    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      zIndex: 600,
    });
  };

  const handleSelect = (opt) => {
    if (opt.disabled || disabled) return;
    setOpen(false);
    onChange?.({ target: { value: opt.value } });
  };

  useEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();

    const close = (e) => {
      if (
        wrapRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) return;
      setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, options.length]);

  const handleTriggerClick = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  const displayLabel = selected?.label ?? placeholderOption?.label ?? 'Select';
  const isPlaceholder = stringValue === ''
    && placeholderOption?.label?.toLowerCase().includes('select');

  return (
    <div className={wrapClass} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass}
        onClick={handleTriggerClick}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className={`form-select-value${isPlaceholder ? ' placeholder' : ''}`}>
          {displayLabel}
        </span>
        <span className="form-select-chevron" aria-hidden="true" />
      </button>

      {open && createPortal(
        <ul
          ref={menuRef}
          className="form-select-menu"
          role="listbox"
          style={menuStyle}
        >
          {options.map((opt) => (
            <li
              key={opt.value || '__empty__'}
              role="option"
              aria-selected={opt.value === stringValue}
              className={[
                'form-select-option',
                opt.value === stringValue && 'selected',
                opt.disabled && 'disabled',
                opt.value === '' && 'form-select-option--placeholder',
              ].filter(Boolean).join(' ')}
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </div>
  );
}

export default Select;

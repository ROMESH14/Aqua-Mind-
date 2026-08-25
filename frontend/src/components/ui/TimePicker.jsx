import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

function parseValue(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return { hour: '06', minute: '00', period: 'PM' };
  const hour24 = Number(match[1]);
  const minute = Math.min(59, Number(match[2]));
  const nearest = MINUTES.reduce((best, item) => (
    Math.abs(Number(item) - minute) < Math.abs(Number(best) - minute) ? item : best
  ), '00');
  return {
    hour: String(hour24 % 12 || 12).padStart(2, '0'),
    minute: nearest,
    period: hour24 >= 12 ? 'PM' : 'AM',
  };
}

function toValue(hour, minute, period) {
  let hour24 = Number(hour) % 12;
  if (period === 'PM') hour24 += 12;
  return `${String(hour24).padStart(2, '0')}:${minute}`;
}

function formatDisplay(value) {
  if (!value) return 'Select time';
  const { hour, minute, period } = parseValue(value);
  return `${Number(hour)}:${minute} ${period}`;
}

function TimePicker({ value = '', onChange, disabled = false, 'aria-label': ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const [draft, setDraft] = useState(() => parseValue(value));
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 248;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;
    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: Math.max(rect.width, 240),
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      zIndex: 600,
    });
  };

  const applyDraft = (next) => {
    setDraft(next);
    onChange?.({ target: { value: toValue(next.hour, next.minute, next.period) } });
  };

  useEffect(() => {
    if (open) setDraft(parseValue(value));
  }, [open, value]);

  useEffect(() => {
    if (!open) return undefined;
    updateMenuPosition();

    const close = (e) => {
      if (wrapRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
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
  }, [open]);

  return (
    <div className="form-select-wrap" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`form-input form-select form-select-trigger${open ? ' open' : ''}`}
        onClick={() => { if (!disabled) setOpen((prev) => !prev); }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || 'Due time'}
      >
        <span className={`form-select-value${value ? '' : ' placeholder'}`}>
          {formatDisplay(value)}
        </span>
        <span className="form-select-chevron" aria-hidden="true" />
      </button>

      {open && createPortal(
        <div ref={menuRef} className="form-select-menu time-picker-menu" style={menuStyle}>
          <div className="time-picker-cols">
            <ul className="time-picker-col" role="listbox" aria-label="Hour">
              {HOURS.map((hour) => (
                <li
                  key={hour}
                  role="option"
                  aria-selected={draft.hour === hour}
                  className={`form-select-option${draft.hour === hour ? ' selected' : ''}`}
                  onClick={() => applyDraft({ ...draft, hour })}
                >
                  {hour}
                </li>
              ))}
            </ul>
            <ul className="time-picker-col" role="listbox" aria-label="Minute">
              {MINUTES.map((minute) => (
                <li
                  key={minute}
                  role="option"
                  aria-selected={draft.minute === minute}
                  className={`form-select-option${draft.minute === minute ? ' selected' : ''}`}
                  onClick={() => applyDraft({ ...draft, minute })}
                >
                  {minute}
                </li>
              ))}
            </ul>
            <ul className="time-picker-col" role="listbox" aria-label="AM or PM">
              {PERIODS.map((period) => (
                <li
                  key={period}
                  role="option"
                  aria-selected={draft.period === period}
                  className={`form-select-option${draft.period === period ? ' selected' : ''}`}
                  onClick={() => applyDraft({ ...draft, period })}
                >
                  {period}
                </li>
              ))}
            </ul>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export default TimePicker;

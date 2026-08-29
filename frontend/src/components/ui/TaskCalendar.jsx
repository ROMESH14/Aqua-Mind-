const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dateKey(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const us = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (us) {
      return `${us[3]}-${String(us[1]).padStart(2, '0')}-${String(us[2]).padStart(2, '0')}`;
    }
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const utcMidnight = date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
  if (utcMidnight) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function TaskCalendar({ tasks = [], selected, onSelect }) {
  const today = startOfDay(new Date());
  const selectedDate = startOfDay(selected || today);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay = {};
  tasks.forEach((task) => {
    const key = dateKey(task.dueDate);
    if (!key) return;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(task);
  });

  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));

  const monthLabel = selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const selectedKey = dateKey(selectedDate);

  const shiftMonth = (delta) => {
    const next = new Date(year, month + delta, 1);
    onSelect?.(next);
  };

  const markClass = (dayTasks) => {
    if (!dayTasks.length) return '';
    if (dayTasks.some((task) => !task.done && startOfDay(task.dueDate) < today)) return 'is-overdue';
    if (dayTasks.some((task) => !task.done)) return 'is-due';
    return 'is-done';
  };

  return (
    <div className="task-cal">
      <div className="task-cal-nav">
        <button type="button" className="task-cal-shift" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
        <strong>{monthLabel}</strong>
        <button type="button" className="task-cal-shift" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
      </div>

      <div className="task-cal-grid">
        {WEEKDAYS.map((day) => (
          <span key={day} className="task-cal-dow">{day}</span>
        ))}
        {cells.map((date, index) => {
          if (!date) return <span key={`pad-${index}`} className="task-cal-cell is-pad" />;
          const key = dateKey(date);
          const dayTasks = byDay[key] || [];
          const isToday = key === dateKey(today);
          const isSelected = key === selectedKey;
          return (
            <button
              key={key}
              type="button"
              className={`task-cal-cell ${markClass(dayTasks)}${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}`}
              onClick={() => onSelect?.(date)}
            >
              <em>{date.getDate()}</em>
              {dayTasks.length > 0 && <span className="task-cal-dot">{dayTasks.length}</span>}
            </button>
          );
        })}
      </div>

      <div className="task-cal-legend">
        <span><i className="is-due" /> Due</span>
        <span><i className="is-overdue" /> Overdue</span>
        <span><i className="is-done" /> Done</span>
      </div>
    </div>
  );
}

export default TaskCalendar;
export { dateKey };

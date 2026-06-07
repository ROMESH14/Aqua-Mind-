import { useState } from 'react';

function TaskItem({ name, tank, due, dueType, initialDone = false, onToggle }) {
  const [done, setDone] = useState(initialDone);

  const toggle = async () => {
    if (onToggle) {
      await onToggle();
      setDone((prev) => !prev);
    } else {
      setDone((prev) => !prev);
    }
  };

  return (
    <div className="task-item">
      <div
        className={`task-check${done ? ' done' : ''}`}
        onClick={toggle}
        onKeyDown={(e) => e.key === 'Enter' && toggle()}
        role="checkbox"
        aria-checked={done}
        tabIndex={0}
      >
        {done ? '✓' : ''}
      </div>
      <div className="task-text">
        <div className="task-name">{name}</div>
        <div className="task-tank">{tank}</div>
      </div>
      <span className={`task-due ${dueType}`}>{due}</span>
    </div>
  );
}

export default TaskItem;

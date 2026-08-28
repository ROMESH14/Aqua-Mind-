import { useEffect, useState } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import TaskItem from '../components/ui/TaskItem';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import TimePicker from '../components/ui/TimePicker';
import TaskCalendar, { dateKey } from '../components/ui/TaskCalendar';
import { maintenanceService } from '../services/maintenanceService';
import { tankService } from '../services/tankService';
import PageHero from '../components/ui/PageHero';
import { useNotifications } from '../context/NotificationContext';

const LOG_PAGE_SIZE = 8;

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  return [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
}

function Maintenance() {
  const notify = useNotifications();
  const [todayTasks, setTodayTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [overdue, setOverdue] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [logPage, setLogPage] = useState(1);
  const [form, setForm] = useState({ taskName: '', dueDate: '', dueTime: '', tankId: '' });

  const load = async () => {
    try {
      const [today, all, logData, tankData] = await Promise.all([
        maintenanceService.getTasks('today'),
        maintenanceService.getTasks(),
        maintenanceService.getLogs(),
        tankService.getAll(),
      ]);
      setTodayTasks(today);
      setAllTasks(all);
      setLogs(logData);
      setTanks(tankData);
      setOverdue(today.filter((t) => t.due === 'Overdue').length);
    } catch (err) {
      setError(err.message);
    }
  };

  const todayKey = dateKey(new Date());
  const dayTasks = allTasks.filter((task) => dateKey(task.dueDate) === dateKey(selectedDay));
  const upcomingTasks = allTasks
    .filter((task) => !task.done && dateKey(task.dueDate) > todayKey)
    .slice(0, 8);

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const saved = await maintenanceService.createTask({
        taskName: form.taskName,
        dueDate: form.dueDate,
        dueTime: form.dueTime || null,
        tankId: form.tankId ? parseInt(form.tankId, 10) : null,
      });
      if (saved.notify) notify?.announce(saved.notify);
      setShowModal(false);
      setForm({ taskName: '', dueDate: '', dueTime: '', tankId: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (id) => {
    await maintenanceService.toggleTask(id);
    load();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const logPages = Math.max(1, Math.ceil(logs.length / LOG_PAGE_SIZE));
  const safeLogPage = Math.min(logPage, logPages);
  const pageLogs = logs.slice((safeLogPage - 1) * LOG_PAGE_SIZE, safeLogPage * LOG_PAGE_SIZE);
  const logFrom = logs.length ? (safeLogPage - 1) * LOG_PAGE_SIZE + 1 : 0;
  const logTo = Math.min(safeLogPage * LOG_PAGE_SIZE, logs.length);

  return (
    <div className="page-screen">
      <div className="page">
        <PageHero tone="coral" eyebrow="Care" title="Maintenance" subtitle="Track and manage all aquarium maintenance tasks">
          <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Add Task</button>
        </PageHero>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div className="maintenance-grid">
          <div className="card care-split">
            <section>
              <SectionHeader icon="⏰" title="Due Today">
                {overdue > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--red-light)' }}>{overdue} overdue</span>}
              </SectionHeader>
              {todayTasks.length > 0 ? (
                <div className="tasks-list">
                  {todayTasks.map((task) => (
                    <TaskItem key={task.id} {...task} initialDone={task.done} onToggle={() => handleToggle(task.id)} />
                  ))}
                </div>
              ) : (
                <p className="task-cal-empty">Nothing due today.</p>
              )}
            </section>
            <section>
              <SectionHeader icon="⏭" iconVariant="light" title="Upcoming" />
              {upcomingTasks.length > 0 ? (
                <div className="tasks-list">
                  {upcomingTasks.map((task) => (
                    <TaskItem key={task.id} {...task} initialDone={task.done} onToggle={() => handleToggle(task.id)} />
                  ))}
                </div>
              ) : (
                <p className="task-cal-empty">No upcoming tasks yet. Add a water change for later this week.</p>
              )}
            </section>
          </div>

          <div className="card">
            <SectionHeader icon="📆" iconVariant="light" title="This Week" />
            <TaskCalendar tasks={allTasks} selected={selectedDay} onSelect={setSelectedDay} />
            {dayTasks.length > 0 ? (
              <div className="tasks-list" style={{ marginTop: '12px' }}>
                {dayTasks.map((task) => (
                  <TaskItem key={task.id} {...task} initialDone={task.done} onToggle={() => handleToggle(task.id)} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="card maintenance-full">
            <SectionHeader icon="📋" iconVariant="light" title="Maintenance Log" />
            {logs.length > 0 ? (
              <>
              <div className="table-wrap">
                <table className="log-table">
                  <thead>
                    <tr><th>Date</th><th>Task</th><th>Tank</th><th>Duration</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {pageLogs.map((row, index) => (
                      <tr key={`${row.date}-${row.task}-${index}`}>
                        <td>{formatDate(row.date)}</td>
                        <td className="log-val">{row.task}</td>
                        <td>{row.tank}</td>
                        <td>{row.duration}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {logs.length > LOG_PAGE_SIZE && (
                <div className="pager">
                  <span className="pager-meta">{logFrom}–{logTo} of {logs.length}</span>
                  <div className="pager-btns">
                    <button
                      type="button"
                      className="pager-btn"
                      disabled={safeLogPage <= 1}
                      onClick={() => setLogPage(safeLogPage - 1)}
                    >
                      Prev
                    </button>
                    {pageNumbers(safeLogPage, logPages).map((n, i, arr) => (
                      <span key={n} className="pager-group">
                        {i > 0 && n - arr[i - 1] > 1 && <em className="pager-gap">…</em>}
                        <button
                          type="button"
                          className={`pager-btn${n === safeLogPage ? ' is-current' : ''}`}
                          onClick={() => setLogPage(n)}
                        >
                          {n}
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      className="pager-btn"
                      disabled={safeLogPage >= logPages}
                      onClick={() => setLogPage(safeLogPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              </>
            ) : (
              <EmptyState icon="📋" title="No maintenance history" message="Completed tasks will be recorded here." />
            )}
          </div>
        </div>

        {showModal && (
          <Modal title="Add Maintenance Task" onClose={() => setShowModal(false)}>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Task Name *</label>
                <input className="form-input" value={form.taskName} onChange={(e) => setForm({ ...form, taskName: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input className="form-input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Time</label>
                  <TimePicker
                    value={form.dueTime}
                    onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tank (optional)</label>
                <Select value={form.tankId} onChange={(e) => setForm({ ...form, tankId: e.target.value })}>
                  <option value="">All tanks</option>
                  {tanks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>
              <button type="submit" className="auth-btn">Add Task</button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Maintenance;

import { useEffect, useState } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import TaskItem from '../components/ui/TaskItem';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { maintenanceService } from '../services/maintenanceService';
import { tankService } from '../services/tankService';

function Maintenance() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [weekTasks, setWeekTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [overdue, setOverdue] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ taskName: '', dueDate: '', dueTime: '', tankId: '' });

  const load = async () => {
    try {
      const [today, week, logData, tankData] = await Promise.all([
        maintenanceService.getTasks('today'),
        maintenanceService.getTasks('week'),
        maintenanceService.getLogs(),
        tankService.getAll(),
      ]);
      setTodayTasks(today);
      setWeekTasks(week);
      setLogs(logData);
      setTanks(tankData);
      setOverdue(today.filter((t) => t.due === 'Overdue').length);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await maintenanceService.createTask({
        taskName: form.taskName,
        dueDate: form.dueDate,
        dueTime: form.dueTime || null,
        tankId: form.tankId ? parseInt(form.tankId, 10) : null,
      });
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

  return (
    <div className="page-screen">
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">Maintenance Schedule</div>
            <div className="page-subtitle">Track and manage all aquarium maintenance tasks</div>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Add Task</button>
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div className="maintenance-grid">
          <div className="card">
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
              <EmptyState icon="⏰" title="Nothing due today" message="Scheduled tasks for today will show up here." />
            )}
          </div>

          <div className="card">
            <SectionHeader icon="📆" iconVariant="light" title="This Week" />
            {weekTasks.length > 0 ? (
              <div className="tasks-list">
                {weekTasks.map((task) => (
                  <TaskItem key={task.id} {...task} initialDone={task.done} onToggle={() => handleToggle(task.id)} />
                ))}
              </div>
            ) : (
              <EmptyState icon="📆" title="No upcoming tasks" message="Plan water changes and maintenance for the week ahead." />
            )}
          </div>

          <div className="card maintenance-full">
            <SectionHeader icon="📋" iconVariant="light" title="Maintenance Log" />
            {logs.length > 0 ? (
              <div className="table-wrap">
                <table className="log-table">
                  <thead>
                    <tr><th>Date</th><th>Task</th><th>Tank</th><th>Duration</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {logs.map((row) => (
                      <tr key={row.date + row.task}>
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
                  <input className="form-input" placeholder="e.g. 6PM" value={form.dueTime} onChange={(e) => setForm({ ...form, dueTime: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tank (optional)</label>
                <select className="form-input" value={form.tankId} onChange={(e) => setForm({ ...form, tankId: e.target.value })}>
                  <option value="">All tanks</option>
                  {tanks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
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

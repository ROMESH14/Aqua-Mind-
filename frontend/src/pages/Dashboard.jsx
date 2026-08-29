import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import TemperatureChart from '../components/ui/TemperatureChart';
import AlertItem from '../components/ui/AlertItem';
import TaskItem from '../components/ui/TaskItem';
import EmptyState from '../components/ui/EmptyState';
import { dateKey } from '../components/ui/TaskCalendar';
import { dashboardService } from '../services/dashboardService';
import { maintenanceService } from '../services/maintenanceService';

function num(stat, fallback = 0) {
  const raw = stat?.value;
  if (raw == null || raw === '—' || raw === 'undefined') return fallback;
  const n = Number(raw);
  return Number.isNaN(n) ? fallback : n;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function MiniCalendar({ tasks = [] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const todayKey = dateKey(now);
  const start = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(start).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const monthName = now.toLocaleDateString('en-GB', { month: 'long' });

  const byDay = {};
  tasks.forEach((task) => {
    const key = dateKey(task.dueDate);
    if (!key) return;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(task);
  });

  const markFor = (day) => {
    if (!day) return '';
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = byDay[key] || [];
    if (!dayTasks.length) return '';
    if (dayTasks.some((task) => !task.done && dateKey(task.dueDate) < todayKey)) return 'is-overdue';
    if (dayTasks.some((task) => !task.done)) return 'is-due';
    return 'is-done';
  };

  return (
    <div className="widget cal-widget">
      <div className="widget-title">{monthName}</div>
      <div className="cal-grid">
        {WEEKDAYS.map((d, i) => <span key={`dow-${i}`} className="cal-dow">{d}</span>)}
        {cells.map((day, i) => {
          const mark = markFor(day);
          return (
            <span key={`day-${i}`} className={`cal-day${day === today ? ' is-today' : ''}${mark ? ` ${mark}` : ''}`}>
              {day || ''}
              {day ? <i className={`cal-dot${mark ? ` ${mark}` : ' is-empty'}`} aria-hidden="true" /> : null}
            </span>
          );
        })}
      </div>
      <div className="task-cal-legend cal-legend">
        <span><i className="is-due" /> Due</span>
        <span><i className="is-overdue" /> Overdue</span>
        <span><i className="is-done" /> Done</span>
      </div>
    </div>
  );
}

function Donut({ value, label }) {
  const pct = Math.max(0, Math.min(100, value));
  const dash = `${pct} ${100 - pct}`;
  return (
    <div className="widget donut-widget">
      <div className="widget-title">Tank health</div>
      <svg className="donut" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="15.5" fill="none" stroke="#dff6f6" strokeWidth="6" />
        <circle
          cx="21"
          cy="21"
          r="15.5"
          fill="none"
          stroke="url(#donutGrad)"
          strokeWidth="6"
          strokeDasharray={dash}
          strokeDashoffset="25"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <text x="21" y="23" textAnchor="middle" className="donut-text">{pct}%</text>
      </svg>
      <p className="donut-caption">{label}</p>
      <Link to="/water" className="btn btn-primary btn-sm donut-action">View water</Link>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [monthTasks, setMonthTasks] = useState([]);
  const [error, setError] = useState('');

  const loadDash = async () => {
    const [dash, tasks] = await Promise.all([
      dashboardService.get(),
      maintenanceService.getTasks().catch(() => []),
    ]);
    setData(dash);
    setMonthTasks(Array.isArray(tasks) ? tasks : []);
  };

  useEffect(() => {
    loadDash().catch((err) => setError(err.message));
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      await maintenanceService.toggleTask(taskId);
      await loadDash();
    } catch (err) {
      setError(err.message);
    }
  };

  const stats = Array.isArray(data?.stats) ? data.stats : [];
  const alertList = Array.isArray(data?.alerts) ? data.alerts : [];
  const taskList = Array.isArray(data?.tasks) ? data.tasks : [];
  const trends = Array.isArray(data?.temperatureTrend) ? data.temperatureTrend : [];
  const tanks = data?.tankCount != null ? Number(data.tankCount) : num(stats[0]);
  const fish = data?.totalFish != null ? Number(data.totalFish) : num(stats[1]);
  const tasksDue = num(stats[3]);
  const taskCount = data?.taskCount != null ? Number(data.taskCount) : tasksDue;
  const alerts = alertList.length;
  const hasTrend = trends.some((t) => Array.isArray(t?.points) && t.points.length > 0);
  const health = useMemo(() => {
    if (!data) return 72;
    const penalty = alerts * 8 + tasksDue * 4;
    return Math.max(28, Math.min(98, 92 - penalty));
  }, [data, alerts, tasksDue]);

  return (
    <div className="page-screen dash-fit-screen">
      <div className="page dash-fit">
        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div className="dash-mosaic">
          <div className="widget metric-widget">
            <div className="metric-row">
              <div>
                <div className="metric-value up">{tanks}</div>
                <div className="metric-label">Active tanks</div>
              </div>
            </div>
            <div className="metric-row">
              <div>
                <div className="metric-value down">{fish}</div>
                <div className="metric-label">Total fish</div>
              </div>
            </div>
            <div className="metric-row">
              <div>
                <div className="metric-value tasks">{monthTasks.length || taskCount}</div>
                <div className="metric-label">Task count</div>
              </div>
            </div>
            <Link to="/tanks" className="btn btn-primary btn-sm metric-add">＋ Add Tank</Link>
          </div>

          <MiniCalendar tasks={monthTasks} />

          <div className="widget">
            <div className="widget-title">Progress</div>
            <div className="progress-list">
              <div>
                <div className="progress-meta"><span>Tasks due</span><b>{tasksDue}</b></div>
                <div className="progress-track"><span style={{ width: `${Math.min(100, tasksDue * 20)}%` }} className="fill-purple" /></div>
              </div>
              <div>
                <div className="progress-meta"><span>Live alerts</span><b>{alerts}</b></div>
                <div className="progress-track"><span style={{ width: `${Math.min(100, alerts * 25)}%` }} className="fill-coral" /></div>
              </div>
              <div>
                <div className="progress-meta"><span>Health score</span><b>{health}%</b></div>
                <div className="progress-track"><span style={{ width: `${health}%` }} className="fill-mix" /></div>
              </div>
            </div>
          </div>

          <div className="widget dash-span-2 dash-temp-widget">
            <SectionHeader icon="🌡" title="Water temperature — 7 days" />
            {hasTrend ? <TemperatureChart trends={trends} /> : (
              <EmptyState icon="📈" title="No temperature data" message="Log water readings to see trends." />
            )}
          </div>

          <Donut value={health} label={alerts ? 'Needs attention' : 'Looking stable'} />

          <div className="dash-pair">
            <div className="widget">
              <SectionHeader icon="💧" title="Water alerts" />
              {alertList.length > 0 ? (
                <div className="alerts-list">
                  {alertList.slice(0, 4).map((alert, index) => (
                    <AlertItem key={`${alert.title || 'alert'}-${alert.time || index}`} {...alert} />
                  ))}
                </div>
              ) : (
                <EmptyState icon="🔔" title="No alerts" message="Water issues will show here." />
              )}
              <Link to="/water" className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>View parameters</Link>
            </div>

            <div className="widget">
              <SectionHeader icon="📅" title="Today's tasks">
                <Link to="/maintenance" className="btn btn-ghost btn-sm">View all</Link>
              </SectionHeader>
              {taskList.length > 0 ? (
                <div className="tasks-list">
                  {taskList.slice(0, 4).map((task, index) => (
                    <TaskItem key={task.id || `task-${index}`} {...task} initialDone={task.done} onToggle={() => handleToggleTask(task.id)} />
                  ))}
                </div>
              ) : (
                <EmptyState icon="📅" title="No tasks scheduled" message="Create maintenance tasks to stay on track.">
                  <Link to="/maintenance" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>Add Task</Link>
                </EmptyState>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

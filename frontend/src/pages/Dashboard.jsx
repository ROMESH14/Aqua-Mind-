import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import SectionHeader from '../components/ui/SectionHeader';
import TemperatureChart from '../components/ui/TemperatureChart';
import AlertItem from '../components/ui/AlertItem';
import TaskItem from '../components/ui/TaskItem';
import EmptyState from '../components/ui/EmptyState';
import { dashboardService } from '../services/dashboardService';
import { maintenanceService } from '../services/maintenanceService';
import { useAuth } from '../context/AuthContext';

const emptyStats = [
  { variant: 'accent', icon: '🐠', value: '0', label: 'Active Tanks', change: '—', changeType: 'up', valueColor: 'var(--text-muted)' },
  { variant: 'light', icon: '🐟', value: '0', label: 'Total Fish', change: '—', changeType: 'up', valueColor: 'var(--text-muted)' },
  { variant: 'warn', icon: '⚗️', value: '—', label: 'Avg pH Level', change: '—', changeType: 'warn', valueColor: 'var(--text-muted)' },
  { variant: 'danger', icon: '📅', value: '0', label: 'Tasks Due Today', change: '—', changeType: 'warn', valueColor: 'var(--text-muted)' },
];

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });

  useEffect(() => {
    dashboardService.get()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const handleToggleTask = async (taskId) => {
    await maintenanceService.toggleTask(taskId);
    const refreshed = await dashboardService.get();
    setData(refreshed);
  };

  const stats = data?.stats || emptyStats;
  const hasTrend = data?.temperatureTrend?.some((t) => t.points?.length > 0);

  return (
    <div className="page-screen">
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">Hello, {user?.username || 'there'}</div>
            <div className="page-subtitle">{today}</div>
          </div>
          <Link to="/tanks" className="btn btn-primary">＋ Add Tank</Link>
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div className="stats-grid">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="dash-grid">
          <div className="card dash-wide">
            <SectionHeader icon="📈" title="Temperature Trend — Last 7 days" />
            {hasTrend ? <TemperatureChart /> : (
              <EmptyState icon="📈" title="No temperature data" message="Log water readings to see temperature trends." />
            )}
          </div>

          <div className="card dash-right">
            <SectionHeader icon="🔔" title="Live Alerts" />
            {data?.alerts?.length > 0 ? (
              <div className="alerts-list">
                {data.alerts.map((alert) => (
                  <AlertItem key={alert.title + alert.time} {...alert} />
                ))}
              </div>
            ) : (
              <EmptyState icon="🔔" title="No alerts" message="Alerts appear when water parameters need attention." />
            )}
            <Link to="/water" className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>View all parameters</Link>
          </div>

          <div className="card">
            <SectionHeader icon="📅" iconVariant="light" title="Today's Tasks">
              <Link to="/maintenance" className="btn btn-ghost btn-sm">View all</Link>
            </SectionHeader>
            {data?.tasks?.length > 0 ? (
              <div className="tasks-list">
                {data.tasks.map((task) => (
                  <TaskItem key={task.id} {...task} initialDone={task.done} onToggle={() => handleToggleTask(task.id)} />
                ))}
              </div>
            ) : (
              <EmptyState icon="📅" title="No tasks scheduled" message="Create maintenance tasks to keep your tanks healthy.">
                <Link to="/maintenance" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>Add Task</Link>
              </EmptyState>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

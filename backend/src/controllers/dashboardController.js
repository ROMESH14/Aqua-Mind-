const tankModel = require('../models/tankModel');
const waterModel = require('../models/waterModel');
const maintenanceModel = require('../models/maintenanceModel');
const alertModel = require('../models/alertModel');

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
  if (seconds < 172800) return 'Yesterday';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatAlert(alert) {
  const icons = { alert: '⚠️', warn: '🌡️' };
  return {
    type: alert.AlertType,
    icon: icons[alert.AlertType] || '🔔',
    title: alert.Title,
    detail: alert.Detail || '',
    time: timeAgo(alert.CreatedAt),
  };
}

async function getDashboard(req, res) {
  const userId = req.user.id;

  const [tankCount, totalFish, avgPH, tasksDue, overdueCount, taskCount, alerts, tasks, tempTrend] = await Promise.all([
    tankModel.countByUser(userId),
    tankModel.totalFishByUser(userId),
    waterModel.getAvgPHByUser(userId),
    maintenanceModel.countDueToday(userId),
    maintenanceModel.countOverdue(userId),
    maintenanceModel.countOpen(userId),
    alertModel.getByUser(userId, 10),
    maintenanceModel.getTasksByUser(userId, 'dashboard'),
    waterModel.getTemperatureTrend(userId, 7),
  ]);

  const stats = [
    {
      variant: 'accent', icon: '🐠', value: String(tankCount), label: 'Active Tanks',
      change: tankCount > 0 ? 'Tracking' : '—', changeType: 'up',
      valueColor: tankCount > 0 ? 'var(--aqua-dark)' : 'var(--text-muted)',
    },
    {
      variant: 'light', icon: '🐟', value: String(totalFish), label: 'Total Fish',
      change: totalFish > 0 ? 'Across tanks' : '—', changeType: 'up',
      valueColor: totalFish > 0 ? '#0891b2' : 'var(--text-muted)',
    },
    {
      variant: 'warn', icon: '⚗️',
      value: avgPH != null ? Number(avgPH).toFixed(1) : '—',
      label: 'Avg pH Level',
      change: avgPH != null ? 'Last 30 days' : '—', changeType: 'warn',
      valueColor: avgPH != null ? 'var(--warn)' : 'var(--text-muted)',
    },
    {
      variant: 'danger', icon: '📅', value: String(tasksDue), label: 'Tasks Due Today',
      change: overdueCount > 0 ? `${overdueCount} overdue` : '—', changeType: 'warn',
      valueColor: tasksDue > 0 ? 'var(--warn)' : 'var(--text-muted)',
    },
  ];

  const formattedTasks = tasks.slice(0, 5).map((t) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(t.DueDate);
    due.setHours(0, 0, 0, 0);

    let dueType = 'soon';
    let dueLabel = t.DueTime || 'Upcoming';
    if (t.IsCompleted) { dueType = 'ok'; dueLabel = 'Done'; }
    else if (due < today) { dueType = 'today'; dueLabel = 'Overdue'; }
    else if (due.getTime() === today.getTime()) { dueType = 'today'; dueLabel = 'Today'; }

    return {
      id: t.TaskID,
      name: t.TaskName,
      tank: t.TankName || 'All tanks',
      due: dueLabel,
      dueType,
      done: !!t.IsCompleted,
    };
  });

  const tanks = {};
  tempTrend.forEach((row) => {
    if (!tanks[row.TankID]) tanks[row.TankID] = { name: row.TankName, points: [] };
    tanks[row.TankID].points.push({
      temperature: row.Temperature,
      recordedAt: row.RecordedAt,
    });
  });

  res.json({
    stats,
    tankCount: Number(tankCount) || 0,
    totalFish: Number(totalFish) || 0,
    taskCount: Number(taskCount) || 0,
    alerts: alerts.map(formatAlert),
    tasks: formattedTasks,
    temperatureTrend: Object.values(tanks),
  });
}

module.exports = { getDashboard };

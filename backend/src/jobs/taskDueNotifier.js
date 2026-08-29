const maintenanceModel = require('../models/maintenanceModel');
const alertModel = require('../models/alertModel');

function taskNotifyPayload(task) {
  const tankName = task.TankName || 'All tanks';
  const when = task.DueTime ? maintenanceModel.formatDueClock(task.DueTime) : 'today';
  return {
    tankId: task.TankID || null,
    alertType: 'task',
    title: `${task.TaskName} due`,
    detail: `${when} in ${tankName}`,
    tag: `task-${task.TaskID}`,
  };
}

async function notifyDueTasks() {
  const due = await maintenanceModel.listDueForNotify();
  for (const task of due) {
    const claimed = await maintenanceModel.markNotified(task.TaskID);
    if (!claimed) continue;
    await alertModel.create(task.UserID, taskNotifyPayload(task));
  }
  return due.length;
}

function startTaskDueNotifier(intervalMs = 20000) {
  const tick = () => {
    notifyDueTasks().catch((err) => {
      console.error('Task due notifier:', err.message);
    });
  };
  tick();
  return setInterval(tick, intervalMs);
}

module.exports = { startTaskDueNotifier, notifyDueTasks, taskNotifyPayload };

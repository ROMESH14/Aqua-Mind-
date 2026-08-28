const maintenanceModel = require('../models/maintenanceModel');
const tankModel = require('../models/tankModel');
const alertModel = require('../models/alertModel');

function formatTask(task) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.DueDate);
  due.setHours(0, 0, 0, 0);

  let dueType = 'soon';
  let dueLabel = task.DueTime || due.toLocaleDateString('en-GB', { weekday: 'short' });

  if (task.IsCompleted) {
    dueType = 'ok';
    dueLabel = 'Done';
  } else if (due < today) {
    dueType = 'today';
    dueLabel = 'Overdue';
  } else if (due.getTime() === today.getTime()) {
    dueType = 'today';
    dueLabel = task.DueTime || 'Today';
  }

  return {
    id: task.TaskID,
    name: task.TaskName,
    tank: task.TankName || 'All tanks',
    tankId: task.TankID,
    due: dueLabel,
    dueType,
    done: !!task.IsCompleted,
    dueDate: task.DueDate,
    dueTime: task.DueTime,
  };
}

function formatLog(log) {
  return {
    date: log.CompletedAt,
    task: log.TaskName,
    tank: log.TankName || 'All tanks',
    duration: log.DurationMinutes ? `${log.DurationMinutes} min` : '—',
    notes: log.Notes || '',
  };
}

async function getTasks(req, res) {
  const { filter } = req.query;
  const tasks = await maintenanceModel.getTasksByUser(req.user.id, filter);
  res.json(tasks.map(formatTask));
}

async function createTask(req, res) {
  const { taskName, dueDate, dueTime, tankId } = req.body;
  if (!taskName || !dueDate) {
    return res.status(400).json({ message: 'Task name and due date are required' });
  }

  if (tankId) {
    const tank = await tankModel.findById(tankId, req.user.id);
    if (!tank) return res.status(404).json({ message: 'Tank not found' });
  }

  const task = await maintenanceModel.createTask(req.user.id, {
    taskName, dueDate, dueTime, tankId,
  });

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let notify = null;
  if (due <= today) {
    const row = await alertModel.create(req.user.id, {
      tankId: tankId || null,
      alertType: 'task',
      title: `${taskName} is due`,
      detail: due < today ? 'This care task is overdue' : 'Due today',
    });
    notify = row ? alertModel.formatNotify(row) : null;
  }

  res.status(201).json({ ...formatTask({ ...task, TankName: null }), notify });
}

async function toggleTask(req, res) {
  const task = await maintenanceModel.findTaskById(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const updated = await maintenanceModel.toggleComplete(
    req.params.id,
    req.user.id,
    !task.IsCompleted
  );

  if (updated.IsCompleted) {
    await maintenanceModel.createLog(req.user.id, {
      tankId: updated.TankID,
      taskName: updated.TaskName,
      durationMinutes: null,
      notes: 'Marked complete from task list',
    });
  }

  res.json(formatTask({ ...updated, TankName: null }));
}

async function deleteTask(req, res) {
  const deleted = await maintenanceModel.removeTask(req.params.id, req.user.id);
  if (!deleted) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
}

async function getLogs(req, res) {
  const logs = await maintenanceModel.getLogs(req.user.id);
  res.json(logs.map(formatLog));
}

async function createLog(req, res) {
  const { taskName, tankId, durationMinutes, notes } = req.body;
  if (!taskName) return res.status(400).json({ message: 'Task name is required' });

  const log = await maintenanceModel.createLog(req.user.id, {
    taskName, tankId, durationMinutes, notes,
  });
  res.status(201).json(formatLog({ ...log, TankName: null }));
}

module.exports = { getTasks, createTask, toggleTask, deleteTask, getLogs, createLog };

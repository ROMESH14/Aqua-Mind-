const maintenanceModel = require('../models/maintenanceModel');
const tankModel = require('../models/tankModel');
const alertModel = require('../models/alertModel');

function pad2(value) {
  return String(value).padStart(2, '0');
}

function dueDateKey(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const us = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (us) return `${us[3]}-${pad2(us[1])}-${pad2(us[2])}`;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const utcMidnight = date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
  if (utcMidnight) {
    return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
  }
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function field(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] != null && row[key] !== '') return row[key];
  }
  return undefined;
}

function formatTask(task) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const key = dueDateKey(field(task, 'DueDate', 'duedate', 'dueDate'));
  const due = key ? new Date(`${key}T00:00:00`) : new Date(NaN);
  if (!Number.isNaN(due.getTime())) due.setHours(0, 0, 0, 0);

  let dueType = 'soon';
  let dueLabel = field(task, 'DueTime', 'duetime') || (!Number.isNaN(due.getTime())
    ? due.toLocaleDateString('en-GB', { weekday: 'short' })
    : 'Upcoming');

  if (field(task, 'IsCompleted', 'iscompleted')) {
    dueType = 'ok';
    dueLabel = 'Done';
  } else if (!Number.isNaN(due.getTime()) && due < today) {
    dueType = 'today';
    dueLabel = 'Overdue';
  } else if (!Number.isNaN(due.getTime()) && due.getTime() === today.getTime()) {
    dueType = 'today';
    dueLabel = field(task, 'DueTime', 'duetime') || 'Today';
  }

  return {
    id: field(task, 'TaskID', 'taskid'),
    name: field(task, 'TaskName', 'taskname'),
    tank: field(task, 'TankName', 'tankname') || 'All tanks',
    tankId: field(task, 'TankID', 'tankid'),
    due: dueLabel,
    dueType,
    done: !!field(task, 'IsCompleted', 'iscompleted'),
    dueDate: key,
    dueTime: field(task, 'DueTime', 'duetime') || null,
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

  let tank = null;
  if (tankId) {
    tank = await tankModel.findById(tankId, req.user.id);
    if (!tank) return res.status(404).json({ message: 'Tank not found' });
  }

  const task = await maintenanceModel.createTask(req.user.id, {
    taskName,
    dueDate: dueDateKey(dueDate) || dueDate,
    dueTime,
    tankId,
  });

  const dueAt = maintenanceModel.parseDueAt({ DueDate: dueDate, DueTime: dueTime });
  let notify = null;
  if (!Number.isNaN(dueAt.getTime()) && dueAt.getTime() <= Date.now()) {
    await maintenanceModel.markNotified(task.TaskID);
    const tankName = tank?.Name || null;
    const row = await alertModel.create(req.user.id, {
      tankId: tankId || null,
      alertType: 'task',
      title: `${taskName} due`,
      detail: `${dueTime ? maintenanceModel.formatDueClock(dueTime) : 'today'} in ${tankName || 'All tanks'}`,
      tag: `task-${task.TaskID}`,
    });
    notify = row ? alertModel.formatNotify(row, { tag: `task-${task.TaskID}` }) : null;
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

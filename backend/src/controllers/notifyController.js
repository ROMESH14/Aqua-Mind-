const alertModel = require('../models/alertModel');
const notifyHub = require('../realtime/notifyHub');

async function list(req, res) {
  const rows = await alertModel.getByUser(req.user.id, 20);
  res.json(rows.map(alertModel.formatNotify));
}

async function markRead(req, res) {
  await alertModel.markAllRead(req.user.id);
  res.json({ ok: true });
}

async function stream(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.socket?.setNoDelay?.(true);
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  notifyHub.addClient(req.user.id, res);
  res.write(`event: hello\ndata: ${JSON.stringify({ ok: true })}\n\n`);
  if (typeof res.flush === 'function') res.flush();

  const beat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(beat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(beat);
    notifyHub.removeClient(req.user.id, res);
  });
}

module.exports = { list, markRead, stream };

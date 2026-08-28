const clients = new Map();

function addClient(userId, res) {
  const id = Number(userId);
  if (!clients.has(id)) clients.set(id, new Set());
  clients.get(id).add(res);
}

function removeClient(userId, res) {
  const id = Number(userId);
  const set = clients.get(id);
  if (!set) return;
  set.delete(res);
  if (!set.size) clients.delete(id);
}

function sendToUser(userId, event, data) {
  const set = clients.get(Number(userId));
  if (!set?.size) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try {
      res.write(payload);
      if (typeof res.flush === 'function') res.flush();
    } catch {
      set.delete(res);
    }
  }
}

module.exports = { addClient, removeClient, sendToUser };

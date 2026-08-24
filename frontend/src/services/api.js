const API_URL = process.env.REACT_APP_API_URL || '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      `Cannot reach server. Press F5 in VS Code (Aqua Mind Full Stack) or run "npm run dev" from the project root.`
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    let message = data.message;
    if (!message) {
      if (res.status === 401) message = 'Session expired — please log in again.';
      else if (res.status === 503) message = 'Database unavailable. Start WAMP MySQL, then restart the backend.';
      else if (res.status === 404) {
        message = 'API not found. Start AquaMind backend on port 5005 (port 5000 may be used by another app). Run F5 → Aqua Mind (Full Stack).';
      } else if (res.status >= 500) {
        message = 'Backend is not running. Press F5 → Aqua Mind (Full Stack), or run "npm run dev" from the project root.';
      } else {
        message = `Request failed (${res.status})`;
      }
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return data;
}

const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body || {}) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export default api;

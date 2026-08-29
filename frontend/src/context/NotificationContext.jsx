import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { maintenanceService } from '../services/maintenanceService';
import { notifyService } from '../services/notifyService';

const NotificationContext = createContext(null);

function taskDueStamp(task) {
  const raw = String(task.dueDate || '').slice(0, 10);
  const [year, month, day] = raw.split('-').map(Number);
  if (!year || !month || !day) return null;
  const match = String(task.dueTime || '00:00').match(/(\d{1,2}):(\d{2})/);
  return new Date(year, month - 1, day, match ? Number(match[1]) : 0, match ? Number(match[2]) : 0, 0, 0);
}

function formatClock(dueTime) {
  const match = String(dueTime || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return 'today';
  const hour24 = Number(match[1]);
  const minute = match[2];
  const period = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour24 % 12 || 12}:${minute} ${period}`;
}

function notifiedKey(userId) {
  return `aqamind-task-notified:${userId}`;
}

function loadNotified(userId) {
  try {
    return new Set(JSON.parse(localStorage.getItem(notifiedKey(userId)) || '[]'));
  } catch {
    return new Set();
  }
}

function saveNotified(userId, ids) {
  localStorage.setItem(notifiedKey(userId), JSON.stringify([...ids]));
}

function streamUrl(token) {
  const path = process.env.REACT_APP_API_URL || '/api';
  // CRA's /api proxy buffers SSE, so talk to the API host directly in the browser.
  const origin = path.startsWith('/')
    ? (process.env.REACT_APP_API_ORIGIN || `${window.location.protocol}//${window.location.hostname}:5005`)
    : '';
  return `${origin}${path}/notify/stream?token=${encodeURIComponent(token)}`;
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const toastTimer = useRef(null);
  const seen = useRef(new Set());

  const pushItem = (item) => {
    setItems((current) => {
      const key = String(item.tag || item.id);
      if (current.some((row) => String(row.tag || row.id) === key)) return current;
      return [item, ...current].slice(0, 20);
    });
  };

  const sendMessage = (item) => {
    if (!item?.title) return;
    const key = String(item.tag || item.id || `${item.title}-${item.detail}`);
    if (seen.current.has(key)) return;
    seen.current.add(key);
    if (item.tag) seen.current.add(item.tag);
    if (item.id) seen.current.add(String(item.id));
    pushItem({ ...item, read: false });
    setToast(item);
    setUnread((count) => count + 1);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 8000);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(item.title, {
          body: item.detail || 'AquaMind',
          tag: item.tag || key,
        });
      } catch {
        /* ignore browser block */
      }
    }
  };

  useEffect(() => {
    if (!user) return undefined;
    const token = localStorage.getItem('token');
    if (!token) return undefined;

    let source;
    let retry;
    let cancelled = false;

    const connect = () => {
      source = new EventSource(streamUrl(token));
      source.addEventListener('alert', (event) => {
        try {
          sendMessage(JSON.parse(event.data));
        } catch {
          /* ignore */
        }
      });
      source.onerror = () => {
        source.close();
        if (!cancelled) retry = setTimeout(connect, 3000);
      };
    };

    connect();

    notifyService.list()
      .then((rows) => {
        if (!Array.isArray(rows)) return;
        setItems(rows);
        setUnread(rows.filter((row) => !row.read).length);
        rows.forEach((row) => {
          const key = String(row.tag || row.id);
          if (key) seen.current.add(key);
        });
      })
      .catch(() => {});

    const stored = loadNotified(user.id);
    const checkTasks = async () => {
      try {
        const tasks = await maintenanceService.getTasks();
        const now = Date.now();
        tasks.forEach((task) => {
          if (task.done) return;
          const dueAt = taskDueStamp(task);
          if (!dueAt || dueAt.getTime() > now) return;
          const tag = `task-${task.id}`;
          if (stored.has(tag) || seen.current.has(tag)) return;
          stored.add(tag);
          sendMessage({
            id: tag,
            type: 'task',
            title: `${task.name} due`,
            detail: `${task.dueTime ? formatClock(task.dueTime) : 'today'} in ${task.tank || 'All tanks'}`,
            href: '/maintenance',
            tag,
          });
        });
        saveNotified(user.id, stored);
      } catch {
        /* ignore */
      }
    };
    checkTasks();
    const poll = setInterval(checkTasks, 20000);

    return () => {
      cancelled = true;
      clearTimeout(retry);
      clearInterval(poll);
      source?.close();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [user]);

  const enableBrowser = async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  };

  const openInbox = async () => {
    try {
      const rows = await notifyService.list();
      if (Array.isArray(rows)) {
        setItems((current) => {
          const keys = new Set(rows.map((row) => String(row.tag || row.id)));
          const extra = current.filter((row) => !keys.has(String(row.tag || row.id)));
          return [...extra, ...rows].slice(0, 20);
        });
        setUnread(rows.filter((row) => !row.read).length);
      }
    } catch {
      /* ignore */
    }
    await enableBrowser();
  };

  const markInboxRead = async () => {
    setItems((current) => current.map((row) => ({ ...row, read: true })));
    setUnread(0);
    try {
      await notifyService.markRead();
    } catch {
      /* ignore */
    }
  };

  const value = useMemo(() => ({
    toast,
    items,
    unread,
    announce: sendMessage,
    enableBrowser,
    openInbox,
    markInboxRead,
    dismissToast: () => setToast(null),
  }), [toast, items, unread]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

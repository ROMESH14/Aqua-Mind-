import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

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
  const [unread, setUnread] = useState(0);
  const toastTimer = useRef(null);
  const seen = useRef(new Set());

  const sendMessage = (item) => {
    if (!item?.title) return;
    const key = String(item.id || `${item.title}-${item.detail}`);
    if (seen.current.has(key)) return;
    seen.current.add(key);
    setToast(item);
    setUnread((count) => count + 1);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 8000);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification('AquaMind', {
          body: item.detail ? `${item.title}. ${item.detail}` : item.title,
          tag: key,
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

    return () => {
      cancelled = true;
      clearTimeout(retry);
      source?.close();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [user]);

  const enableBrowser = async () => {
    setUnread(0);
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  };

  const value = useMemo(() => ({
    toast,
    unread,
    announce: sendMessage,
    enableBrowser,
    dismissToast: () => setToast(null),
  }), [toast, unread]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

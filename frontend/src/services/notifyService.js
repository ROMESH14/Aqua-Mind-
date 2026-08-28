import api from './api';

export const notifyService = {
  list: () => api.get('/notify'),
  markRead: () => api.post('/notify/read', {}),
};

import api from './api';

export const maintenanceService = {
  getTasks: (filter) => api.get(`/maintenance/tasks${filter ? `?filter=${filter}` : ''}`),
  createTask: (data) => api.post('/maintenance/tasks', data),
  toggleTask: (id) => api.patch(`/maintenance/tasks/${id}`),
  deleteTask: (id) => api.delete(`/maintenance/tasks/${id}`),
  getLogs: () => api.get('/maintenance/logs'),
  createLog: (data) => api.post('/maintenance/logs', data),
};

import api from './api';

const STORAGE_KEY = 'aquamind-saved-plans';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function matchesQuery(plan, query) {
  if (!query) return true;
  const hay = `${plan.title} ${plan.searchText || ''}`.toLowerCase();
  return hay.includes(query.toLowerCase());
}

export const planService = {
  async list(query = '', kind = '') {
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (kind) params.set('kind', kind);
      const qs = params.toString();
      return await api.get(`/plans${qs ? `?${qs}` : ''}`);
    } catch {
      return readLocal().filter((plan) => (!kind || plan.kind === kind) && matchesQuery(plan, query));
    }
  },

  async save(payload) {
    try {
      return await api.post('/plans', payload);
    } catch {
      const plan = {
        id: Date.now(),
        kind: payload.kind || 'plants',
        title: payload.title,
        searchText: [
          payload.title,
          payload.form?.tankStyle,
          payload.form?.tankShape,
          payload.form?.theme,
          ...(payload.result?.plants || []).map((p) => p.name),
          ...(payload.result?.recommendations || []).map((p) => p.name),
          ...(payload.result?.stocking || []).map((p) => p.name),
        ].join(' '),
        form: payload.form,
        result: payload.result,
        createdAt: new Date().toISOString(),
      };
      writeLocal([plan, ...readLocal()]);
      return plan;
    }
  },

  async remove(id) {
    try {
      return await api.delete(`/plans/${id}`);
    } catch {
      writeLocal(readLocal().filter((plan) => String(plan.id) !== String(id)));
      return { message: 'Saved plan deleted' };
    }
  },
};

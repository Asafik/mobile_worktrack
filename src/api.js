// Pure REST API Client for Biustechno Mobile Companion
// ZERO database keys or AI tokens stored in mobile app!

export const DEFAULT_API_HOST = 'https://biustechno.vercel.app';

export const api = {
  // NOTES API
  async getNotes(host = DEFAULT_API_HOST) {
    const res = await fetch(`${host}/api/notes`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memuat catatan dari API');
    return json.data || [];
  },

  async createNote(host = DEFAULT_API_HOST, payload) {
    const res = await fetch(`${host}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal membuat catatan via API');
    return json.data;
  },

  async updateNote(host = DEFAULT_API_HOST, id, payload) {
    const res = await fetch(`${host}/api/notes?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memperbarui catatan via API');
    return json.data;
  },

  async deleteNote(host = DEFAULT_API_HOST, id) {
    const res = await fetch(`${host}/api/notes?id=${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menghapus catatan via API');
    return json;
  },

  // TASKS API
  async getTasks(host = DEFAULT_API_HOST) {
    const res = await fetch(`${host}/api/tasks`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memuat tugas dari API');
    return json.data || [];
  },

  async createTask(host = DEFAULT_API_HOST, payload) {
    const res = await fetch(`${host}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal membuat tugas via API');
    return json.data;
  },

  async updateTask(host = DEFAULT_API_HOST, id, payload) {
    const res = await fetch(`${host}/api/tasks?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memperbarui tugas via API');
    return json.data;
  },

  async deleteTask(host = DEFAULT_API_HOST, id) {
    const res = await fetch(`${host}/api/tasks?id=${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menghapus tugas via API');
    return json;
  },

  // PROJECTS API
  async getProjects(host = DEFAULT_API_HOST) {
    const res = await fetch(`${host}/api/projects`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memuat proyek dari API');
    return json.data || [];
  },

  // GEMINI AI (TERPUSAT DI BACKEND WEB)
  async refineAi(host = DEFAULT_API_HOST, title, content) {
    const res = await fetch(`${host}/api/ai-refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal merapikan teks dengan AI');
    return json;
  },
};

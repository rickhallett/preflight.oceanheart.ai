const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export class ApiClient {
  async get(endpoint: string) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  health() {
    return this.get('/health');
  }
}


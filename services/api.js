const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const api = {
  async request(path, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`The API request was blocked or unavailable at ${API_BASE_URL}. Check your connection, the API deployment, and browser CORS settings.`);
      }

      throw error;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong.');
    }

    return data;
  },
};

export default api;

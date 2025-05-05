const BASE_URL = 'https://story-api.dicoding.dev/v1';
const TIMEOUT_SECONDS = 10;

class Model {
  constructor() {
    this._baseUrl = BASE_URL;
    this._token = localStorage.getItem('token') || null;
  }

  async _fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_SECONDS * 1000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(this._token && { Authorization: `Bearer ${this._token}` }),
          ...options.headers,
        },
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(responseJson.message || 'An error occurred');
      }

      return responseJson;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw new Error(error.message || 'Network error - please check your connection');
    } finally {
      clearTimeout(timeout);
    }
  }

  async register(name, email, password) {
    return this._fetchWithTimeout(`${this._baseUrl}/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email, password) {
    const response = await this._fetchWithTimeout(`${this._baseUrl}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this._token = response.loginResult.token;
    localStorage.setItem('token', this._token);

    return response;
  }

  async getStories() {
    const endpoint = this._token ? `${this._baseUrl}/stories` : `${this._baseUrl}/stories/guest`;
    const response = await this._fetchWithTimeout(endpoint);
    return response.listStory;
  }

  async addStory(formData, isGuest = false) {
    const endpoint = isGuest ? `${this._baseUrl}/stories/guest` : `${this._baseUrl}/stories`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...(this._token && { Authorization: `Bearer ${this._token}` }),
      },
      body: formData,
    });

    const responseJson = await response.json();

    if (!response.ok) {
      throw new Error(responseJson.message || 'Failed to add story');
    }

    return responseJson;
  }

  async getStoryDetail(id) {
    const response = await this._fetchWithTimeout(`${this._baseUrl}/stories/${id}`);
    return response.story;
  }

  logout() {
    this._token = null;
    localStorage.removeItem('token');
  }

  isLoggedIn() {
    return !!this._token;
  }

  getToken() {
    return this._token;
  }
}

export default Model;

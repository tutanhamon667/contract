import { BACKEND_BASE_URL } from './constants';

class UserAPI {
  constructor(setUserData, setToken, setIsAuthenticated, setError) {
    this.setUserData = setUserData;
    this.setToken = setToken;
    this.setError = setError;
    this.setIsAuthenticated = setIsAuthenticated;
  }

  async register(data) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const res = await this.checkResponse(response);
      if (res.success) {
        this.setUserData(res.data);
      } else {
        this.setError(res.error);
      }
      this.setIsAuthenticated(res.success);
      return res;
    } catch (error) {
      this.setError(error);
    }
  }

  async authenticate({ email, password }) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/login/jwt/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const res = await this.checkResponse(response);
      if (res.success) {
        this.setUserData(res.data);
      } else {
        this.setError(res.error);
      }
      this.setIsAuthenticated(res.success);
      return res;
    } catch (error) {
      this.setError(error);
    }
  }

  async getNewAccessToken() {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/login/jwt/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: localStorage.getItem('refresh') }),
      });
      const res = await this.checkResponse(response);
      if (res.success) {
        const token = ({ access, refresh } = res.data);
        this.setToken(token);
      } else {
        this.setError(res.error);
      }
      return res;
    } catch (error) {
      this.setError(error);
    }
  }

  async getUserInfo() {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/users/me/`, {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem('access')}`,
        },
      });
      const res = await this.checkResponse(response);
      if (res.success) {
        this.setUserData(res.data);
      } else {
        this.setError(res.error);
      }
      this.setIsAuthenticated(res.success);
      return res;
    } catch (error) {
      this.setError(error);
    }
  }

  async checkResponse(response) {
    const res = { success: false, error: null, data: null };
    if (response.ok) {
      res.success = true;
      res.data = await response.json();
    } else {
      const error = await response.json();
      res.error = error;
      this.setError(error);
    }
    return res;
  }

  // Другие методы для работы с пользователями
}

export { UserAPI };

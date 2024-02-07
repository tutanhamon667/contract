import { BACKEND_BASE_URL } from './constants';
class ResumeAPI {
  constructor(setResumeData, setError) {
    this.setResumeData = setResumeData;
    this.setError = setError;
  }

  async getUserResumes() {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/profile/resume`, {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem('access')}`,
        },
      });
      const resumeData = await checkResponse(response);
      this.setResumeData(resumeData);
      return resumeData;
    } catch (error) {
      this.setError(error);
    }
  }

  async getResume(data) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/profile/resume/${data.id}`, {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem('access')}`,
        },
      });
      const res = await this.checkResponse(response);
      if (res.success) {
        this.setResumeData(res.data);
      }
      return res;
    } catch (error) {
      this.setError(error);
    }
  }

  async updateResume(data) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/profile/resume/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('access')}`,
        },
        body: JSON.stringify(data),
      });
      const res = await this.checkResponse(response);
      return res;
    } catch (error) {
      this.setError(error);
    }
  }

  async createResume(data) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/profile/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('access')}`,
        },
        body: JSON.stringify(data),
      });
      const res = await this.checkResponse(response);
      return res;
    } catch (error) {
      this.setError(error);
    }
  }

  async deleteResume(data) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/profile/resume/${data.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('access')}`,
        },
        body: JSON.stringify(data),
      });
      const res = await this.checkResponse(response);
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
  // Другие методы для работы с резюме
}

export { ResumeAPI };

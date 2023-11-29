import { BACKEND_BASE_URL } from './constants';

function checkResponse(response) {
  if (response.ok) {
    return response.json();
  }

  return response.json().then((error) => Promise.reject(error));
}

function register(data) {
  return fetch(`${BACKEND_BASE_URL}/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((response) => checkResponse(response));
}

function authenticateUser({ email, password }) {
  return fetch(`${BACKEND_BASE_URL}/login/jwt/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
}

function getNewAccessToken() {
  return fetch(`${BACKEND_BASE_URL}/login/jwt/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: localStorage.getItem('refresh') }),
  });
}

function getUserInfo() {
  return fetch(`${BACKEND_BASE_URL}/users/me/`, {
    headers: {
      authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
  });
}

function createUserProfile(data) {
  return fetch(`${BACKEND_BASE_URL}/users/me/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
    body: JSON.stringify(data),
  }).then((response) => checkResponse(response));
}

function updateUserProfile(data) {
  return fetch(`${BACKEND_BASE_URL}/users/me/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
    body: JSON.stringify(data),
  }).then((response) => checkResponse(response));
}

function createTask(data) {
  return fetch(`${BACKEND_BASE_URL}/jobs/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
    body: JSON.stringify(data),
  }).then((response) => checkResponse(response));
}

function getTasks() {
  return fetch(`${BACKEND_BASE_URL}/jobs/`).then((response) => checkResponse(response));
}

function getTasksWithAuthorization() {
  return fetch(`${BACKEND_BASE_URL}/jobs/`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
  }).then((response) => checkResponse(response));
}

function getTaskById(id) {
  return fetch(`${BACKEND_BASE_URL}/jobs/${id}/`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
  }).then((response) => checkResponse(response));
}

function getFreelancers() {
  return fetch(`${BACKEND_BASE_URL}/main`).then((response) => checkResponse(response));
}

function getFreelancerById(id) {
  return fetch(`${BACKEND_BASE_URL}/users/${id}`).then((response) => checkResponse(response));
}

export {
  register,
  authenticateUser,
  getNewAccessToken,
  getUserInfo,
  createUserProfile,
  updateUserProfile,
  createTask,
  getTasks,
  getTasksWithAuthorization,
  getTaskById,
  getFreelancers,
  getFreelancerById,
};

import { BACKEND_BASE_URL } from './constants';

function checkResponse(res) {
  if (res.ok) {
    return res.json();
  }

  return res.json().then((err) => Promise.reject(err));
}

function register(data) {
  return fetch(`${BACKEND_BASE_URL}/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((res) => checkResponse(res));
}

function authenticateUser({ email, password }) {
  // console.log({email, password})
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
  }).then((res) => checkResponse(res));
}

function updateUserProfile(data) {
  return fetch(`${BACKEND_BASE_URL}/users/me/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
    body: JSON.stringify(data),
  }).then((res) => checkResponse(res));
}

function createTask(data) {
  return fetch(`${BACKEND_BASE_URL}/jobs/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
    body: JSON.stringify(data),
  }).then((res) => checkResponse(res));
}

export {
  register,
  authenticateUser,
  getNewAccessToken,
  getUserInfo,
  createUserProfile,
  updateUserProfile,
  createTask,
};

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

function updateTask(data, id) {
  return fetch(`${BACKEND_BASE_URL}/jobs/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
    body: JSON.stringify(data),
  }).then((response) => checkResponse(response));
}

function getTasks(searchQuery) {
  return fetch(`${BACKEND_BASE_URL}/jobs/${searchQuery}`).then((response) =>
    checkResponse(response),
  );
}

function getTasksWithSearch(searchQuery) {
  return fetch(`${BACKEND_BASE_URL}/jobs/${searchQuery}`).then((response) =>
    checkResponse(response),
  );
}

function getTasksWithAuthorization() {
  return fetch(`${BACKEND_BASE_URL}/jobs/`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
  }).then((response) => checkResponse(response));
}

function getTasksFreelancerWithAuthorization(searchQuery) {
  // console.log(
  //   `${BACKEND_BASE_URL}/jobs/${
  //     searchQuery ? `${searchQuery}&is_responded=true` : `?is_responded=true`
  //   }`,
  // );
  return fetch(
    `${BACKEND_BASE_URL}/jobs/${
      searchQuery ? `${searchQuery}&is_responded=true` : `?is_responded=true`
    }`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
    },
  ).then((response) => checkResponse(response));
}

function getTasksCustomerWithAuthorization(searchQuery, userID) {
  return fetch(
    `${BACKEND_BASE_URL}/jobs/${
      searchQuery ? `${searchQuery}&client=${userID}` : `?client=${userID}`
    }`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
    },
  ).then((response) => checkResponse(response));
}

function getTaskById(id) {
  return fetch(`${BACKEND_BASE_URL}/jobs/${id}/`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
  }).then((response) => checkResponse(response));
}

function deleteTaskById(id) {
  return fetch(`${BACKEND_BASE_URL}/jobs/${id}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
  }).then((response) => checkResponse(response));
}

function respondToTask(id) {
  return fetch(`${BACKEND_BASE_URL}/jobs/${id}/response/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
  }).then((response) => checkResponse(response));
}

function getFreelancers(searchQuery) {
  return fetch(`${BACKEND_BASE_URL}/main/${searchQuery}`).then((response) =>
    checkResponse(response),
  );
}

function getFreelancerById(id) {
  return fetch(`${BACKEND_BASE_URL}/users/${id}`).then((response) => checkResponse(response));
}

function getAllCategories() {
  return fetch(`${BACKEND_BASE_URL}/category/`).then((response) => checkResponse(response));
}

function requestNewPassword(email) {
  return fetch(`${BACKEND_BASE_URL}/users/reset_password/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(email),
  }).then((response) => checkResponse(response));
}

function createChat(data) {
  return fetch(`${BACKEND_BASE_URL}/chats/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    },
    body: JSON.stringify(data),
  }).then((response) => checkResponse(response));
}

function getDataByPagination(request) {
  const newRequest = request.replace('http://taski.ddns.net/api', '');

  return fetch(
    `${BACKEND_BASE_URL}${newRequest}`,
    // {
    //   headers: {
    //     Authorization: `Bearer ${sessionStorage.getItem('access')}`,
    //   }
    // }
  ).then((response) => checkResponse(response));
}

export {
  register,
  authenticateUser,
  getNewAccessToken,
  getUserInfo,
  updateUserProfile,
  requestNewPassword,
  createTask,
  updateTask,
  getTasks,
  getTasksWithSearch,
  getTasksWithAuthorization,
  getTasksCustomerWithAuthorization,
  getTasksFreelancerWithAuthorization,
  getTaskById,
  deleteTaskById,
  respondToTask,
  getFreelancers,
  getFreelancerById,
  getAllCategories,
  getDataByPagination,
  createChat,
};

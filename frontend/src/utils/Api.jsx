import { BACKEND_BASE_URL } from './constants';

async function checkResponse(response) {
  if (response.ok) {
    return await response.json();
  }
  const error = await response.json();
  throw error;
}

async function register(data) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function authenticateUser({ email, password }) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/login/jwt/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function getNewAccessToken() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/login/jwt/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: localStorage.getItem('refresh') }),
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getUserResumes(setFunction) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/resume`, {
      headers: {
        authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
    });
    const res = await checkResponse(response);
    if (res) {
      setFunction(res);
    }
  } catch (error) {
    throw error;
  }
}

async function getResume(data) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/resume/${data.id}`, {
      headers: {
        authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function updateResume(data) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/resume/${data.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
      body: JSON.stringify(data),
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function createResume(data) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
      body: JSON.stringify(data),
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function deleteResume(data) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/resume/${data.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
      body: JSON.stringify(data),
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getUserInfo() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/users/me/`, {
      headers: {
        authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function updateUserProfile(data) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/users/me/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
      body: JSON.stringify(data),
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function createTask(data) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/jobs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
      body: JSON.stringify(data),
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function updateTask(data, id) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/jobs/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
      body: JSON.stringify(data),
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getTasks(searchQuery) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/jobs/${searchQuery}`);
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getTasksWithSearch(searchQuery) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/jobs/${searchQuery}`);
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getTasksWithAuthorization() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/jobs/`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getTasksFreelancerWithAuthorization(searchQuery) {
  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/jobs/${
        searchQuery ? `${searchQuery}&is_responded=true` : `?is_responded=true`
      }`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('access')}`,
        },
      },
    );
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getTasksCustomerWithAuthorization(searchQuery, userID) {
  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/jobs/${
        searchQuery ? `${searchQuery}&client=${userID}` : `?client=${userID}`
      }`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('access')}`,
        },
      },
    );
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getTaskById(id) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/jobs/${id}/`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function deleteTaskById(id) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/jobs/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function respondToTask(id) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/jobs/${id}/response/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getResponses(id, searchQuery) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/jobs/${id}/offers/${searchQuery}`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getFreelancers(searchQuery) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/main/${searchQuery}`);
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getFreelancerById(id) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/users/${id}`);
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getAllCategories() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/category/`);
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function requestNewPassword(email) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/users/reset_password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(email),
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function createChat(data) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/chats/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('access')}`,
      },
      body: JSON.stringify(data),
    });
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
}

async function getDataByPagination(request) {
  try {
    const newRequest = request.replace('http://taski.ddns.net/api', '');
    const response = await fetch(`${BACKEND_BASE_URL}${newRequest}`);
    return await checkResponse(response);
  } catch (error) {
    throw error;
  }
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
  getResponses,
  getFreelancers,
  getFreelancerById,
  getAllCategories,
  getDataByPagination,
  createChat,
  getResume,
  updateResume,
  deleteResume,
  createResume,
  getUserResumes,
};

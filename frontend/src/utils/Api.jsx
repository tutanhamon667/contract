import { BACKEND_BASE_URL } from './constants';

function _checkResponse(res) {
  if (res.ok) {
    return res.json()
  } else {
    return res.json().then((err) => Promise.reject(err))
  }
}

export function register({ first_name, last_name, email, password, re_password, is_customer, is_worker }) {
  return fetch(`${BACKEND_BASE_URL}/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      first_name,
      last_name,
      email,
      password,
      re_password,
      is_customer,
      is_worker
    })
  })
    .then((res) => _checkResponse(res));
}

export function authenticateUser({ email, password }) {
  console.log({email, password})
  return fetch(`${BACKEND_BASE_URL}/login/jwt/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
}

export function getNewAccessToken() {
  return fetch(`${BACKEND_BASE_URL}/login/jwt/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh: localStorage.getItem('refresh') })
  })
}

export function getUserInfo() {
  return fetch(`${BACKEND_BASE_URL}/users/me/`, {
    headers: {
      authorization: `Bearer ${sessionStorage.getItem('access')}`
    }
  })
}

export function sendCustomerInfo({photo, name, activity, about, web}){
  console.log({photo, name, activity, about, web})
  return fetch(`${BACKEND_BASE_URL}/users/me/`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem('access')}`
    },
    body: JSON.stringify({
      "photo": photo,
      "name": name,
      "industry": {"name" : activity},
      "about": about,
      "web": web
    })
  })
  .then((res) => _checkResponse(res));
}

const api = 'https://taski.ddns.net/api/';

function checkResponse(res) {
  if (res.ok) {
      return res.json()
  } else {
      return res.json().then((err) => Promise.reject(`${err.message}`))
  }
}

export function register({ first_name, last_name, email, password, re_password, is_customer, is_worker }) {

  return fetch(`${api}/users/reg_in/`, {
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
      .then((res) => checkResponse(res));
}

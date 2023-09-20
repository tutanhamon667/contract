import React from 'react'
import LoginForm from '../../components/Forms/LoginForm/LoginForm';
import "./Login.css";


const Login = () => {
  return (
    <div className="wrapper">
    <div className="container">
      <h1 className="title">Вход в профиль</h1>
    <LoginForm/>
    </div>
  </div>
  )
}

export default Login
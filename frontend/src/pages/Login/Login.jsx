import React from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/Forms/LoginForm/LoginForm';
import { Context } from '../../context/context';
import "./Login.css";


const Login = () => {
  const {authenticated} = React.useContext(Context);
  const location = useLocation();

  if (authenticated) {
    return <Navigate to={"/"} state={{ from: location }} />;
  }
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
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/Forms/LoginForm/LoginForm';
import { Context } from '../../context/context';
import "./Login.css";


const Login = ({ setIsAuthenticated, setCurrentUser, currentUser }) => {
  const { isAuthenticated } = React.useContext(Context);
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={"/"} state={{ from: location }} />;
  }

  return (
    <div className="wrapper">
      <div className="container">
        <h1 className="title">Вход в профиль</h1>
        <LoginForm
          setIsAuthenticated={setIsAuthenticated}
          setCurrentUser={setCurrentUser}
          currentUser={currentUser}
        />
      </div>
    </div>
  )
}

export default Login;

import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Context } from '../../context/context';
import { LoginForm } from '../../components/FormComponents/LoginForm/LoginForm';
import './Login.css';

function Login({ setIsAuthenticated, setCurrentUser, currentUser }) {
  const { isAuthenticated } = useContext(Context);
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return (
    <div className="login__wrapper">
      <div className="login__container">
        <h1 className="login__title">Вход в профиль</h1>
        <LoginForm
          setIsAuthenticated={setIsAuthenticated}
          setCurrentUser={setCurrentUser}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}

export { Login };

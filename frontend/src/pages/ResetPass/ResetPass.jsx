import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Context } from '../../context/context';
import { SetNewPassForm } from '../../components/FormComponents/SetNewPassForm/SetNewPassForm';
import './ResetPass.css';

function ResetPass() {
  const { isAuthenticated } = useContext(Context);
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} />;
  }
  return (
    <div className="reset-password__wrapper">
      <div className="reset-password__container">
        <h1 className="reset-password__title">Новый пароль</h1>
        <SetNewPassForm />
      </div>
    </div>
  );
}

export { ResetPass };

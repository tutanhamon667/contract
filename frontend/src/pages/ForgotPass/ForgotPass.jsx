import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Context } from '../../context/context';
import { Button } from '../../components/Button/Button';
import { ForgotPassForm } from '../../components/Forms/ForgotPassForm/ForgotPassForm';
import './ForgotPass.css';

function ForgotPass() {
  const { isAuthenticated } = React.useContext(Context);
  const location = useLocation();
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  if (isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} />;
  }
  return (
    <>
      {!isPopupOpen && (
        <div className="forgot-pass__wrapper">
          <div className="forgot-pass__container">
            <h1 className="forgotPass__title">Забыли пароль?</h1>
            <ForgotPassForm func={togglePopup} />
          </div>
        </div>
      )}
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-check-mark" />
            <p className="popup-title">Отправлено</p>
            <span className="popup-description">
              Проверьте свою почту и перейдите по ссылке, чтобы сбросить пароль
            </span>
            <Button onClick={togglePopup} text="Хорошо" />
          </div>
        </div>
      )}
    </>
  );
}

export { ForgotPass };

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import SetNewPassForm from "../../components/Forms/SetNewPassForm/SetNewPassForm";
import { Context } from "../../context/context";
import "./ResetPass.css";

const ResetPass = () => {
  const { isAuthenticated } = React.useContext(Context);
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} />;
  }
  return (
    <div className="resetPass__wrapper">
      <div className="resetPass__container">
        <h1 className="resetPass__title">Новый пароль</h1>
          <SetNewPassForm />
      </div>
    </div>
  );
};

export default ResetPass;

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import SetNewPassForm from "../../components/Forms/SetNewPassForm/SetNewPassForm";
import { Context } from "../../context/context";
import "./ResetPass.css";

const ResetPass = () => {
  const { authenticated } = React.useContext(Context);
  const location = useLocation();

  if (authenticated) {
    return <Navigate to={"/"} state={{ from: location }} />;
  }
  return (
    <div className="wrapper">
      <div className="container">
        <h1 className="title">Новый пароль</h1>
          <SetNewPassForm />
      </div>
    </div>
  );
};

export default ResetPass;

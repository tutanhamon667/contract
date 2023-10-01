import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import ForgotPassForm from "../../components/Forms/ForgotPassForm/ForgotPassForm";
import SetNewPassForm from "../../components/Forms/SetNewPassForm/SetNewPassForm";
import { Context } from "../../context/context";

const ForgotPass = () => {
  const { authenticated } = React.useContext(Context);
  const location = useLocation();
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  if (authenticated) {
    return <Navigate to={"/"} state={{ from: location }} />;
  }
  return (
    <div className="wrapper">
      <div className="container">
        <h1 className="title">
          {isConfirmed ? "Новый пароль" : "Забыли пароль?"}
        </h1>
        {!isConfirmed ? (
          <ForgotPassForm func={() => setIsConfirmed(true)} />
        ) : (
          <SetNewPassForm />
        )}
      </div>
    </div>
  );
};

export default ForgotPass;

import React from "react";
import ForgotPassForm from "../../components/Forms/ForgotPassForm/ForgotPassForm";

const ForgotPass = () => {
  return (
    <div className="wrapper">
      <div className="container">
        <h1 className="title">Забыли пароль?</h1>
        <ForgotPassForm />
      </div>
    </div>
  );
};

export default ForgotPass;

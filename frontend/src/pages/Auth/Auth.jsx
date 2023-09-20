import React from "react";
import RegisterForm from "../../components/Forms/RegisterForm/RegisterForm";
import "./Auth.css";

const Auth = () => {
  return (
    <div className="wrapper">
      <div className="container">
        <h1 className="title">Регистрация</h1>
        <RegisterForm/>
      </div>
    </div>
  );
};

export default Auth;

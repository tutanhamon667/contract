import React from "react";
import RegisterForm from "../../components/Forms/RegisterForm/RegisterForm";
import "./Register.css";

const Register = ({ handleRegister, error, isError }) => {
  function onSubmit(values) {
    handleRegister(values);
  }

  return (
    <div className="wrapper">
      <div className="container">
        <h1 className="title">Регистрация</h1>
        <RegisterForm onSubmitHandler={onSubmit} errorRequest={error} isError={isError}/>
      </div>
    </div>
  );
};

export default Register;

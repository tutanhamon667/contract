import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import RegisterForm from "../../components/Forms/RegisterForm/RegisterForm";
import { Context } from "../../context/context";
import "./Register.css";

const Register = () => {
  const {authenticated} = React.useContext(Context);
  const location = useLocation();

  if (authenticated) {
    return <Navigate to={"/"} state={{ from: location }} />;
  }
  return (
    <div className="wrapper">
      <div className="container">
        <h1 className="title">Регистрация</h1>
        <RegisterForm/>
      </div>
    </div>
  );
};

export default Register;

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import RegisterForm from "../../components/Forms/RegisterForm/RegisterForm";
import { Context } from "../../context/context";
import "./Register.css";

const Register = () => {
  const { authenticated } = React.useContext(Context);
  const location = useLocation();

  function onSubmit(values) {
    /* eslint no-undef: "off" */ // globalThis.role is defined in onSubmit function
    globalThis.role = values.is_customer ? "customer" : values.is_worker && "freelancer";
  }

  if (authenticated) {
    return <Navigate to={`/${role}/complete`} state={{ from: location }} />;
  }

  return (
    <div className="wrapper">
      <div className="container">
        <h1 className="title">Регистрация</h1>
        <RegisterForm onSubmitHandler={onSubmit}/>
      </div>
    </div>
  );
};

export default Register;

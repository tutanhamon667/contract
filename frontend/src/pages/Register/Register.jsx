import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import RegisterForm from "../../components/Forms/RegisterForm/RegisterForm";
import { Context } from "../../context/context";
import "./Register.css";

const Register = () => {
  const { authenticated, currentUser } = React.useContext(Context);
  const location = useLocation();

  function onSubmit(values) {
    globalThis.role = values.is_customer ? "employer" : values.is_worker && "freelancer";
  }

  if (authenticated) {
    /* eslint no-undef: "off" */ // globalThis.role is defined in onSubmit function
    return <Navigate to={`/${role}/${currentUser.id}/complete`} state={{ from: location }} />;
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

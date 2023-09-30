import React from "react";
import { Link } from "react-router-dom";
import { Context } from "../../../context/context";
import Button from "../../Button/Button";
import useFormAndValidation from "../../../hooks/useFormAndValidation";
import InputText from "../../Inputs/InputText/InputText";
// import LinkBar from "../../LinkBar/LinkBar";
import "./LoginForm.css";

const LoginForm = () => {
  const {logIn} = React.useContext(Context);
  const [showPassword, setShowPassword] = React.useState(false);
  const { values, errors, isValid, handleChange, setValues, setErrors } =
    useFormAndValidation();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();

    let newErrors = {};

    if (!values.email) {
      newErrors = { ...newErrors, email: "Введите эл. почту" };
    }

    if (!values.password) {
      newErrors = { ...newErrors, password: "Введите пароль" };
    }

    setErrors({ ...errors, ...newErrors });

    if (isValid && values.email && values.password) {
      console.log(values);
      setValues({ ...values, email: "", password: "" });
      logIn()
    }
  };

  return (
    <form className="login" onSubmit={handleSubmit}>
      <div className="login__form">
        <div className="login__inputContainer">
          <InputText
            placeholder="Эл. почта"
            type="email"
            autocomplete="email"
            marginTop={20}
            width={610}
            height={46}
            name="email"
            onChange={handleChange}
            value={values.email || ""}
            error={errors.email}
            errorMessage={errors.email}
          />
          <InputText
            placeholder="Пароль"
            type={showPassword ? "text" : "password"}
            autocomplete="current-password"
            marginTop={20}
            width={610}
            height={46}
            pass={togglePasswordVisibility}
            name="password"
            onChange={handleChange}
            value={values.password || ""}
            error={errors.password}
            errorMessage={errors.password}
          />
          <Link className="login__forgotLink" to="/forgot-password">
            Забыл пароль
          </Link>
        </div>
        {/* <LinkBar /> */}
        <Button text="Войти" width={399} type="submit" />
        <div className="login__footerLinkContainer">
          <p className="login__footerLinkDescription">Нет аккаунта?</p>
          <Link className="login__footerLink" to="/signup">
            Регистрация
          </Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;

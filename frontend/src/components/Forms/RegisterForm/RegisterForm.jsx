import React from "react";
import { Link } from "react-router-dom";
import Button from "../../Button/Button";
import InputAuth from "../../InputAuth/InputAuth";
import LinkBar from "../../LinkBar/LinkBar";
import "./RegisterForm.css";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState("customer");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
  };
  return (
    <form className="register" onSubmit={handleSubmit}>
      <div className="register__form">
        <div className="register__formRoleContainer">
          <Button
            text="Я заказчик"
            width={295}
            height={46}
            type="submit"
            inheritTheme
            white={role === "freelancer" ? true : false}
            onClick={() => setRole("customer")}
          />
          <Button
            text="Я фрилансер"
            width={295}
            height={46}
            type="submit"
            inheritTheme
            white={role === "customer" ? true : false}
            onClick={() => setRole("freelancer")}
          />
        </div>
        <InputAuth
          placeholder="Имя"
          marginTop={20}
          width={610}
          height={46}
          type="text"
          autocomplete="given-name"
        />

        <InputAuth
          placeholder="Фамилия"
          marginTop={20}
          width={610}
          height={46}
          type="text"
          autocomplete="family-name"
        />
        <InputAuth
          placeholder="Эл. почта"
          marginTop={20}
          width={610}
          type="email"
          autocomplete="email"
        />
        <InputAuth
          placeholder="Пароль"
          pass={togglePasswordVisibility}
          marginTop={20}
          width={610}
          height={46}
          type={showPassword ? "text" : "password"}
          autocomplete="new-password"
        />
        <InputAuth
          placeholder="Повторите пароль"
          marginTop={20}
          width={610}
          height={46}
          type={showPassword ? "text" : "password"}
          autocomplete="new-password"
        />
        <LinkBar />
        <Button text="Создать аккаунт" width={399} type="submit" />
        <div className="register__footerLinkContainer">
          <p className="register__footerLinkDescription">Уже есть аккаунт?</p>
          <Link className="register__footerLink" to="/signin">
            Войти
          </Link>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;

import React from "react";
import { Link } from "react-router-dom";
import Button from "../../Button/Button";
import InputAuth from "../../InputAuth/InputAuth";
import LinkBar from "../../LinkBar/LinkBar";
import "./LoginForm.css";

const LoginForm = () => {
  const handleSubmit = (evt) => {
    evt.preventDefault();
  };

  return (
    <div className="login">
      <form className="login__form" onSubmit={handleSubmit}>
        <div className="login__inputContainer">
          <InputAuth placeholder="Эл. почта" type="email" autocomplete="email" marginTop={20} width={610}/>
          <InputAuth placeholder="Пароль" type="password" autocomplete="current-password" marginTop={20} width={610}/>
          <Link className="login__forgotLink" to='/forgot-password'>Забыл пароль</Link>
        </div>
        <LinkBar/>
        <Button text='Создать аккаунт' width={399} type="submit"/>
        <div className="login__footerLinkContainer">
          <p className="login__footerLinkDescription">Нет аккаунта?</p>
          <Link className="login__footerLink" to='/signup'>Регистрация</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

import React from "react";
import Button from "../../Button/Button";
import InputAuth from "../../InputAuth/InputAuth";
import "./ForgotPassForm.css";

const ForgotPassForm = () => {
  const handleSubmit = (evt) => {
    evt.preventDefault();
  };
  return (
    <div className="forgotPass">
      <form className="forgotPass__form" onSubmit={handleSubmit}>
        <div className="forgotPass__inputContainer">
          <p className="forgotPass__text">
            Введите адрес электронной почты, который вы использовали при
            регистрации, и мы вышлем вам инструкции по сбросу пароля.
          </p>
          <InputAuth placeholder="e-mail" marginTop={20} width={610} />
        </div>
        <Button text="Отправить" width={399} type="submit" />
      </form>
    </div>
  );
};

export default ForgotPassForm;

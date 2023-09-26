import React from "react";
import Button from "../../Button/Button";
import useFormAndValidation from "../../hooks/useFormAndValidation";
import InputAuth from "../../InputAuth/InputAuth";
import "./ForgotPassForm.css";

const ForgotPassForm = () => {
  const { values, errors, isValid, handleChange, setValues } =
    useFormAndValidation();
  const handleSubmit = (evt) => {
    evt.preventDefault();
    console.log(values);
    if (isValid) {
      setValues({
        ...values,
        email: "",
      });
    }
  };
  return (
    <div className="forgotPass">
      <form className="forgotPass__form" onSubmit={handleSubmit}>
        <div className="forgotPass__inputContainer">
          <p className="forgotPass__text">
            Введите адрес электронной почты, который вы использовали при
            регистрации, и мы вышлем вам инструкции по сбросу пароля.
          </p>
          <InputAuth
            placeholder="Эл. почта"
            type="email"
            autoComplete="email"
            marginTop={20}
            width={610}
            height={46}
            name="email"
            onChange={handleChange}
            value={values.email || ""}
            error={errors.email}
            errorMessage={errors.email}
          />
        </div>
        <Button text="Отправить" width={399} type="submit" />
      </form>
    </div>
  );
};

export default ForgotPassForm;

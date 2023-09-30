import React from "react";
import Button from "../../Button/Button";
import useFormAndValidation from "../../../hooks/useFormAndValidation";
import InputText from "../../Inputs/InputText/InputText";
import "./ForgotPassForm.css";

const ForgotPassForm = ({ func }) => {
  const { values, errors, isValid, handleChange, setValues, setErrors } =
    useFormAndValidation();
  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (!values.email) {
      setErrors({ ...errors, email: "Введите эл. почту" });
      return
    }
    if (isValid) {
      console.log(values);
      setValues({
        ...values,
        email: "",
      });
      func();
    }
  };
  return (
    <form className="forgotPass" onSubmit={handleSubmit}>
      <div className="forgotPass__form">
        <div className="forgotPass__inputContainer">
          <p className="forgotPass__text">
            Введите адрес электронной почты, который вы использовали при
            регистрации, и мы вышлем вам инструкции по сбросу пароля.
          </p>
          <InputText
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
      </div>
    </form>
  );
};

export default ForgotPassForm;

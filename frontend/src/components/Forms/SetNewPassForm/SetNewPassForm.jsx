import React from "react";
import Button from "../../Button/Button";
import useFormAndValidation from "../../hooks/useFormAndValidation";
import InputAuth from "../../InputAuth/InputAuth";
import "./SetNewPassForm.css";

const SetNewPassForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const { values, errors, isValid, handleChange, setValues } =
    useFormAndValidation();
  const handleSubmit = (evt) => {
    evt.preventDefault();
    console.log(values);
    if (isValid) {
      setValues({
        ...values,
        password: "",
        confirmPassword: "",
      });
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <form className="setNewPass" onSubmit={handleSubmit}>
      <div className="setNewPass__form">
        <div className="setNewPass__inputContainer">
          <p className="setNewPass__text">
            Придумайте новый пароль для восстановления доступа к аккаунту.
          </p>
          <InputAuth
            placeholder="Новый пароль"
            type={showPassword ? "text" : "password"}
            autocomplete="new-password"
            marginTop={20}
            width={610}
            height={46}
            pass={togglePasswordVisibility}
            name="password"
            onChange={handleChange}
            value={values.password || ""}
          />
          <InputAuth
            placeholder="Повторите пароль"
            type={showPassword ? "text" : "password"}
            autocomplete="new-password"
            marginTop={20}
            width={610}
            height={46}
            name="confirmPassword"
            onChange={handleChange}
            value={values.confirmPassword || ""}
          />
        </div>
        <Button text="Продолжить" width={399} type="submit" />
      </div>
    </form>
  );
};

export default SetNewPassForm;

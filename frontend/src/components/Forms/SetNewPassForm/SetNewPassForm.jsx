import React from "react";
import Button from "../../Button/Button";
import useFormAndValidation from "../../../hooks/useFormAndValidation";
import InputText from "../../Inputs/InputText/InputText";
import "./SetNewPassForm.css";

const SetNewPassForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const { values, errors, isValid, handleChange, setValues, setErrors } =
    useFormAndValidation();
  const handleSubmit = (evt) => {
    evt.preventDefault();
    let newErrors = {};

    if (!values.password) {
      newErrors = { ...newErrors, password: "Введите пароль" };
    }

    if (!values.confirmPassword) {
      newErrors = { ...newErrors, confirmPassword: "Повторите пароль" };
    }

    setErrors({ ...errors, ...newErrors });
    if (isValid && values.password && values.confirmPassword) {
      setValues({
        ...values,
        password: "",
        re_password: "",
      });
      console.log(values);
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
          <InputText
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
            error={errors.password}
            errorMessage={errors.password}
          />
          <InputText
            placeholder="Повторите пароль"
            type={showPassword ? "text" : "password"}
            autocomplete="new-password"
            marginTop={20}
            width={610}
            height={46}
            name="re_password"
            onChange={handleChange}
            value={values.re_password || ""}
            error={errors.re_password}
            errorMessage={errors.re_password}
          />
        </div>
        <Button
          text="Продолжить"
          width={399}
          type="submit"
        />
      </div>
    </form>
  );
};

export default SetNewPassForm;

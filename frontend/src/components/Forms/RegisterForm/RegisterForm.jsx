import React from "react";
import { Link } from "react-router-dom";
import Button from "../../Button/Button";
import useFormAndValidation from "../../hooks/useFormAndValidation";
import InputAuth from "../../InputAuth/InputAuth";
// import LinkBar from "../../LinkBar/LinkBar";
import "./RegisterForm.css";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState("customer");
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
    if (!values.confirmPassword) {
      newErrors = { ...newErrors, confirmPassword: "Повторите пароль" };
    }

    if (!values.firstName) {
      newErrors = { ...newErrors, firstName: "Введите имя" };
    }

    if (!values.lastName) {
      newErrors = { ...newErrors, lastName: "Введите фамилию" };
    }

    setErrors({ ...errors, ...newErrors });

    if (
      isValid &&
      values.email &&
      values.password &&
      values.confirmPassword &&
      values.firstName &&
      values.lastName
    ) {
      console.log(values);
      setValues({
        ...values,
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        role: role
      });
    }
  };
  return (
    <form className="register" onSubmit={handleSubmit}>
      <div className="register__form">
        <div className="register__formRoleContainer">
          <Button
            text="Я заказчик"
            width={295}
            height={46}
            type="button"
            inheritTheme
            white={role === "customer" ? true : false}
            onClick={() => setRole("customer")}
          />
          <Button
            text="Я фрилансер"
            width={295}
            height={46}
            type="button"
            inheritTheme
            white={role === "freelancer" ? true : false}
            onClick={() => setRole("freelancer")}
          />
        </div>
        <InputAuth
          placeholder="Имя"
          marginTop={20}
          width={610}
          height={46}
          type="text"
          name="firstName"
          autocomplete="given-name"
          onChange={handleChange}
          value={values.firstName || ""}
          error={errors.firstName}
          errorMessage={errors.firstName}
        />
        <InputAuth
          placeholder="Фамилия"
          marginTop={20}
          width={610}
          height={46}
          type="text"
          name="lastName"
          autocomplete="family-name"
          onChange={handleChange}
          value={values.lastName || ""}
          error={errors.lastName}
          errorMessage={errors.lastName}
        />
        <InputAuth
          placeholder="Эл. почта"
          marginTop={20}
          width={610}
          type="email"
          name="email"
          autocomplete="email"
          onChange={handleChange}
          value={values.email || ""}
          error={errors.email}
          errorMessage={errors.email}
        />
        <InputAuth
          placeholder="Пароль"
          pass={togglePasswordVisibility}
          marginTop={20}
          width={610}
          height={46}
          type={showPassword ? "text" : "password"}
          autocomplete="new-password"
          name="password"
          onChange={handleChange}
          value={values.password || ""}
          error={errors.password}
          errorMessage={errors.password}
        />
        <InputAuth
          placeholder="Повторите пароль"
          marginTop={20}
          width={610}
          height={46}
          type={showPassword ? "text" : "password"}
          autocomplete="new-password"
          name="confirmPassword"
          onChange={handleChange}
          value={values.confirmPassword || ""}
          error={errors.confirmPassword}
          errorMessage={errors.confirmPassword}
        />
        <div style={{marginBottom:60}}/>
        {/* <LinkBar /> */}
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

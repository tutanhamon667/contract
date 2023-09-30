import React from "react";
import { Link } from "react-router-dom";
import { Context } from "../../../context/context";
import useFormAndValidation from "../../../hooks/useFormAndValidation";
import Button from "../../Button/Button";
import InputText from "../../Inputs/InputText/InputText";
// import LinkBar from "../../LinkBar/LinkBar";
import "./RegisterForm.css";

const RegisterForm = () => {
  // const { logIn, authenticated } = React.useContext(Context);
  const { logIn } = React.useContext(Context);
  // const location = useLocation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState("is_customer");
  const {
    values, errors, isValid, handleChange, setValues, setErrors
  } = useFormAndValidation();

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
      values.re_password &&
      values.first_name &&
      values.last_name
    ) {
      console.log(values);
      setValues({
        ...values,
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        re_password: "",
        role
      });
      logIn();
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
            white={role === "is_customer"}
            onClick={() => setRole("is_customer")}
          />
          <Button
            text="Я фрилансер"
            width={295}
            height={46}
            type="button"
            inheritTheme
            white={role === "is_worker"}
            onClick={() => setRole("is_worker")}
          />
        </div>
        <InputText
          placeholder="Имя"
          marginTop={20}
          width={610}
          height={46}
          type="text"
          name="first_name"
          autocomplete="given-name"
          onChange={handleChange}
          value={values.first_name || ""}
          error={errors.first_name}
          errorMessage={errors.first_name}
        />
        <InputText
          placeholder="Фамилия"
          marginTop={20}
          width={610}
          height={46}
          type="text"
          name="last_name"
          autocomplete="family-name"
          onChange={handleChange}
          value={values.last_name || ""}
          error={errors.last_name}
          errorMessage={errors.last_name}
        />
        <InputText
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
        <InputText
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
        <InputText
          placeholder="Повторите пароль"
          marginTop={20}
          width={610}
          height={46}
          type={showPassword ? "text" : "password"}
          autocomplete="new-password"
          name="re_password"
          onChange={handleChange}
          value={values.re_password || ""}
          error={errors.re_password}
          errorMessage={errors.re_password}
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

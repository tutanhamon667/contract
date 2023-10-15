import React from "react";
import { Link } from "react-router-dom";
import { Context } from "../../../context/context";
import useFormAndValidation from "../../../hooks/useFormAndValidation";
import Button from "../../Button/Button";
import InputText from "../../Inputs/InputText/InputText";
// import SocialLinksBar from "../../SocialLinksBar/SocialLinksBar";
import "./RegisterForm.css";

const RegisterForm = ({ onSubmitHandler }) => {
  const { logIn } = React.useContext(Context);
  const [showPassword, setShowPassword] = React.useState(false);
  const [buttonClicked, setButtonClicked] = React.useState(false);
  const [role, setRole] = React.useState({
    is_customer: true,
    is_worker: false,
  });
  const {
    values, errors, isValid, handleChange, setValues, setErrors
  } = useFormAndValidation();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRole = (isCustomer) => {
    setRole({
      is_customer: isCustomer,
      is_worker: !isCustomer,
    });
    setValues({
      ...values,
      is_customer: role.is_customer,
      is_worker: role.is_worker,
    });
  };

  React.useEffect(() => {
    setValues((prevValues) => ({
      ...prevValues,
      is_customer: role.is_customer,
      is_worker: role.is_worker,
    }));
  }, [role.is_customer, role.is_worker, setValues]);

  const handleSubmit = (evt) => {
    evt.preventDefault();

    let newErrors = {};

    if (!values.email) {
      newErrors = { ...newErrors, email: "Введите эл. почту" };
    }

    if (!values.password) {
      newErrors = { ...newErrors, password: "Введите пароль" };
    }
    if (!values.re_password) {
      newErrors = { ...newErrors, re_password: "Повторите пароль" };
    }

    if (!values.first_name) {
      newErrors = { ...newErrors, first_name: "Введите имя" };
    }

    if (!values.last_name) {
      newErrors = { ...newErrors, last_name: "Введите фамилию" };
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
        is_customer: role.is_customer,
        is_worker: role.is_worker,
      });

      logIn();

      onSubmitHandler(values);
    }
    setButtonClicked(true);
  };

  return (
    <form className="register" onSubmit={handleSubmit}>
      <div className="register__form">
        <div className="register__formRoleContainer">
          <Button
            text="Я заказчик"
            width={200}
            height={52}
            type="button"
            buttonSecondary
            border="none"
            fontSize={20}
            fontWeight={600}
            opacity={role.is_worker && 0.7}
            buttonWhite={role.is_customer}
            onClick={() => toggleRole(true)}
          />
          <Button
            text="Я фрилансер"
            width={200}
            height={52}
            type="button"
            buttonSecondary
            border="none"
            fontSize={20}
            fontWeight={600}
            opacity={role.is_customer && 0.7}
            buttonWhite={!role.is_customer}
            onClick={() => toggleRole(false)}
          />
        </div>
        <InputText
          placeholder="Имя"
          marginTop={20}
          width={400}
          height={60}
          type="text"
          name="first_name"
          autoComplete="given-name"
          onChange={handleChange}
          value={values.first_name || ""}
          error={errors.first_name}
          errorMessage={errors.first_name}
        />
        <InputText
          placeholder="Фамилия"
          marginTop={20}
          width={400}
          height={60}
          type="text"
          name="last_name"
          autoComplete="family-name"
          onChange={handleChange}
          value={values.last_name || ""}
          error={errors.last_name}
          errorMessage={errors.last_name}
        />
        <InputText
          placeholder="Эл. почта"
          marginTop={20}
          width={400}
          type="email"
          name="email"
          autoComplete="email"
          onChange={handleChange}
          value={values.email || ""}
          error={errors.email}
          errorMessage={errors.email}
        />
        <InputText
          placeholder="Пароль"
          pass={togglePasswordVisibility}
          marginTop={20}
          width={400}
          height={60}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          name="password"
          onChange={handleChange}
          value={values.password || ""}
          error={errors.password}
          errorMessage={errors.password}
        />
        <InputText
          placeholder="Повторите пароль"
          marginTop={20}
          width={400}
          height={60}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          name="re_password"
          onChange={handleChange}
          value={values.re_password || ""}
          error={errors.re_password}
          errorMessage={errors.re_password}
        />
        <div style={{ marginBottom: 60 }} />
        {/* <SocialLinksBar /> */}
        <Button
          text="Создать аккаунт"
          width={400}
          type="submit"
          disabled={(!isValid ||
            !values.email ||
            !values.password ||
            !values.re_password ||
            !values.first_name ||
            !values.last_name) &&
            buttonClicked}
        />
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

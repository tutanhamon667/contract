import React from "react";
import { Link } from "react-router-dom";
import { Context } from "../../../context/context";
import Button from "../../Button/Button";
import useFormAndValidation from "../../../hooks/useFormAndValidation";
import InputText from "../../Inputs/InputText/InputText";
// import SocialLinksBar from "../../SocialLinksBar/SocialLinksBar";
import "./LoginForm.css";
import { userCustomer, userFreelancer } from "../../../utils/constants";

const LoginForm = ({ setAuthenticated, setCurrentUser }) => {
  const { logIn } = React.useContext(Context);
  const [showPassword, setShowPassword] = React.useState(false);
  const [buttonClicked, setButtonClicked] = React.useState(false);
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

    setErrors({ ...errors, ...newErrors });

    if (isValid && values.email && values.password) {
      console.log(values);
      setValues({ ...values, email: "", password: "" });
      logIn();
    }
    setButtonClicked(true);

    // временное решение входа в аккаунт
    if (values.email === 'email@mail.ru' && values.password === 'topSecret1') {
      setAuthenticated(true);
      setCurrentUser(userFreelancer)
      console.log('Вход выполнен в роли Фрилансер')
    } else if (values.email === 'boss@mail.ru' && values.password === 'imsuperboss1') {
      setAuthenticated(true);
      setCurrentUser(userCustomer)
    } else {
      setAuthenticated(false);
      console.log('Не правильные почта или пароль')
    }
    // ----------------------------------
  };

  return (
    <form className="login" onSubmit={handleSubmit}>
      <div className="login__form">
        <div className="login__inputContainer">
          <InputText
            placeholder="Эл. почта"
            type="email"
            autoComplete="email"
            marginTop={20}
            width={400}
            height={60}
            name="email"
            onChange={handleChange}
            value={values.email || ""}
            error={errors.email}
            errorMessage={errors.email}
          />
          <InputText
            placeholder="Пароль"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            marginTop={20}
            width={400}
            height={60}
            pass={togglePasswordVisibility}
            name="password"
            onChange={handleChange}
            value={values.password || ""}
            error={errors.password}
            errorMessage={errors.password}
          />
          <Link className="login__forgotLink" to="/forgot-password">
            Восстановить пароль
          </Link>
        </div>
        {/* <SocialLinksBar /> */}
        <Button
          text="Войти"
          width={400}
          type="submit"
          disabled={
            (!isValid || !values.email || !values.password) && buttonClicked
          }
        />
        <div className="login__footerLinkContainer">
          <p className="login__footerLinkDescription">Нет аккаунта?</p>
          <Link className="login__footerLink" to="/signup">
            Зарегистрируйтесь
          </Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;

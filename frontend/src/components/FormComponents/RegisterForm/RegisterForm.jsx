import React from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../../../context/context';
import { useFormAndValidation } from '../../../hooks/useFormValidationProfileCustomer';
import { Button } from '../../Button/Button';
import { InputText } from '../../InputComponents/InputText/InputText';
import './RegisterForm.css';

function RegisterForm({ onSubmitHandler, errorRequest, isError }) {
  const { logIn } = React.useContext(Context);
  const [showPassword, setShowPassword] = React.useState(false);
  const [buttonClicked, setButtonClicked] = React.useState(false);
  const [role, setRole] = React.useState({
    is_customer: true,
    is_worker: false,
  });
  const { values, errors, isValid, checkErrors, handleChange, setValues, setErrors, setIsValid } =
    useFormAndValidation();

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
    setValues((previousValues) => ({
      ...previousValues,
      is_customer: role.is_customer,
      is_worker: role.is_worker,
    }));
  }, [role.is_customer, role.is_worker, setValues]);

  React.useEffect(() => {
    if (isError) {
      let newErrors = {};

      if (errorRequest.email) {
        if (errorRequest.email.includes('member с таким email address уже существует.')) {
          newErrors = {
            ...newErrors,
            email: 'Пользователь с такой эл. почтой уже зарегистрирован',
          };
          setErrors({ ...errors, ...newErrors });
        }
      } else if (errorRequest.password) {
        newErrors = { ...newErrors, password: `${errorRequest.password}` };
        setErrors({ ...errors, ...newErrors });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonClicked, isError]);

  React.useEffect(() => {
    const valid = checkErrors(errors);
    setIsValid(valid);
    // console.log('UseEff', valid, isValid, errors);
  }, [isValid, errors]);

  const handleSubmit = (event) => {
    event.preventDefault();

    let newErrors = {};

    if (!values.email) {
      newErrors = { ...newErrors, email: 'Введите эл. почту' };
    }

    if (!values.password) {
      newErrors = { ...newErrors, password: 'Введите пароль' };
    }
    if (!values.re_password) {
      newErrors = { ...newErrors, re_password: 'Введите пароль повторно' };
    }

    if (!values.first_name) {
      newErrors = { ...newErrors, first_name: 'Введите имя' };
    }

    if (!values.last_name) {
      newErrors = { ...newErrors, last_name: 'Введите фамилию' };
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
      // setValues({
      //   ...values,
      //   first_name: "",
      //   last_name: "",
      //   email: "",
      //   password: "",
      //   re_password: "",
      //   is_customer: role.is_customer,
      //   is_worker: role.is_worker,
      // });

      logIn();

      onSubmitHandler(values);
    }
    setButtonClicked(true);
  };

  return (
    <form className="register" onSubmit={handleSubmit}>
      <div className="register__form">
        <div className="register__form-role-container">
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
          marginTop={40}
          width={400}
          type="text"
          name="first_name"
          autoComplete="given-name"
          onChange={handleChange}
          value={values.first_name || ''}
          error={errors.first_name}
          errorMessage={errors.first_name}
          maxLength={80}
        />
        <InputText
          placeholder="Фамилия"
          marginTop={32}
          width={400}
          type="text"
          name="last_name"
          autoComplete="family-name"
          onChange={handleChange}
          value={values.last_name || ''}
          error={errors.last_name}
          errorMessage={errors.last_name}
          maxLength={80}
        />
        <InputText
          placeholder="Эл. почта"
          marginTop={32}
          width={400}
          type="email"
          name="email"
          autoComplete="email"
          onChange={handleChange}
          value={values.email || ''}
          error={errors.email}
          errorMessage={errors.email}
        />
        <InputText
          placeholder="Пароль"
          pass={togglePasswordVisibility}
          marginTop={32}
          width={400}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          name="password"
          onChange={handleChange}
          value={values.password || ''}
          error={errors.password}
          errorMessage={errors.password}
        />
        <InputText
          placeholder="Повторите пароль"
          marginTop={32}
          width={400}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          name="re_password"
          onChange={handleChange}
          value={values.re_password || ''}
          error={errors.re_password}
          errorMessage={errors.re_password}
        />
        <div style={{ marginBottom: 60 }} />
        <Button
          text="Создать аккаунт"
          width={400}
          type="submit"
          disabled={
            !isValid ||
            !values.email ||
            !values.password ||
            !values.re_password ||
            !values.first_name ||
            !values.last_name
          }
        />
        <div className="register__footer-link-container">
          <p className="register__footer-link-description">Уже есть аккаунт?</p>
          <Link className="register__footer-link" to="/signin">
            Войти
          </Link>
        </div>
      </div>
    </form>
  );
}

export { RegisterForm };

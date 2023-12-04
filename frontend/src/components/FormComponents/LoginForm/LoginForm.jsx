import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormAndValidation } from '../../../hooks/useFormAndValidation';
import * as Api from '../../../utils/Api';
import { InputText } from '../../InputComponents/InputText/InputText';
import { Button } from '../../Button/Button';
import './LoginForm.css';

function LoginForm({ setIsAuthenticated, setCurrentUser }) {
  // const { handleLogin } = React.useContext(Context);
  const [showPassword, setShowPassword] = React.useState(false);
  const [buttonClicked, setButtonClicked] = React.useState(false);
  const { values, errors, isValid, handleChange, setValues, setErrors } = useFormAndValidation();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (formValues) => {
    Api.authenticateUser(formValues)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        if (response.status === 401) {
          return response.json().then((error) => {
            setErrors({ password: 'Неправильный адрес эл. почты или пароль' });
            return Promise.reject(error.detail);
          });
        }

        return response.json().then((error) => {
          setErrors({ password: error.detail });
          return Promise.reject(error.detail);
        });
      })
      .then((response) => {
        if (response.refresh && response.access) {
          localStorage.setItem('refresh', response.refresh);
          sessionStorage.setItem('access', response.access);
        }
      })
      .then(() => {
        Api.getUserInfo()
          .then((response) => {
            if (response.ok) {
              return response.json();
            }

            return response.json().then((error) => Promise.reject(error.detail));
          })
          .then((result) => {
            setCurrentUser(result);
            setIsAuthenticated(true);
            navigate('/', { replace: true });
          })
          .catch(console.error);
      })
      .catch(console.error);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    let newErrors = {};

    if (!values.email) {
      newErrors = { ...newErrors, email: 'Введите эл. почту' };
    }

    if (!values.password) {
      newErrors = { ...newErrors, password: 'Введите пароль' };
    }

    setErrors({ ...errors, ...newErrors });

    if (isValid && values.email && values.password) {
      // setValues({ ...values, email: "", password: "" });
      setValues(values);
      handleLogin(values);
    }
    setButtonClicked(true);
  };

  return (
    <form className="login" onSubmit={handleSubmit}>
      <div className="login__form">
        <div className="login__input-container">
          <InputText
            placeholder="Эл. почта"
            type="email"
            autoComplete="email"
            marginTop={32}
            width={400}
            height={60}
            name="email"
            onChange={handleChange}
            value={values.email || ''}
            error={errors.email}
            errorMessage={errors.email}
          />
          <InputText
            placeholder="Пароль"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            marginTop={32}
            width={400}
            height={60}
            pass={togglePasswordVisibility}
            name="password"
            onChange={handleChange}
            value={values.password || ''}
            error={errors.password}
            errorMessage={errors.password}
          />
          <Link className="login__forgot-link" to="/forgot-password">
            Восстановить пароль
          </Link>
        </div>
        <Button
          text="Войти"
          width={400}
          type="submit"
          disabled={(!isValid || !values.email || !values.password) && buttonClicked}
        />
        <div className="login__footer-link-container">
          <p className="login__footer-link-description">Нет аккаунта?</p>
          <Link className="login__footer-link" to="/signup">
            Зарегистрируйтесь
          </Link>
        </div>
      </div>
    </form>
  );
}

export { LoginForm };

import { RegisterForm } from '../../components/FormComponents/RegisterForm/RegisterForm';
import './Register.css';

function Register({ handleRegister, error, isError }) {
  function onSubmit(values) {
    handleRegister(values);
  }

  return (
    <div className="register__wrapper">
      <div className="register__container">
        <h1 className="register__title">Регистрация</h1>
        <RegisterForm onSubmitHandler={onSubmit} errorRequest={error} isError={isError} />
      </div>
    </div>
  );
}

export { Register };

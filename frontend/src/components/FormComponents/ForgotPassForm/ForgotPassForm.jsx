import React from 'react';
import { useFormAndValidation } from '../../../hooks/useFormValidationProfileCustomer';
import { Button } from '../../Button/Button';
import { InputText } from '../../InputComponents/InputText/InputText';
import './ForgotPassForm.css';

function ForgotPassForm({ func, handleFormSubmit }) {
  const [buttonClicked, setButtonClicked] = React.useState(false);
  const { values, errors, isValid, handleChange, setValues, setErrors } = useFormAndValidation();


  const handleSubmit = (event) => {
    event.preventDefault();
    /*
    if (!values.email) {
      setErrors({ ...errors, email: 'Введите эл. почту' });
      setButtonClicked(true);
      return;
    }
    if (isValid) {
      setValues({
        ...values,
        email: '',
      });
      func();
    }
    setButtonClicked(true);
    */

    handleFormSubmit(values)


  };


  return (
    <form className="forgot-pass" onSubmit={handleSubmit}>
      <div className="forgot-pass__form">
        <div className="forgot-pass__input-container">
          <p className="forgot-pass__text">
            Введите адрес электронной почты, который вы использовали при регистрации, и мы вышлем
            вам инструкции по сбросу пароля.
          </p>
          <InputText
            placeholder="Эл. почта"
            type="email"
            autoComplete="email"
            required={true}
            marginTop={20}
            width={400}
            height={60}
            name="email"
            onChange={handleChange}
            value={values.email || ''}
            error={errors.email}
            errorMessage={errors.email}
          />
        </div>
        <Button
          text="Отправить"
          width={400}
          height={52}
          type="submit"
          disabled={!isValid}
        />
      </div>
    </form>
  );
}

export { ForgotPassForm };

import { useState } from 'react';

export default function useFormAndValidation() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);

  const emailRegEx = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  const nameRegEx = /^[a-zA-Zа-яА-Я\u0621-\u064A\-_@.]{1,80}$/; // \u0621-\u064A — это арабские буквы

  function handleChange(e) {
    const { name, value } = e.target;

    setValues({ ...values, [name]: value });
    setErrors({ ...errors, [name]: e.target.validationMessage });
    setIsValid(e.target.closest("form").checkValidity());

    if (name === "email") {
      if (!emailRegEx.test(value)) {
        setErrors({ ...errors, [name]: "Введите корректную эл. почту" });
        setIsValid(false);
      }
    }

    if (name === "password") {
      if (value.length < 8) {
        setErrors({
          ...errors,
          [name]: "Пароль должен содержать не менее 8 символов",
        });
        setIsValid(false);
      } else if (value.length > 20) {
        setErrors({
          ...errors,
          [name]: "Пароль не должен быть длиннее 20 символов",
        });
        setIsValid(false);
      } else {
        // const passwordRequirement = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~,"():;<>@\[\\\]]+$/.test(value);
        const passwordRequirement = /^[a-zA-Z0-9@#$%!^&*]+$/.test(value);

        if (!passwordRequirement) {
          setErrors({
            ...errors,
            [name]: "Пароль должен содержать только латинские буквы и цифры, и следующие спецсимволы: " +
            // "!#$%&'*+-/=?^_`{|}~,\"(),:;<>@[\\]",
            "@#$%!^&*"
          });
          setIsValid(false);
        } else {
          const hasLowerCase = /[a-z]/.test(value);
          const hasUpperCase = /[A-Z]/.test(value);
          const hasDigit = /\d/.test(value);
          // const hasSpecial = /[!#$%&'*+\-/=?^_`{|}~,"():;<>@\[\\\]]/.test(value);
          const hasSpecial = /[@#$%!^&*]/.test(value);

          if (!hasLowerCase) {
            setErrors({
              ...errors,
              [name]: "Пароль должен содержать хотя бы одну строчную букву",
            });
            setIsValid(false);
          } else if (!hasUpperCase) {
            setErrors({
              ...errors,
              [name]: "Пароль должен содержать хотя бы одну заглавную букву",
            });
            setIsValid(false);
          } else if (!hasDigit) {
            setErrors({
              ...errors,
              [name]: "Пароль должен содержать хотя бы одну цифру",
            });
            setIsValid(false);
          } else if (!hasSpecial) {
            setErrors({
              ...errors,
              [name]: "Пароль должен содержать хотя бы один спецсимвол из списка: @#$%!^&*",
            });
            setIsValid(false);
          } else {
            setErrors({ ...errors, [name]: "" });
            setIsValid(true);
          }
        }
      }
    }

    if (name === "re_password") {
      if (value !== values.password) {
        setErrors({ ...errors, [name]: "Пароли не совпадают" });
        setIsValid(false);
      } else {
        setErrors({ ...errors, [name]: "" });
        setIsValid(true);
      }
    }

    if (name === "first_name") {
      if (value.length < 1) {
        setErrors({ ...errors, [name]: "Введите имя" });
        setIsValid(false);
      } else if (!nameRegEx.test(value)) {
        setErrors({
          ...errors,
          [name]: 'Имя не длиннее 80 символов. Латиница, кириллица, арабица'
        });
        setIsValid(false);
      }
    }

    if (name === "last_name") {
      if (value.length < 1) {
        setErrors({ ...errors, [name]: "Введите фамилию" });
        setIsValid(false);
      } else if (!nameRegEx.test(value)) {
        setErrors({
          ...errors,
          [name]: 'Фамилия не длиннее 80 символов. Латиница, кириллица, арабица'
        });
        setIsValid(false);
      }
    }
  }

  return {
    values,
    errors,
    isValid,
    handleChange,
    setValues,
    setErrors,
  };
}

import { useState } from "react";

export default function useFormAndValidation() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);

  function handleChange(e) {
    const { name, value } = e.target;

    setValues({ ...values, [name]: value });
    setErrors({ ...errors, [name]: e.target.validationMessage });
    setIsValid(e.target.closest("form").checkValidity());

    if (name === "email") {
      const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
      if (!emailRegex.test(value)) {
        setErrors({ ...errors, [name]: "Введите корректную эл. почту" });
        setIsValid(false);
      }
    }

    if (name === "password") {
      if (value.length < 6) {
        setErrors({
          ...errors,
          [name]: "Пароль должен содержать не менее 6 символов",
        });
        setIsValid(false);
      } else if (value.length > 20) {
        setErrors({
          ...errors,
          [name]: "Пароль не должен быть длиннее 20 символов",
        });
        setIsValid(false);
      } else {
        const isLatinAndDigitsOnly = /^[a-zA-Z0-9]+$/.test(value);

        if (!isLatinAndDigitsOnly) {
          setErrors({
            ...errors,
            [name]: "Пароль должен содержать только латинские буквы и цифры",
          });
          setIsValid(false);
        } else {
          const hasDigit = /\d/.test(value);

          if (!hasDigit) {
            setErrors({
              ...errors,
              [name]: "Пароль должен содержать хотя бы одну цифру",
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
      }
      if (value.length > 80) {
        setErrors({ ...errors, [name]: "Имя не длиннее 80 символов" });
        setIsValid(false);
      }
    }

    if (name === "last_name") {
      if (value.length < 1) {
        setErrors({ ...errors, [name]: "Введите фамилию" });
        setIsValid(false);
      }
      if (value.length > 80) {
        setErrors({ ...errors, [name]: "Фамилия не длиннее 80 символов" });
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

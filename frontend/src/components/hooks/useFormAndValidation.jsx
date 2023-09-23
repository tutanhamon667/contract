import { useState } from "react"

export default function useFormAndValidation() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);

  function handleChange(e) {
    const { name, value } = e.target;

    setValues({ ...values, [name]: value });
    setErrors({ ...errors, [name]: e.target.validationMessage });
    setIsValid(e.target.closest('form').checkValidity());

    if (name === 'email') {
      const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
      if (!emailRegex.test(value)) {
        setErrors({...errors, [name]: 'Введите корректный email адрес'});
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
  }
}
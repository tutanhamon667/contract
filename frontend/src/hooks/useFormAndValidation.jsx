import { useState } from 'react';

function useFormAndValidation() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  // const passwordRegex = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~,"():;<>@\[\\\]]+$/.test(value);
  const passwordRegex = /^[a-zA-Z0-9@#$%!^&*]+$/;
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\-_@.]{1,80}$/;
  const aboutRegex = /^.{1,500}$/;
  const educationRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\-_@."'\s]{1,80}$/;

  function handleChange(event) {
    const { name, value } = event.target;

    const validationMessage =
      event.target.validationMessage &&
      (name === 'web'
        ? 'Укажите ссылку в формате https://example.com'
        : event.target.validationMessage);
    // console.log(event.target.closest('form').checkValidity());

    setValues({ ...values, [name]: value });
    setErrors({ ...errors, [name]: validationMessage });
    setIsValid(event.target.closest('form').checkValidity());

    if (name === 'email') {
      if (!emailRegex.test(value)) {
        setErrors({ ...errors, [name]: 'Введите корректную эл. почту' });
        setIsValid(false);
      } else {
        setErrors({ ...errors, [name]: '' });
        setIsValid(true);
      }
    }

    if (name === 'password') {
      if (value.length < 8) {
        setErrors({
          ...errors,
          [name]: 'Пароль должен содержать не менее 8 символов',
        });
        setIsValid(false);
      } else if (value.length > 20) {
        setErrors({
          ...errors,
          [name]: 'Пароль не должен быть длиннее 20 символов',
        });
        setIsValid(false);
      } else {
        if (!passwordRegex.test(value)) {
          setErrors({
            ...errors,
            [name]:
              'Пароль должен содержать только латинские буквы, цифры и следующие символы: ' +
              // "!#$%&'*+-/=?^_`{|}~,\"(),:;<>@[\\]",
              '@#$%!^&*',
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
              [name]: 'Пароль должен содержать хотя бы одну строчную букву',
            });
            setIsValid(false);
          } else if (!hasUpperCase) {
            setErrors({
              ...errors,
              [name]: 'Пароль должен содержать хотя бы одну заглавную букву',
            });
            setIsValid(false);
          } else if (!hasDigit) {
            setErrors({
              ...errors,
              [name]: 'Пароль должен содержать хотя бы одну цифру',
            });
            setIsValid(false);
          } else if (!hasSpecial) {
            setErrors({
              ...errors,
              [name]: 'Пароль должен содержать хотя бы один следующий символ: @#$%!^&*',
            });
            setIsValid(false);
          } else {
            setErrors({ ...errors, [name]: '' });
            setIsValid(true);
          }
        }
      }
    }

    if (name === 're_password') {
      if (value.length === 0) {
        setErrors({
          ...errors,
          [name]: 'Введите пароль повторно',
        });
        setIsValid(false);
      } else if (value !== values.password) {
        setErrors({ ...errors, [name]: 'Пароли не совпадают' });
        setIsValid(false);
      } else {
        setErrors({ ...errors, [name]: '' });
        setIsValid(true);
      }
    }

    if (name === 'first_name' || name === 'last_name') {
      const title = name === 'first_name' ? 'Имя' : 'Фамилия';

      if (value.length === 0) {
        setErrors({
          ...errors,
          [name]: `Введите ${name === 'first_name' ? 'имя' : 'фамилию'}`,
        });
        setIsValid(false);
      } else if (value.length > 80) {
        setErrors({
          ...errors,
          [name]: `${title} не может быть длиннее 80 символов`,
        });
        setIsValid(false);
      } else if (!nameRegex.test(value)) {
        setErrors({
          ...errors,
          [name]: `${title} может состоять только из латинских и кириллических букв, цифр и следующих символов: .-_@`,
        });
        setIsValid(false);
      } else {
        setErrors({ ...errors, [name]: '' });
        setIsValid(true);
      }
    }

    if (name === 'name') {
      if (value.length === 0) {
        setErrors({
          ...errors,
          [name]: 'Введите название компании или ваше имя',
        });
        setIsValid(false);
      } else if (value.length > 80) {
        setErrors({
          ...errors,
          [name]: 'Название не может быть длиннее 80 знаков',
        });
        setIsValid(false);
      } else if (!nameRegex.test(value)) {
        setErrors({
          ...errors,
          [name]:
            'Название может состоять только из латинских и кириллических букв, цифр и следующих символов: .-_@',
        });
        setIsValid(false);
      }
    }

    if (name === 'industry' && value.length === 0) {
      setErrors({
        ...errors,
        [name]: 'Выберите отрасль',
      });
      setIsValid(false);
    }

    if (name === 'about' && !aboutRegex.test(value) && value.length > 0) {
      setErrors({
        ...errors,
        [name]: `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
        и строчные символы, «-», «_», «@», «.» и пробел.`,
      });
      setIsValid(false);
    } else if (name === 'about' && value.length === 0) {
      setErrors({ ...errors, [name]: '' });
      setIsValid(true);
    }

    if (name === 'web' && value.length === 0) {
      setErrors({ ...errors, [name]: '' });
      setIsValid(true);
    }

    if (name === 'phone' && !aboutRegex.test(value) && value.length > 0) {
      setErrors({
        ...errors,
        [name]: `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
        и строчные символы "-", "_", "@", "."`,
      });
      setIsValid(false);
    }

    if (name === 'telegram' && !aboutRegex.test(value) && value.length > 0) {
      setErrors({
        ...errors,
        [name]: `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
        и строчные символы "-", "_", "@", "."`,
      });
      setIsValid(false);
    }

    if (name === 'preferred' && value.length === 0) {
      setErrors({
        ...errors,
        [name]: `Выберите один из вариантов`,
      });
      setIsValid(false);
    }

    if (name === 'education' && !educationRegex.test(value) && value.length > 0) {
      setErrors({
        ...errors,
        [name]: `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
        и строчные символы "-", "_", "@", ".", "'"`,
      });
      setIsValid(false);
    }

    if (name === 'degree' && value === 'student') {
      setValues({ ...values, finish_year: '', degree: 'student' });
    }

    if (name === 'faculty' && !educationRegex.test(value) && value.length > 0) {
      setErrors({
        ...errors,
        [name]: `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
        и строчные символы "-", "_", "@", ".", "'"`,
      });
      setIsValid(false);
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

export { useFormAndValidation };

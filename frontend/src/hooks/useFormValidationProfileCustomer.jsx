import { useState } from 'react';

function useFormAndValidation() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  function checkErrors(errors) {
    return Object.values(errors).every((error) => error === '');
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
    setErrors({ ...errors, ...validateValues(name, value) });
    setIsValid(event.target.closest('form').checkValidity());
  }

  function handleChangeCustom(name, value) {
    setValues({ ...values, [name]: value });
    setErrors({ ...errors, ...validateValues(name, value) });
  }

  function handleChangeCheckbox(event) {
    const { name, checked } = event.target;
    setValues({ ...values, [name]: !!checked });
    if (name === 'budgetDiscussion') {
      if (!checked) {
        setErrors({ ...errors, ...validateValues('budget', values.budget) });
      } else setErrors({ ...errors, ...validateValues('budget', checked) });
    } else if (name === 'deadlineDiscussion') {
      if (!checked) {
        setErrors({ ...errors, ...validateValues('deadline', values.deadline) });
      } else setErrors({ ...errors, ...validateValues('deadline', checked) });
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    setErrors({ ...errors, ...validateValues(name, value) });
  }

  function validateValues(name, value) {
    // const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const passwordRegex = /^[a-zA-Z0-9@#$%!^&*]+$/;
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\-_@.\s]{1,80}$/;
    const aboutRegex = /^.{1,500}$/;
    const taskNameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\-_@.\s]{1,200}$/;
    const websiteLinkRegex =
      /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-])*$/;
    const educationRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\-_@."'\s]{1,80}$/;

    let errorMessage = '';

    if (name === 'budget' && !value) {
      errorMessage = 'Введите ваш бюджет';
    }

    if (name === 'deadline' && value && value.length) {
      const currentDate = new Date();
      const inputDate = new Date(value);
      if (inputDate <= currentDate) {
        errorMessage = 'Введите более позднюю дату крайнего срока';
      }
    }

    if (name === 'deadline' && !value) {
      errorMessage = 'Введите дату крайнего срока';
    }

    if (name === 'tags') {
      if (value.length > 20) {
        errorMessage = 'Максимальное количество навыков 20';
      } else if (value.some((value) => value.length > 50)) {
        errorMessage = 'Название навыка не может превышать 50 знаков';
      }
    }

    if (name === 'title') {
      if (value.length === 0) {
        errorMessage = 'Введите название задачи';
      } else if (value.length > 200) {
        errorMessage = 'Название не может быть длиннее 200 знаков';
      } else if (!taskNameRegex.test(value)) {
        errorMessage =
          'Название может состоять только из латинских и кириллических букв, цифр и следующих символов: .-_@';
      }
    }

    if (name === 'password') {
      if (value.length < 8) {
        errorMessage = 'Пароль должен содержать не менее 8 символов';
      } else if (value.length > 20) {
        errorMessage = 'Пароль не должен быть длиннее 20 символов';
      } else {
        if (!passwordRegex.test(value)) {
          errorMessage =
            'Пароль должен содержать только латинские буквы, цифры и следующие символы: ' +
            '@#$%!^&*';
        } else {
          const hasLowerCase = /[a-z]/.test(value);
          const hasUpperCase = /[A-Z]/.test(value);
          const hasDigit = /\d/.test(value);
          const hasSpecial = /[@#$%!^&*]/.test(value);

          if (!hasLowerCase) {
            errorMessage = 'Пароль должен содержать хотя бы одну строчную букву';
          } else if (!hasUpperCase) {
            errorMessage = 'Пароль должен содержать хотя бы одну заглавную букву';
          } else if (!hasDigit) {
            errorMessage = 'Пароль должен содержать хотя бы одну цифру';
          } else if (!hasSpecial) {
            errorMessage = 'Пароль должен содержать хотя бы один следующий символ: @#$%!^&*';
          }
        }
      }

      if (!errorMessage && values?.re_password && value !== values?.re_password) {
        errorMessage = 'Пароли не совпадают';
      }
    }

    // работает не совсем корректно!!
    if (name === 're_password') {
      if (value.length === 0) {
        errorMessage = 'Введите пароль повторно';
      } else if (value !== values.password) {
        errorMessage = 'Пароли не совпадают';
      }
    }

    if (name === 'password' && value && !errorMessage) {
      return { re_password: '', password: '' };
    }
    if (name === 're_password' && value && !errorMessage) {
      return { re_password: '', password: '' };
    }

    if (name === 'first_name' || name === 'last_name') {
      const title = name === 'first_name' ? 'Имя' : 'Фамилия';

      if (value.length === 0) {
        errorMessage = `Введите ${name === 'first_name' ? 'имя' : 'фамилию'}`;
      } else if (value.length > 80) {
        errorMessage = `${title} не может быть длиннее 80 символов`;
      } else if (!nameRegex.test(value)) {
        errorMessage = `${title} может состоять только из латинских и кириллических букв, цифр и следующих символов: .-_@`;
      }
    }

    if (name === 'email') {
      if (!emailRegex.test(value)) {
        errorMessage = 'Введите корректную эл. почту';
      }
    }

    if (name === 'name') {
      if (value.length === 0) {
        errorMessage = 'Введите название компании или ваше имя';
      } else if (value.length > 80) {
        errorMessage = 'Название не может быть длиннее 80 знаков';
      } else if (!nameRegex.test(value)) {
        errorMessage =
          'Название может состоять только из латинских и кириллических букв, цифр и следующих символов: .-_@';
      }
    }

    if (name === 'industry' || name === 'activity') {
      if (value.length === 0) {
        errorMessage = 'Выберите отрасль';
      }
    }

    if (name === 'about' && !aboutRegex.test(value) && value.length) {
      errorMessage = `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
      и строчные символы "-", "_", "@", "."`;
    }

    if (name === 'web' && !websiteLinkRegex.test(value) && value.length) {
      errorMessage = `Укажите ссылку в формате https://example.com`;
    }

    if (name === 'phone' && !aboutRegex.test(value) && value.length) {
      errorMessage = `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
                  и строчные символы "-", "_", "@", "."`;
    }

    if (name === 'telegram' && !aboutRegex.test(value) && value.length) {
      errorMessage = `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
                  и строчные символы "-", "_", "@", ".", "'"`;
    }

    if (name === 'preferred' && !value.length) {
      errorMessage = 'Выберите один из вариантов';
    }

    if (name === 'education' && !educationRegex.test(value) && value.length) {
      errorMessage = `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
                  и строчные символы "-", "_", "@", ".", "'"`;
    }

    if (name === 'degree' && value === 'student') {
      setValues({ ...values, finish_year: '', degree: 'student' });
    }

    if (name === 'faculty' && !educationRegex.test(value) && value.length) {
      errorMessage = `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
                  и строчные символы "-", "_", "@", ".", "'"`;
    }
    // console.log('Check 3');
    return { [name]: errorMessage };
  }

  function deleteSpaces(event){
    const { name, value } = event.target;
    setValues({ ...values, [name]: value.replace(/\s+/g, ' ').trim() });
  }

  return {
    values,
    errors,
    isValid,
    handleChange,
    handleChangeCustom,
    setValues,
    setErrors,
    setIsValid,
    handleBlur,
    checkErrors,
    validateValues,
    handleChangeCheckbox,
    deleteSpaces
  };
}

export { useFormAndValidation };

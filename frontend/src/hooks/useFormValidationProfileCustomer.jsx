import { useState } from 'react';

function useFormAndValidation() {
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    function checkErrors(errors) {
        return Object.values(errors).every(error => error === "")
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setValues({ ...values, [name]: value });
        setErrors({ ...errors, ...validateValues(name, value) })
    }

    function handleBlur(event) {
        const { name, value } = event.target;
        setErrors({ ...errors, ...validateValues(name, value) })
    }

    function validateValues(name, value) {
        const passwordRegex = /^[a-zA-Z0-9@#$%!^&*]+$/;
        const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        const nameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\-_@.\s]{1,80}$/;
        const aboutRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\-_@.\s]{1,500}$/;
        const websiteLinkRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-])*$/;

        let errors = { [name]: '' }

        if (name === 'password') {
            if (value.length < 8) {
                errors = { ...errors, [name]: 'Пароль должен содержать не менее 8 символов' };
            } else if (value.length > 20) {
                errors = { ...errors, [name]: 'Пароль не должен быть длиннее 20 символов' };
            } else {
                if (!passwordRegex.test(value)) {
                    errors = {
                        ...errors, [name]: 'Пароль должен содержать только латинские буквы, цифры и следующие символы: ' +
                            '@#$%!^&*',
                    };
                } else {
                    const hasLowerCase = /[a-z]/.test(value);
                    const hasUpperCase = /[A-Z]/.test(value);
                    const hasDigit = /\d/.test(value);
                    // const hasSpecial = /[!#$%&'*+\-/=?^_`{|}~,"():;<>@\[\\\]]/.test(value);
                    const hasSpecial = /[@#$%!^&*]/.test(value);

                    if (!hasLowerCase) {
                        errors = { ...errors, [name]: 'Пароль должен содержать хотя бы одну строчную букву' };
                    } else if (!hasUpperCase) {
                        errors = { ...errors, [name]: 'Пароль должен содержать хотя бы одну заглавную букву' };
                    } else if (!hasDigit) {
                        errors = { ...errors, [name]: 'Пароль должен содержать хотя бы одну цифру' };
                    } else if (!hasSpecial) {
                        errors = { ...errors, [name]: 'Пароль должен содержать хотя бы один следующий символ: @#$%!^&*' };
                    }
                }
            }
        }

        if (name === 're_password') {
            if (value.length === 0) {
                errors = { ...errors, [name]: 'Введите пароль повторно' };
            } else if (value !== values.password) {
                errors = { ...errors, [name]: 'Пароли не совпадают' };
            }
        }

        if (name === 'first_name' || name === 'last_name') {
            const title = name === 'first_name' ? 'Имя' : 'Фамилия';

            if (value.length === 0) {
                errors = { ...errors, [name]: `Введите ${name === 'first_name' ? 'имя' : 'фамилию'}` };
            } else if (value.length > 80) {
                errors = { ...errors, [name]: `${title} не может быть длиннее 80 символов` };
            } else if (!nameRegex.test(value)) {
                errors = { ...errors, [name]: `${title} может состоять только из латинских и кириллических букв, цифр и следующих символов: .-_@` };
            }
        }


        if (name === 'email') {
            if (!emailRegex.test(value)) {
                errors = { ...errors, [name]: 'Введите корректную эл. почту' };
            }
        }

        if (name === 'name') {
            if (value.length === 0) {
                errors = { ...errors, [name]: 'Введите название компании или ваше имя', };
            } else if (value.length > 80) {
                errors = { ...errors, [name]: 'Название не может быть длиннее 80 знаков', };
            } else if (!nameRegex.test(value)) {
                errors = { ...errors, [name]: 'Название может состоять только из латинских и кириллических букв, цифр и следующих символов: .-_@', };
            }
        }

        if (name === 'industry') {
            if (value.length === 0) {
                errors = { ...errors, [name]: 'Выберите отрасль', };
            }
        }

        if (name === 'about' && !aboutRegex.test(value) && value.length) {
            errors = {
                ...errors, [name]: `Можно использовать латиницу, кириллицу, арабские цифры, заглавные
      и строчные символы "-", "_", "@", "."`,
            };
        }

        if (name === 'web' && !websiteLinkRegex.test(value) && value.length) {
            errors = {
                ...errors, [name]: `Укажите ссылку в формате https://example.com`,
            };
        }

        return errors
    }

    return {
        values,
        errors,
        isValid,
        handleChange,
        setValues,
        setErrors,
        setIsValid,
        handleBlur,
        checkErrors,
        validateValues
    };
}

export { useFormAndValidation };

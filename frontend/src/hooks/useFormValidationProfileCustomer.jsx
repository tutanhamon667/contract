import { useState } from 'react';

function useFormAndValidation() {
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(true);

    function checkErrors(errors) {
        return Object.values(errors).every(error => error === "")
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setValues({ ...values, [name]: value });
    }

    function handleBlur(event) {
        const { name, value } = event.target;
        setErrors({ ...errors, ...validateValues(name, value) })
    }

    function validateValues(name, value) {
        const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        const nameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\-_@.\s]{1,80}$/;
        const aboutRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\-_@.\s]{1,500}$/;
        const websiteLinkRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-])*$/;

        let errors = { [name]: '' }

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

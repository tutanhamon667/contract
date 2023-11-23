import React, { useState } from 'react';
import { useFormAndValidation } from '../../../hooks/useFormAndValidation';
import { industryAndCategoryOptions } from '../../../utils/constants';
import { InputImage } from '../../InputComponents/InputImage/InputImage';
import { InputText } from '../../InputComponents/InputText/InputText';
import { Button } from '../../Button/Button';
import { InputSelect } from '../../InputComponents/InputSelect/InputSelect';
import './CustomerCompleteForm.css';

function CustomerCompleteForm({ handleCustomerSubmit }) {
  const [photo, setPhoto] = useState(null);

  const {
    values,
    errors,
    isValid,
    handleChange,
    setValues,
    setErrors,
  } = useFormAndValidation();

  function addPhoto(url) {
    setPhoto({ photo: url });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    let newErrors = {};

    if (!values.name) {
      newErrors = { ...newErrors, name: 'Введите название компании или ваше имя' };
    }
    if (!values.industry) {
      newErrors = { ...newErrors, industry: 'Выберите отрасль' };
    }
    setErrors({ ...errors, ...newErrors });

    if (values.name && values.industry && isValid) {

      // передать данные на бэк
      handleCustomerSubmit({ values, photo });
      // console.log(values);
      // setValues({
      //  ...values,
      //  first_name: '',
      //  email: '',
      // });
      //
      // navigate(`/customer`);
    }

  };

  function handleEmployeChange(event) {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value })
  }

  return (
    <form className="employer-complete-form" onSubmit={handleSubmit}>
      <div className="employer-complete-form__image-input">
        <InputImage
          name="photo"
          value={values.photo || ''}
          error={errors.photo}
          errorMessage={errors.photo}
          onChange={addPhoto}
        />
      </div>
      <div>
        <p className="employer-complete-form__input-text">Название компании или ваше имя</p>
        <InputText
          type="text"
          placeholder="Имя"
          autoComplete="given-name"
          name="name"
          width={610}
          value={values.name || ''}
          error={errors.name}
          errorMessage={errors.name}
          onChange={handleEmployeChange}
          onBlur={handleChange}
        />
      </div>
      <div>
        <p className="employer-complete-form__input-text">Сфера деятельности</p>
        <InputSelect
          name="industry"
          placeholder="Выберите из списка"
          value={values.industry || ''}
          error={errors.industry}
          errorMessage={errors.industry}
          onChange={handleEmployeChange}
          onBlur={handleChange}
          options={industryAndCategoryOptions}
        />
      </div>
      <div>
        <p className="employer-complete-form__input-text">О компании</p>
        <InputText
          type="textarea"
          placeholder="Расскажите чем занимается ваша компания"
          name="about"
          width={610}
          height={150}
          value={values.about || ''}
          error={errors.about}
          errorMessage={errors.about}
          onChange={handleEmployeChange}
          onBlur={handleChange}
        />
      </div>
      <div>
        <p className="employer-complete-form__input-text">Укажите ссылку на сайт компании</p>
        <InputText
          type="url"
          placeholder="https://example.com"
          name="web"
          width={610}
          value={values.web || ''}
          error={errors.web}
          errorMessage={errors.web}
          onChange={handleEmployeChange}
          onBlur={handleChange}
        />
        <button type="button" className="employer-complete-form__add-link-button">
          Добавить ещё сайт или социальные сети +
        </button>
      </div>

      <Button
        text="Создать профиль"
        width={289}
        marginTop={60}
        marginBottom={200}
        disabled={!isValid || (!values.name || !values.industry)} />
    </form>
  );
}

export { CustomerCompleteForm };

import React, { useState } from 'react';
import { useFormAndValidation } from '../../../hooks/useFormAndValidation';
import { industryAndCategoryOptions, degreeOptions } from '../../../utils/constants';
import { InputText } from '../../InputComponents/InputText/InputText';
import { InputImage } from '../../InputComponents/InputImage/InputImage';
import { InputDocument } from '../../InputComponents/InputDocument/InputDocument';
import { InputTags } from '../../InputComponents/InputTags/InputTags';
import { InputSelect } from '../../InputComponents/InputSelect/InputSelect';
import { InputSwitch } from '../../InputComponents/InputSwitch/InputSwitch';
import { Button } from '../../Button/Button';
import './FreelancerCompleteForm.css';

// const MAX_ATTACHED_DOCS = 8;

function FreelancerCompleteForm({ onSubmit }) {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [document, setDocument] = useState(null);
  // const [docKeysPortfolio, setDocKeysPortfolio] = useState([Date.now()]);
  const { values, errors, handleChange, setErrors } = useFormAndValidation();
  const [tags, setTags] = useState([]);

  function addProfilePhoto(url) {
    setProfilePhoto({ photo: url });
  }

  function addPortfolioFile(items) {
    setPortfolioFile(items);
  }

  function addDocument(items) {
    setDocument(items);
  }

  // const handleDocPortfolioChange = (event) => {
  //   handleChange(event);
  //   if (event.currentTarget.files[0]) {
  //     setDocKeysPortfolio(prevKeys => [...prevKeys, Date.now()]);
  //   }
  // };
  //
  // const onDeleteDocPortfolioClick = (key) => {
  //   setDocKeysPortfolio(prevKeys => prevKeys.filter(prevKey => prevKey !== key));
  // }

  const handleSubmit = (event) => {
    event.preventDefault();

    let newErrors = {};

    if (!values.first_name) {
      newErrors = { ...newErrors, first_name: 'Введите имя' };
    }

    if (!values.last_name) {
      newErrors = { ...newErrors, last_name: 'Введите фамилию' };
    }

    if (!values.email) {
      newErrors = { ...newErrors, email: 'Введите эл. почту' };
    }

    setErrors({ ...errors, ...newErrors });

    // if (
    //   isValid &&
    //   values.first_name &&
    //   values.last_name &&
    //   values.email
    // ) {
    //   setValues({
    //     ...values,
    //     first_name: '',
    //     last_name: '',
    //     email: '',
    //   });

    //  setIsAuthenticated(true)
    // setCurrentUser({
    //   id: "1",
    //   first_name: values.first_name,
    //   last_name: values.last_name,
    //   email: values.email,
    //   password: "topSecret1",
    //   role: "Фрилансер",
    //   rate: "300",
    //   portfolio: "https://myportfolio.ru",
    //   skills: ['CSS', 'HTML', 'JavaScript'],
    //   education: 'МГУ имени М.В. Ломоносова',
    // })

    onSubmit({ profilePhoto, portfolioFile, document, values, tags });
    // }
  };

  return (
    <form className="freelancer-complete-form" onSubmit={handleSubmit}>
      <div className="freelancer-complete-form__image-input">
        <InputImage
          name="profilePhoto"
          value={values.profilePhoto || ''}
          error={errors.profilePhoto}
          errorMessage={errors.profilePhoto}
          onChange={addProfilePhoto}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Имя Фамилия</p>
        <InputText
          type="text"
          placeholder="Имя"
          autoComplete="given-name"
          name="first_name"
          width={610}
          value={values.first_name || ''}
          error={errors.first_name}
          errorMessage={errors.first_name}
          onChange={handleChange}
        />
        <InputText
          type="text"
          placeholder="Фамилия"
          autoComplete="family-name"
          name="last_name"
          width={610}
          marginTop={12}
          value={values.last_name || ''}
          error={errors.last_name}
          errorMessage={errors.last_name}
          onChange={handleChange}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Контакты</p>
        <div className="freelancer-complete-form__contacts-wrapper">
          <InputText
            type="tel"
            placeholder="+7"
            autoComplete="tel"
            name="phone"
            width={328}
            value={values.phone || ''}
            error={errors.phone}
            errorMessage={errors.phone}
            onChange={handleChange}
          />
          <InputSwitch
            type="radio"
            name="preferred"
            label="Предпочтительный вид связи"
            value="phone"
            onChange={handleChange}
          />
          <InputText
            type="email"
            placeholder="Эл. почта"
            autoComplete="email"
            name="email"
            width={328}
            value={values.email || ''}
            error={errors.email}
            errorMessage={errors.email}
            onChange={handleChange}
          />
          <InputSwitch
            type="radio"
            name="preferred"
            label="Предпочтительный вид связи"
            value="email"
            onChange={handleChange}
          />
          <InputText
            type="text"
            placeholder="Телеграм"
            autoComplete="telegram"
            name="telegram"
            width={328}
            value={values.telegram || ''}
            error={errors.telegram}
            errorMessage={errors.telegram}
            onChange={handleChange}
          />
          <InputSwitch
            type="radio"
            name="preferred"
            label="Предпочтительный вид связи"
            value="telegram"
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Специализация</p>
        <InputSelect
          name="activity"
          placeholder="Выберите из списка"
          value={values.activity || ''}
          error={errors.activity}
          errorMessage={errors.activity}
          onChange={handleChange}
          options={industryAndCategoryOptions}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Навыки</p>
        <InputTags name="stacks" tags={tags} setTags={setTags} />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Ставка в час</p>
        <InputText
          type="number"
          placeholder="Ставка"
          name="payrate"
          width={295}
          value={values.payrate || ''}
          error={errors.payrate}
          errorMessage={errors.payrate}
          onChange={handleChange}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">О себе</p>
        <InputText
          type="textarea"
          placeholder="Расскажите о себе как о специалисте и чем вы можете быть полезны"
          name="about"
          width={610}
          height={150}
          value={values.about || ''}
          error={errors.about}
          errorMessage={errors.about}
          onChange={handleChange}
        />
      </div>

      <div>
        <p className="freelancer-complete-form__input-text">Примеры работ, портфолио</p>
        <div className="freelancer-complete-form__input-doc-wrapper">
          {/*{docKeysPortfolio.slice(0, MAX_ATTACHED_DOCS).map((key) => (*/}
          <InputDocument
            name="portfolio"
            value={values.portfolio || ''}
            error={errors.portfolio}
            errorMessage={errors.portfolio}
            onChange={addPortfolioFile}
            // isDisabled={false}
            // onChange={(event) => handleDocPortfolioChange(event, key)} key={key}
            // onDeleteDocClick={() => onDeleteDocPortfolioClick(key)}
          />
          {/*))}*/}
        </div>
      </div>

      <div>
        <p className="freelancer-complete-form__input-text">Укажите ссылку на портфолио</p>
        <InputText
          type="url"
          placeholder="https://example.com"
          name="web"
          width={610}
          value={values.web || ''}
          error={errors.web}
          errorMessage={errors.web}
          onChange={handleChange}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Образование</p>
        <InputText
          type="text"
          placeholder="Начните вводить"
          name="education"
          width={610}
          value={values.education || ''}
          error={errors.education}
          errorMessage={errors.education}
          onChange={handleChange}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Годы учебы</p>
        <div className="freelancer-complete-form__input-year-wrapper">
          <InputText
            type="number"
            placeholder="Начало"
            name="start_year"
            width={295}
            value={values.start_year || ''}
            error={errors.start_year}
            errorMessage={errors.start_year}
            onChange={handleChange}
          />
          <InputText
            type="number"
            placeholder="Окончание"
            name="finish_year"
            width={295}
            value={values.finish_year || ''}
            error={errors.finish_year}
            errorMessage={errors.finish_year}
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Степень</p>
        <InputSelect
          name="degree"
          placeholder="Выберите из списка"
          value={values.degree || ''}
          error={errors.degree}
          errorMessage={errors.degree}
          onChange={handleChange}
          options={degreeOptions}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Факультет</p>
        <InputText
          type="text"
          placeholder="Начните вводить"
          name="faculty"
          width={610}
          value={values.faculty || ''}
          error={errors.faculty}
          errorMessage={errors.faculty}
          onChange={handleChange}
        />
      </div>

      <div>
        <p className="freelancer-complete-form__input-text">
          Загрузить сертификаты, грамоты, дипломы
        </p>
        <div className="freelancer-complete-form__input-doc-wrapper">
          <InputDocument
            name="diploma"
            value={values.diploma || ''}
            error={errors.diploma}
            errorMessage={errors.diploma}
            onChange={addDocument}
          />
        </div>
      </div>

      <Button text="Создать профиль" width={289} marginTop={60} marginBottom={200} />
    </form>
  );
}

export { FreelancerCompleteForm };

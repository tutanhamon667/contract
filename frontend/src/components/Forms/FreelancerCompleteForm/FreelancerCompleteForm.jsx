import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../context/context';
import useFormAndValidation from '../../../hooks/useFormAndValidation';
import InputText from '../../Inputs/InputText/InputText';
import { InputImage } from '../../Inputs/InputImage/InputImage';
import { InputDoc } from '../../Inputs/InputDoc/InputDoc';
import InputMultipleSelect from '../../Inputs/InputMultipleSelect/InputMultipleSelect';
import InputTags from '../../Inputs/InputTags/InputTags';
import Button from '../../Button/Button';
import './FreelancerCompleteForm.css';
import { activityOptions, degreeOptions } from '../../../utils/constants';
import InputSelect from '../../Inputs/InputSelect/InputSelect';

const MAX_ATTACHED_DOCS = 8;

function FreelancerCompleteForm({ setAuthenticated, setCurrentUser }) {
  const [docKeysPortfolio, setDocKeysPortfolio] = useState([Date.now()]);
  const [docKeysEdu, setDocKeysEdu] = useState([Date.now()]);
  const {
    values, errors, isValid, handleChange, setValues, setErrors
  } = useFormAndValidation();
  const navigate = useNavigate();
  const freelancerId = useContext(Context).currentUser.id;

  const handleDocPortfolioChange = (event) => {
    handleChange(event);
    if (event.currentTarget.files[0]) {
      setDocKeysPortfolio(prevKeys => [...prevKeys, Date.now()]);
    }
  };

  const onDeleteDocPortfolioClick = (key) => {
    setDocKeysPortfolio(prevKeys => prevKeys.filter(prevKey => prevKey !== key));
  }

  const handleDocEduChange = (event) => {
    handleChange(event);
    if (event.currentTarget.files[0]) {
      setDocKeysEdu(prevKeys => [...prevKeys, Date.now()]);
    }
  };

  const onDeleteDocEduClick = (key) => {
    setDocKeysEdu(prevKeys => prevKeys.filter(prevKey => prevKey !== key));
  }

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

    if (
      isValid &&
      values.first_name &&
      values.last_name &&
      values.email
    ) {
      console.log(values);
      setValues({
        ...values,
        first_name: '',
        last_name: '',
        email: '',
      });

      setAuthenticated(true)
      setCurrentUser({
        id: "1",
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: "topSecret1",
        role: "Фрилансер",
        rate: "300",
        portfolio: "https://myportfolio.ru",
        skills: ['CSS', 'HTML', 'JavaScript'],
        education: 'МГУ имени М.В. Ломоносова',
      })

      navigate(`/freelancer/${freelancerId}`);
    }
  };

  return (
    <form className="freelancer-complete-form" onSubmit={handleSubmit}>
      <div className="freelancer-complete-form__image-input">
        <InputImage name="photo" value={values.photo || ''} error={errors.photo} errorMessage={errors.photo}
          onChange={handleChange}
        />
      </div>
      <label>
        <p className="freelancer-complete-form__input-text">Имя Фамилия</p>
        <InputText type="text" placeholder="Имя" autoComplete="given-name" name="first_name" width={610}
          value={values.first_name || ''} error={errors.first_name} errorMessage={errors.first_name}
          onChange={handleChange}
        />
        <InputText type="text" placeholder="Фамилия" autoComplete="family-name" name="last_name" width={610}
          marginTop={12} value={values.last_name || ''} error={errors.last_name}
          errorMessage={errors.last_name} onChange={handleChange}
        />
      </label>
      <div>
        <p className="freelancer-complete-form__input-text">Контакты</p>
        <div className="freelancer-complete-form__contacts-wrapper">
          <InputText type="tel" placeholder="+7" autoComplete="tel" name="tel" width={328} value={values.tel || ''}
            error={errors.tel} errorMessage={errors.tel} onChange={handleChange}
          />
          <label className="freelancer-complete-form__input-radio-text">
            <input type="radio" className="freelancer-complete-form__input-radio" name="contact-prefer" />
            Предпочтительный вид связи
          </label>
          <InputText type="email" placeholder="Эл. почта" autoComplete="email" name="email" width={328}
            value={values.email || ''} error={errors.email} errorMessage={errors.email}
            onChange={handleChange}
          />
          <label className="freelancer-complete-form__input-radio-text">
            <input type="radio" className="freelancer-complete-form__input-radio" name="contact-prefer" />
            Предпочтительный вид связи
          </label>
          <InputText type="text" placeholder="Телеграм" autoComplete="telegram" name="telegram" width={328}
            value={values.telegram || ''} error={errors.telegram} errorMessage={errors.telegram}
            onChange={handleChange}
          />
          <label className="freelancer-complete-form__input-radio-text">
            <input type="radio" className="freelancer-complete-form__input-radio" name="contact-prefer" />
            Предпочтительный вид связи
          </label>
        </div>
      </div>
      <label>
        <p className="freelancer-complete-form__input-text">Специализация</p>
        <InputMultipleSelect name="activity" value={values.activity || ''} error={errors.activity}
                     errorMessage={errors.activity} onChange={handleChange} options={activityOptions}
        />
      </label>
      <label>
        <p className="freelancer-complete-form__input-text">Навыки</p>
        <InputTags name="stacks" onChange={handleChange} />
      </label>
      <label>
        <p className="freelancer-complete-form__input-text">Ставка в час</p>
        <InputText type="number" placeholder="Ставка" name="payrate" width={295} value={values.payrate || ''}
                   error={errors.payrate} errorMessage={errors.payrate} onChange={handleChange}
        />
      </label>
      <label>
        <p className="freelancer-complete-form__input-text">О себе</p>
        <InputText type="textarea" placeholder="Расскажите о себе как о специалисте и чем вы можете быть полезны"
          name="about" width={610} height={150} value={values.about || ''} error={errors.about}
          errorMessage={errors.about} onChange={handleChange}
        />
      </label>

      <div>
        <p className="freelancer-complete-form__input-text">Примеры работ, портфолио</p>
        <div className="freelancer-complete-form__input-doc-wrapper">
          {docKeysPortfolio.slice(0, MAX_ATTACHED_DOCS).map((key) => (
            <InputDoc key={key} name="portfolio" value={values.portfolio || ''} error={errors.portfolio}
              errorMessage={errors.portfolio}
              onChange={(event) => handleDocPortfolioChange(event, key)}
              onDeleteDocClick={() => onDeleteDocPortfolioClick(key)}
            />
          ))}
        </div>
      </div>

      <label>
        <p className="freelancer-complete-form__input-text">Укажите ссылку на портфолио</p>
        <InputText type="url" placeholder="www.example.com" name="web" width={610} value={values.web || ''}
          error={errors.web} errorMessage={errors.web} onChange={handleChange}
        />
      </label>
      <label>
        <p className="freelancer-complete-form__input-text">Образование</p>
        <InputText type="text" placeholder="Начните вводить" name="education" width={610} value={values.education || ''}
          error={errors.education} errorMessage={errors.education} onChange={handleChange}
        />
      </label>
      <div>
        <p className="freelancer-complete-form__input-text">Годы учебы</p>
        <div className="freelancer-complete-form__input-year-wrapper">
          <InputText type="month" placeholder="Начало" name="start_year" width={295} value={values.start_year || ''}
            error={errors.start_year} errorMessage={errors.start_year} onChange={handleChange}
          />
          <InputText type="month" placeholder="Окончание" name="end_year" width={295} value={values.end_year || ''}
            error={errors.end_year} errorMessage={errors.end_year} onChange={handleChange}
          />
        </div>
      </div>
      <label>
        <p className="freelancer-complete-form__input-text">Степень</p>
        <InputSelect options={degreeOptions} placeholder="Выберите из списка" />
      </label>
      <label>
        <p className="freelancer-complete-form__input-text">Факультет</p>
        <InputText type="text" placeholder="Начните вводить" name="faculty" width={610} value={values.faculty || ''}
          error={errors.faculty} errorMessage={errors.faculty} onChange={handleChange}
        />
      </label>

      <label>
        <p className="freelancer-complete-form__input-text">Загрузить сертификаты, грамоты, дипломы</p>
        <div className="freelancer-complete-form__input-doc-wrapper">
          {docKeysEdu.slice(0, MAX_ATTACHED_DOCS).map((key) => (
            <InputDoc
              key={key} name="diploma" value={values.diploma || ''} error={errors.diploma} errorMessage={errors.diploma}
              onChange={(event) => handleDocEduChange(event, key)}
              onDeleteDocClick={() => onDeleteDocEduClick(key)}
            />
          ))}
        </div>
      </label>

      <Button text="Создать профиль" width={289} marginTop={60} marginBottom={200}></Button>
    </form>
  );
}

export { FreelancerCompleteForm };

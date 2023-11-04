import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormAndValidation from '../../../hooks/useFormAndValidation';
import { industryOptions, degreeOptions } from '../../../utils/constants';
import InputText from '../../Inputs/InputText/InputText';
import { InputImage } from '../../Inputs/InputImage/InputImage';
import { InputDoc } from '../../Inputs/InputDoc/InputDoc';
import InputTags from '../../Inputs/InputTags/InputTags';
import Button from '../../Button/Button';
import InputSelect from '../../Inputs/InputSelect/InputSelect';
import './FreelancerCompleteForm.css';
import { InputSwitch } from '../../Inputs/InputSwitch/InputSwitch';

const MAX_ATTACHED_DOCS = 8;

function FreelancerCompleteForm({ setIsAuthenticated, onSubmit }) {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [document, setDocument] = useState(null);
  const [docKeysPortfolio, setDocKeysPortfolio] = useState([Date.now()]);
  const [docKeysEdu, setDocKeysEdu] = useState([Date.now()]);
  const {
    values, errors, isValid, handleChange, setValues, setErrors
  } = useFormAndValidation();
  const navigate = useNavigate();

  function addProfilePhoto(url) {
    setProfilePhoto({ photo: url });

  }
//  console.log(profilePhoto)
 // console.log(portfolioFile)

  function addPortfolioFile(url, name){
    setPortfolioFile({file: url, file_name: name});
  }

  function addDocument(url, name){
    setDocument({diploma: url, diploma_name: name})
  }
console.log(document)

  const [stacksValues, setStacksValues] = useState([]);

  const handleDocPortfolioChange = (event) => {
    handleChange(event);
    if (event.currentTarget.files[0]) {
      setDocKeysPortfolio(prevKeys => [...prevKeys, Date.now()]);
      console.log(Date.now())
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

      onSubmit({profilePhoto, portfolioFile, document, values})
    }
  };

  return (
    <form className="freelancer-complete-form" onSubmit={handleSubmit}>
      <div className="freelancer-complete-form__image-input">
        <InputImage name="profilePhoto" value={values.profilePhoto || ''} error={errors.profilePhoto} errorMessage={errors.profilePhoto}
          onChange={addProfilePhoto}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Имя Фамилия</p>
        <InputText type="text" placeholder="Имя" autoComplete="given-name" name="first_name" width={610}
          value={values.first_name || ''} error={errors.first_name} errorMessage={errors.first_name}
          onChange={handleChange}
        />
        <InputText type="text" placeholder="Фамилия" autoComplete="family-name" name="last_name" width={610}
          marginTop={12} value={values.last_name || ''} error={errors.last_name}
          errorMessage={errors.last_name} onChange={handleChange}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Контакты</p>
        <div className="freelancer-complete-form__contacts-wrapper">
          <InputText type="tel" placeholder="+7" autoComplete="tel" name="phone" width={328} value={values.phone || ''}
            error={errors.phone} errorMessage={errors.phone} onChange={handleChange}
          />
          <InputSwitch type="radio" name="preferred" label="Предпочтительный вид связи" value="phone"
                       onChange={handleChange} />
          <InputText type="email" placeholder="Эл. почта" autoComplete="email" name="email" width={328}
            value={values.email || ''} error={errors.email} errorMessage={errors.email}
            onChange={handleChange}
          />
          <InputSwitch type="radio" name="preferred" label="Предпочтительный вид связи" value="email"
                       onChange={handleChange} />
          <InputText type="text" placeholder="Телеграм" autoComplete="telegram" name="telegram" width={328}
            value={values.telegram || ''} error={errors.telegram} errorMessage={errors.telegram}
            onChange={handleChange}
          />
          <InputSwitch type="radio" name="preferred" label="Предпочтительный вид связи" value="telegram"
                       onChange={handleChange} />
        </div>
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Специализация</p>
        <InputSelect name="activity" placeholder="Выберите из списка" value={values.activity || ''}
                     error={errors.activity} errorMessage={errors.activity} onChange={handleChange}
                     options={industryOptions}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Навыки</p>
        {/* TODO: исправить работу тегов также, как на странице просмотра профиля */}
        {/*<InputTags name="stacks" onChange={handleChange} setStacksValues={setStacksValues} />*/}
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Ставка в час</p>
        <InputText type="number" placeholder="Ставка" name="payrate" width={295} value={values.payrate || ''}
          error={errors.payrate} errorMessage={errors.payrate} onChange={handleChange}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">О себе</p>
        <InputText type="textarea" placeholder="Расскажите о себе как о специалисте и чем вы можете быть полезны"
          name="about" width={610} height={150} value={values.about || ''} error={errors.about}
          errorMessage={errors.about} onChange={handleChange}
        />
      </div>

      <div>
        <p className="freelancer-complete-form__input-text">Примеры работ, портфолио</p>
        <div className="freelancer-complete-form__input-doc-wrapper">

            <InputDoc name="portfolio" value={values.portfolio || ''} error={errors.portfolio}
              errorMessage={errors.portfolio}
             onChange={addPortfolioFile}
             // onDeleteDocClick={() => onDeleteDocPortfolioClick(key)}
            />

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
          <InputText type="number" placeholder="Начало" name="start_year" width={295} value={values.start_year || ''}
            error={errors.start_year} errorMessage={errors.start_year} onChange={handleChange}
          />
          <InputText type="number" placeholder="Окончание" name="finish_year" width={295} value={values.finish_year || ''}
            error={errors.finish_year} errorMessage={errors.finish_year} onChange={handleChange}
          />
        </div>
      </div>
      <label>
        <p className="freelancer-complete-form__input-text">Степень</p>
        <InputSelect name="degree" placeholder="Выберите из списка" value={values.degree || ''} error={errors.degree}
                     errorMessage={errors.degree} onChange={handleChange} options={degreeOptions}
        />
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
              onChange={addDocument}
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

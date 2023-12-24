import { useState, useContext, useEffect } from 'react';
import { useFormAndValidation } from '../../../hooks/useFormValidationProfileCustomer';
import { industryAndCategoryOptions, degreeOptions } from '../../../utils/constants';
import { InputText } from '../../InputComponents/InputText/InputText';
import { InputImage } from '../../InputComponents/InputImage/InputImage';
import { InputDocument } from '../../InputComponents/InputDocument/InputDocument';
import { InputTags } from '../../InputComponents/InputTags/InputTags';
import { InputSelect } from '../../InputComponents/InputSelect/InputSelect';
import { InputSwitch } from '../../InputComponents/InputSwitch/InputSwitch';
import { Button } from '../../Button/Button';
import { Context } from '../../../context/context';
import './FreelancerCompleteForm.css';

// const MAX_ATTACHED_DOCS = 8;

function FreelancerCompleteForm({ onSubmit }) {
  const { currentUser } = useContext(Context);
  const [profilePhoto, setProfilePhoto] = useState({});
  const [portfolioFile, setPortfolioFile] = useState();
  const [document, setDocument] = useState();
  // const [docKeysPortfolio, setDocKeysPortfolio] = useState([Date.now()]);
  const {
    values,
    errors,
    handleChange,
    handleChangeCustom,
    setErrors,
    setValues,
    // checkErrors,
    // setIsValid,
    isValid,
  } = useFormAndValidation();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    setTags([]);
    setDocument({});
    setPortfolioFile({});
    setProfilePhoto({});
    setValues({});
    setValues({
      first_name: currentUser.user.first_name,
      last_name: currentUser.user.last_name,
      email: currentUser.account_email || currentUser.user.email,
    });
  }, [currentUser]);

  /*
  useEffect(() => {
    const valid = checkErrors(errors)
    setIsValid(valid)
  }, [isValid, errors])
*/
  function addProfilePhoto(url) {
    setProfilePhoto({ photo: url });
    // console.log(url);
  }

  function addPortfolioFile(files) {
    // console.log(files);
    setPortfolioFile({ files });
  }

  function addDocument(files) {
    // console.log(files);
    setDocument({ files });
  }
  // console.log(document?.files, document?.files?.length);

  // console.log(document?.file?.file)
  // console.log(isValid)

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

    let allValues = {
      categories: [
        {
          name: values.activity,
        },
      ],
    };

    if (
      values.education ||
      values.faculty ||
      values.start_year ||
      values.finish_year ||
      values.degree ||
      document?.files?.length
    ) {
      allValues.education = [];
      let educationValues = {};

      if (document?.files?.length) {
        educationValues.diploma = document.files;
      }
      if (values.education) {
        educationValues.name = values.education;
      }

      if (values.faculty) {
        educationValues.faculty = values?.faculty;
      }

      if (values.start_year) {
        educationValues.start_year = values?.start_year;
      }

      if (values.finish_year) {
        educationValues.finish_year = values?.finish_year;
      }
      if (values.degree) {
        educationValues.degree = values?.degree;
      }

      allValues.education.push(educationValues);
    }

    if (tags.length > 0) {
      allValues.stacks = tags?.map((tag) => ({ name: tag }));
    }

    if (values?.phone || values?.email || values?.telegram || values?.preferred) {
      allValues.contacts = [];
    }

    if (values?.phone) {
      allValues.contacts.push({
        type: 'phone',
        value: values?.phone,
        preferred: values?.preferred === 'phone',
      });
    }
    if (values?.email) {
      allValues.contacts.push({
        type: 'email',
        value: values?.email,
        preferred: values?.preferred === 'email',
      });
    }
    if (values?.telegram) {
      allValues.contacts.push({
        type: 'telegram',
        value: values?.telegram,
        preferred: values?.preferred === 'telegram',
      });
    }

    if (profilePhoto.photo) {
      allValues.photo = profilePhoto.photo;
    }

    if (portfolioFile.files) {
      allValues.portfolioFile = portfolioFile.files;
    }

    if (values.payrate) {
      allValues.payrate = values.payrate;
    }

    if (values.about) {
      allValues.about = values.about;
    }

    if (values.web) {
      allValues.web = values.web;
    }

    // console.log(allValues);
    onSubmit(allValues);
  };

  return (
    <form className="freelancer-complete-form" onSubmit={handleSubmit}>
      <div className="freelancer-complete-form__image-input">
        <InputImage
          name="profilePhoto"
          value={values.profilePhoto || ''}
          error={errors.profilePhoto}
          onChange={addProfilePhoto}
          setErrors={setErrors}
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
          onChange={handleChange}
          minLength={80}
          required={true}
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
          onChange={handleChange}
          minLength={80}
          required={true}
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
            onChange={handleChange}
          />
          <InputSwitch
            type="radio"
            name="preferred"
            label="Предпочтительный вид связи"
            value="phone"
            onChange={handleChange}
            error={errors.preferred}
          />
          <InputText
            type="email"
            placeholder="Эл. почта"
            autoComplete="email"
            name="email"
            width={328}
            value={values.email || ''}
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
          onChange={handleChange}
          options={industryAndCategoryOptions}
          required={true}
        />
      </div>
      <div>
        <p className="freelancer-complete-form__input-text">Навыки</p>
        <InputTags
          name="stacks"
          tags={tags}
          setTags={setTags}
          handleChange={handleChangeCustom}
          error={errors.tags}
        />
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
          onChange={handleChange}
          maxLength={10}
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
          onChange={handleChange}
          maxLength={500}
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
            onChange={handleChange}
          />
          <InputText
            type="number"
            placeholder="Окончание"
            name="finish_year"
            width={295}
            value={values.finish_year || ''}
            error={errors.finish_year}
            onChange={handleChange}
            isDisabled={values.degree === 'student'}
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
            onChange={addDocument}
          />
        </div>
      </div>

      <Button
        text="Создать профиль"
        disabled={!isValid}
        width={289}
        marginTop={60}
        marginBottom={200}
      />
    </form>
  );
}

export { FreelancerCompleteForm };

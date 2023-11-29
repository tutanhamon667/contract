import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFormAndValidation } from '../../../hooks/useFormAndValidation';
import { Context } from '../../../context/context';
import { industryAndCategoryOptions, degreeOptions } from '../../../utils/constants';
import * as Api from '../../../utils/Api';
import { InputTags } from '../../../components/InputComponents/InputTags/InputTags';
import { InputDocument } from '../../../components/InputComponents/InputDocument/InputDocument';
import { InputSelect } from '../../../components/InputComponents/InputSelect/InputSelect';
import { InputText } from '../../../components/InputComponents/InputText/InputText';
import { InputImage } from '../../../components/InputComponents/InputImage/InputImage';
import { Button } from '../../../components/Button/Button';
import { InputSwitch } from '../../../components/InputComponents/InputSwitch/InputSwitch';
import '../../../components/FormComponents/FreelancerCompleteForm/FreelancerCompleteForm.css';
import './ProfileFreelancer.css';
import '../Profile.css';

// const MAX_ATTACHED_DOCS = 8;

function ProfileFreelancer({ setCurrentUser }) {
  const { currentUser } = useContext(Context);
  const { values, setValues, errors, handleChange } = useFormAndValidation();
  const [isEditable, setIsEditable] = useState(false);
  const [tags, setTags] = useState(currentUser?.stacks?.map((object) => object.name) || []);
  const [photo, setPhoto] = useState(null);
  const [diploma, setDiploma] = useState(null);
  const [portfolio, setPortfolio] = useState(null);

  // const [docKeysEdu, setDocKeysEdu] = useState([...currentUser.education[0]?.diploma?.map((element) => element.id), Date.now()] || [Date.now()]);
  // const [docKeysEdu, setDocKeysEdu] = useState(() => {
  //   const education = currentUser?.education[0];
  //   const diplomaIds = education?.diploma?.map((element) => element.id) || [];
  //   return [...diplomaIds, Date.now()];
  // });
  // const [docKeysPortfolio, setDocKeysPortfolio] = useState([...currentUser.portfolio?.map((element) => element.id), Date.now()] || [Date.now()]);

  // const handleDocEduChange = (event) => {
  //   handleChange(event);
  //   if (event.currentTarget.files[0]) {
  //     setDocKeysEdu(prevKeys => [...prevKeys, Date.now()]);
  //   }
  // };
  //
  // const onDeleteDocEduClick = (key) => {
  //   setDocKeysEdu(prevKeys => prevKeys.filter(prevKey => prevKey !== key));
  // }
  //
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

  function handleAvatar(file) {
    setPhoto({ file });
  }

  function handleDiploma(files) {
    setDiploma(files);
  }

  function handlePortfolio(files) {
    setPortfolio(files);
  }

  function handleSubmit(event) {
    event.preventDefault();

    // if (currentUser.education[0]) {}

    // setValues({
    // user: {
    //   first_name: currentUser?.user?.first_name,
    //   last_name: currentUser?.user?.last_name
    // },
    // stacks: currentUser?.stacks,
    // categories: [{
    //   name: currentUser?.categories[0]?.name
    // }],
    //   education: [{
    //     diploma: [{
    //       file: currentUser?.education[0]?.diploma[0]?.file,
    //       name: currentUser?.education[0]?.diploma[0]?.name
    //     }],
    //     name: currentUser?.education[0]?.name,
    //     faculty: currentUser?.education[0]?.faculty,
    //     start_year: currentUser?.education[0]?.start_year,
    //     finish_year: currentUser?.education[0]?.finish_year,
    //     degree: currentUser?.education[0]?.degree
    //   }],
    // })

    // let newErrors = {};

    // if (!values.name) {
    //   newErrors = {...newErrors, name: 'Введите название компании'};
    // }

    // setErrors({ ...errors, ...newErrors });

    // if (
    //   isValid
    //   // && values.name
    //   // && values.email
    // ) {

    const newData = {
      user: {
        first_name: values?.first_name || currentUser?.user?.first_name,
        last_name: values?.last_name || currentUser?.user?.last_name,
      },
      stacks: tags.map((tag) => ({ name: tag })),
      categories: [
        {
          name: values?.categories || currentUser?.categories[0]?.name,
        },
      ],
      photo: photo?.file,
      payrate: values?.payrate,
      about: values?.about,
      web: values?.web,
    };

    const isEdu =
      diploma?.file &&
      diploma?.name &&
      values?.education &&
      values?.faculty &&
      values?.start_year &&
      values?.finish_year &&
      values?.degree;

    if (isEdu) {
      newData.education = [
        {
          diploma: [
            {
              file: diploma?.file || currentUser?.education[0]?.diploma[0]?.file,
              name: diploma?.name || currentUser?.education[0]?.diploma[0]?.name,
            },
          ],
          name: values?.education || currentUser?.education[0]?.name,
          faculty: values?.faculty || currentUser?.education[0]?.faculty,
          start_year: values?.start_year || currentUser?.education[0]?.start_year,
          finish_year: values?.finish_year || currentUser?.education[0]?.finish_year,
          degree: values?.degree || currentUser?.education[0]?.degree,
        },
      ];
    }

    if (values?.phone || values?.email || values?.telegram || values?.preferred) {
      newData.contacts = newData.contacts || [];

      if (values?.phone || currentUser.contacts.find((item) => item.type === 'phone')) {
        newData.contacts.push({
          type: 'phone',
          value: values?.phone,
          preferred: values?.preferred === 'phone',
        });
      }
      if (values?.email || currentUser.contacts.find((item) => item.type === 'email')) {
        newData.contacts.push({
          type: 'email',
          value: values?.email,
          preferred: values?.preferred === 'email',
        });
      }
      if (values?.telegram || currentUser.contacts.find((item) => item.type === 'telegram')) {
        newData.contacts.push({
          type: 'telegram',
          value: values?.telegram,
          preferred: values?.preferred === 'telegram',
        });
      }
    }

    if (portfolio && portfolio[0]?.file && portfolio[0]?.name) {
      newData.portfolio = [
        {
          file: portfolio[0]?.file,
          name: portfolio[0]?.name,
        },
      ];
    }

    Api.updateUserProfile(newData)
      .then((result) => {
        setCurrentUser(result);
        setIsEditable(false);
      })
      .catch((error) => {
        console.error(error);
      });
    // }
  }

  return (
    <div className="profile">
      <Helmet>
        <title>
          {`${currentUser?.user?.first_name} ${currentUser?.user?.last_name}` || 'Мой профиль'} •
          Таски
        </title>
      </Helmet>

      <div className="profile_left-column">
        <div className="profile_block profile__user-info">
          <InputImage
            name="photo"
            width={80}
            height={80}
            value={values.photo || currentUser.photo || ''}
            error={errors.photo}
            errorMessage={errors.photo}
            onChange={handleAvatar}
            isDisabled={!isEditable}
          />
          <h2 className="profile__title profile__title_place_aside">
            {currentUser.user?.first_name} {currentUser.user?.last_name}
          </h2>
          <p className="profile__main-text">Фрилансер</p>
        </div>

        <div className="profile__separate-line" />

        <div className="profile_block profile__setting ">
          <h3 className="profile__title">Настройки</h3>
          <div className="profile__separate-line" />
          <Link className="profile__main-text" to="">
            Информация
          </Link>
        </div>
      </div>

      <div className="profile_block profile__form-container">
        <form className="form-profile" onSubmit={handleSubmit}>
          <div className="form-profile__top-container">
            <h2 className="profile__title">Информация об аккаунте</h2>
            {isEditable ? (
              <>
                <button
                  onClick={() => setIsEditable(false)}
                  className="form-top-buttons form-top-buttons_type_cancel"
                  type="button"
                >
                  Отмена
                </button>
                <button type="submit" className="form-top-buttons form-top-buttons_type_submit">
                  Сохранить
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditable(true)}
                className="form-top-buttons form-top-buttons_type_submit"
              >
                Редактировать
              </button>
            )}
          </div>

          <div className="form-profile__input-container">
            <InputText
              type="email"
              placeholder="Эл. почта"
              autoComplete="email"
              name="email"
              width="100%"
              value={values.email || currentUser?.account_email || ''}
              error={errors.email}
              errorMessage={errors.email}
              onChange={handleChange}
              id="email"
              isDisabled
            />
          </div>

          <div className="profile__separate-line" />

          <h2 className="profile__title">Информация о профиле</h2>
          <div className="form-profile__input-container">
            <label className="profile__main-text" htmlFor="firstName">
              Имя Фамилия
            </label>
            <InputText
              type="text"
              placeholder="Имя"
              autoComplete="given-name"
              name="first_name"
              width="100%"
              value={values.first_name || currentUser.user?.first_name || ''}
              error={errors.first_name}
              errorMessage={errors.first_name}
              onChange={handleChange}
              id="firstName"
              isDisabled={!isEditable}
            />
            <InputText
              type="text"
              placeholder="Фамилия"
              autoComplete="family-name"
              name="last_name"
              width="100%"
              marginTop={12}
              value={values.last_name || currentUser.user?.last_name || ''}
              error={errors.last_name}
              errorMessage={errors.last_name}
              onChange={handleChange}
              id="lastName"
              isDisabled={!isEditable}
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Специализация</h2>
            <InputSelect
              name="categories"
              placeholder="Выберите из списка"
              width="100%"
              value={
                values.categories || currentUser?.categories ? currentUser?.categories[0]?.name : ''
              }
              onChange={handleChange}
              options={industryAndCategoryOptions}
              isDisabled={!isEditable}
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Навыки</h2>
            <InputTags name="stacks" tags={tags} setTags={setTags} isDisabled={!isEditable} />
          </div>

          <div className="form-profile__input-container">
            <label className="profile__main-text" htmlFor="workingRate">
              Ставка в час
            </label>
            <InputText
              type="number"
              placeholder="Ставка"
              name="payrate"
              width={295}
              value={values.payrate || currentUser?.payrate ? currentUser?.payrate.toString() : ''}
              error={errors.payrate}
              errorMessage={errors.payrate}
              onChange={handleChange}
              id="workingRate"
              isDisabled={!isEditable}
            />
          </div>

          <div className="profile__main-text form-profile__input-container">
            <label className="profile__main-text" htmlFor="aboutMe">
              О себе
            </label>
            <InputText
              type="textarea"
              placeholder="Расскажите о себе как о специалисте и чем вы можете быть полезны"
              name="about"
              width="100%"
              height={60}
              value={values.about || currentUser?.about || ''}
              error={errors.about}
              errorMessage={errors.about}
              onChange={handleChange}
              id="aboutMe"
              isDisabled={!isEditable}
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Образование</h2>
            <InputText
              type="text"
              placeholder="Учебное заведение"
              name="education"
              width="100%"
              value={
                values.education || currentUser?.education ? currentUser?.education[0]?.name : ''
              }
              error={errors.education}
              errorMessage={errors.education}
              onChange={handleChange}
              id="education"
              isDisabled={!isEditable}
            />

            <div className="form-profile__dates">
              <InputText
                type="number"
                placeholder="Начало учёбы"
                name="start_year"
                width="100%"
                value={
                  values.start_year || currentUser?.education
                    ? currentUser?.education[0]?.start_year
                    : ''
                }
                error={errors.start_year}
                errorMessage={errors.start_year}
                onChange={handleChange}
                isDisabled={!isEditable}
              />
              <InputText
                type="number"
                placeholder="Окончание учёбы"
                name="finish_year"
                width="100%"
                value={
                  values.finish_year || currentUser?.education
                    ? currentUser?.education[0]?.finish_year
                    : ''
                }
                error={errors.finish_year}
                errorMessage={errors.finish_year}
                onChange={handleChange}
                isDisabled={!isEditable}
              />
            </div>

            <InputSelect
              name="degree"
              options={degreeOptions}
              placeholder="Степень"
              width="100%"
              value={
                values.degree || currentUser?.education ? currentUser?.education[0]?.degree : ''
              }
              onChange={handleChange}
              isDisabled={!isEditable}
            />

            <InputText
              type="text"
              placeholder="Факультет"
              name="faculty"
              width="100%"
              value={
                values.faculty || currentUser?.education ? currentUser?.education[0]?.faculty : ''
              }
              error={errors.faculty}
              errorMessage={errors.faculty}
              onChange={handleChange}
              id="faculty"
              isDisabled={!isEditable}
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Сертификаты, грамоты, дипломы</h2>
            <div className="freelancer-complete-form__input-doc-wrapper">
              {/*{docKeysEdu.slice(0, MAX_ATTACHED_DOCS).map((key, index) => (*/}
              {/*  <InputDocument key={key} name="diploma" value={values.diploma || currentUser.education[0]?.diploma[index] || ''}*/}
              {/*            error={errors.diploma} errorMessage={errors.diploma}*/}
              {/*            onChange={(event) => handleDocEduChange(event, key)}*/}
              {/*            onDeleteDocClick={() => onDeleteDocEduClick(key)}*/}
              {/*            isDisabled={!isEditable}*/}
              {/*  />*/}
              {/*))}*/}
              <InputDocument
                name="diploma"
                value={
                  values.diploma || currentUser?.education ? currentUser.education[0]?.diploma : ''
                }
                error={errors.diploma}
                errorMessage={errors.diploma}
                onChange={handleDiploma}
                isDisabled={!isEditable}
              />
            </div>
          </div>

          <div className="profile__separate-line" />

          <h2 className="profile__title">Контакты</h2>

          <div className="form-profile__input-container">
            <label className="profile__main-text" htmlFor="phoneForContacts">
              Номер телефона
            </label>
            <InputText
              type="tel"
              placeholder="+7"
              autoComplete="tel"
              name="phone"
              width="100%"
              value={
                values.phone ||
                currentUser?.contacts?.find((item) => item?.type === 'phone')?.value ||
                ''
              }
              error={errors.phone}
              errorMessage={errors.phone}
              onChange={handleChange}
              id="phoneForContacts"
              isDisabled={!isEditable}
            />
            <InputSwitch
              type="radio"
              name="preferred"
              label="Предпочтительный вид связи"
              value="phone"
              onChange={handleChange}
              isDisabled={!isEditable}
              defaultChecked={
                currentUser?.contacts?.find((item) => item?.type === 'phone')?.preferred
              }
            />

            <label className="profile__main-text" htmlFor="emailForContacts">
              Эл. почта
            </label>
            <InputText
              type="email"
              placeholder="Эл. почта"
              autoComplete="email"
              name="email"
              width="100%"
              value={
                values.email ||
                currentUser?.contacts?.find((item) => item?.type === 'email')?.value ||
                ''
              }
              error={errors.email}
              errorMessage={errors.email}
              onChange={handleChange}
              id="emailForContacts"
              isDisabled={!isEditable}
            />
            <InputSwitch
              type="radio"
              name="preferred"
              label="Предпочтительный вид связи"
              value="email"
              onChange={handleChange}
              isDisabled={!isEditable}
              defaultChecked={
                currentUser?.contacts?.find((item) => item?.type === 'email')?.preferred
              }
            />
          </div>

          <div className="form-profile__input-container">
            <label className="profile__main-text" htmlFor="telegram">
              Телеграм
            </label>
            <InputText
              type="text"
              placeholder="Телеграм"
              autoComplete="telegram"
              name="telegram"
              width="100%"
              value={
                values.telegram ||
                currentUser?.contacts?.find((item) => item?.type === 'telegram')?.value ||
                ''
              }
              error={errors.telegram}
              errorMessage={errors.telegram}
              onChange={handleChange}
              id="telegram"
              isDisabled={!isEditable}
            />
            <InputSwitch
              type="radio"
              name="preferred"
              label="Предпочтительный вид связи"
              value="telegram"
              onChange={handleChange}
              isDisabled={!isEditable}
              defaultChecked={
                currentUser?.contacts?.find((item) => item?.type === 'telegram')?.preferred
              }
            />
          </div>

          <div className="profile__separate-line" />

          <div className="form-profile__input-container">
            <h2 className="profile__title">Портфолио</h2>
            <div className="freelancer-complete-form__input-doc-wrapper">
              {/*{docKeysPortfolio.slice(0, MAX_ATTACHED_DOCS).map((key, index) => (*/}
              {/*  <InputDocument key={key} name="portfolio" value={values.portfolio || currentUser?.portfolio[index] || ''}*/}
              {/*            error={errors.portfolio} errorMessage={errors.portfolio}*/}
              {/*            onChange={(event) => handleDocPortfolioChange(event, key)}*/}
              {/*            onDeleteDocClick={() => onDeleteDocPortfolioClick(key)}*/}
              {/*            isDisabled={!isEditable}*/}
              {/*  />*/}
              {/*))}*/}
              <InputDocument
                name="portfolio"
                value={values.portfolio || currentUser?.portfolio || ''}
                error={errors.portfolio}
                onChange={handlePortfolio}
                isDisabled={!isEditable}
              />
            </div>

            <div className="form-profile__input-container">
              <label className="profile__main-text" htmlFor="portfolioLink">
                Ссылка на портфолио
              </label>
              <InputText
                type="url"
                placeholder="https://example.com"
                name="web"
                width="100%"
                value={values.web || currentUser?.web || ''}
                error={errors.web}
                errorMessage={errors.web}
                onChange={handleChange}
                id="portfolioLink"
                isDisabled={!isEditable}
              />
            </div>
          </div>

          {isEditable && (
            <div className="form-profile__bottom-buttons-container">
              <Button
                text="Отмена"
                buttonSecondary
                width={289}
                type="button"
                onClick={() => setIsEditable(false)}
              />
              <button
                type="submit"
                className="profile__main-text form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
              >
                Сохранить
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export { ProfileFreelancer };

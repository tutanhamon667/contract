import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";

import "../Profile.css";
import "./ProfileFreelancer.css";
import "../../../components/Forms/FreelancerCompleteForm/FreelancerCompleteForm.css";

import useFormAndValidation from "../../../hooks/useFormAndValidation";
import { Context } from "../../../context/context"
import InputMultipleSelect from "../../../components/Inputs/InputMultipleSelect/InputMultipleSelect";
import InputTags from "../../../components/Inputs/InputTags/InputTags";
import { InputDoc } from "../../../components/Inputs/InputDoc/InputDoc";
import { activityOptions, degreeOptions } from '../../../utils/constants';
import InputSelect from '../../../components/Inputs/InputSelect/InputSelect';
import InputText from '../../../components/Inputs/InputText/InputText';
import { InputImage } from '../../../components/Inputs/InputImage/InputImage';
// import { freelancerData } from "../../utils/freelance"; // заглушка для проверки обработки данных формы

// переиспользуемые элементы с Forms/FreelancerCompleteForm
const MAX_ATTACHED_DOCS = 8;

export default function ProfileFreelancer() {
  const [isEditable, setIsEditable] = useState(false);
  // переиспользуемый хук с Forms/FreelancerCompleteForm
  const [docKeysPortfolio, setDocKeysPortfolio] = useState([Date.now()]);
  // ------------------------------------------
  const { updateUser, currentUser } = useContext(Context);
  const { values, errors, isValid, handleChange, setValues } = useFormAndValidation();

  const handleDocPortfolioChange = (event) => {
    handleChange(event);
    if (event.currentTarget.files[0]) {
      setDocKeysPortfolio(prevKeys => [...prevKeys, Date.now()]);
    }
  };

  const onDeleteDocPortfolioClick = (key) => {
    setDocKeysPortfolio(prevKeys => prevKeys.filter(prevKey => prevKey !== key));
  }
  // ------------------------------------------

  function handleSubmit(e) {
    e.preventDefault()
    setIsEditable(false)
  }

  return (
    <div className="profile">

      <div className="profile_left-column">

        <div className="profile_block profile__user-info">
          <InputImage name="photo" width={80} height={80} value={values.photo || ''} error={errors.photo}
                      errorMessage={errors.photo} onChange={handleChange}
          />
          <h2 className="profile__title">
            {currentUser.first_name}&nbsp;{currentUser.last_name}
          </h2>
          <p className="profile__main-text">{currentUser.role}</p>
        </div>

        <div className="profile__separate-line"></div>

        <div className="profile_block profile__setting ">
          <h3 className="profile__title">Настройки</h3>
          <div className="profile__separate-line"></div>
          <Link className="profile__main-text" to="#">Информация</Link>
        </div>

      </div>

      <div className="profile_block profile__form-container">

        <form
          className="form-profile"
          onSubmit={handleSubmit}
        >

          <div className="form-profile__top-container">
            <h2 className="profile__title">Информация об аккаунте</h2>
            {isEditable ? (
              <>
                <button
                  onClick={() => setIsEditable(false)}
                  className="form-top-buttons form-top-buttons_type_cansel">
                  Отмена
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="form-top-buttons form-top-buttons_type_submit">
                  Сохранить
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditable(true)}
                className="form-top-buttons form-top-buttons_type_submit">
                Редактировать
              </button>
            )}
          </div>

          <div className="form-profile__input-container">
            <InputText type="email" placeholder="Эл. почта" autoComplete="email" name="email" width="100%"
                       value={values.email || ''} error={errors.email} errorMessage={errors.email}
                       onChange={handleChange} id="email"
            />
            <InputText type="tel" placeholder="+7" autoComplete="tel" name="phone" width="100%" value={values.tel || ''}
                       error={errors.tel} errorMessage={errors.tel} onChange={handleChange} id="phone"
            />
          </div>

          <div className="profile__separate-line"></div>

          <h2 className="profile__title">Информация о профиле</h2>
          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="firstName">
              Имя Фамилия
            </label>
            <InputText type="text" placeholder="Имя" autoComplete="given-name" name="first_name" width="100%"
                       value={values.first_name || ''} error={errors.first_name} errorMessage={errors.first_name}
                       onChange={handleChange} id="firstName"
            />
            <InputText type="text" placeholder="Фамилия" autoComplete="family-name" name="last_name" width="100%"
                       marginTop={12} value={values.last_name || ''} error={errors.last_name}
                       errorMessage={errors.last_name} onChange={handleChange} id="lastName"
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Специализация</h2>
            <InputMultipleSelect name="activity" options={activityOptions} />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Навыки</h2>
            <InputTags />
          </div>

          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="workingRate">
              Ставка в час
            </label>
            <InputText type="number" placeholder="Ставка" name="payrate" width={295} value={values.payrate || ''}
                       error={errors.payrate} errorMessage={errors.payrate} onChange={handleChange}
                       id="workingRate"
            />
          </div>

          <div className="profile__main-text form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="aboutMe">
              О себе
            </label>
            <InputText type="textarea" placeholder="Расскажите о себе как о специалисте и чем вы можете быть полезны"
                       name="about" width="100%" height={60} value={values.about || ''} error={errors.about}
                       errorMessage={errors.about} onChange={handleChange} id="aboutMe"
            />
          </div>

          <div className="form-profile__input-container">

            <h2 className="profile__main-text">Образование</h2>
            <InputText type="text" placeholder="Учебное заведение" name="education" width="100%"
                       value={values.education || ''} error={errors.education} errorMessage={errors.education}
                       onChange={handleChange} id="education"
            />

            <div className="form-profile__dates">
              <InputText type="month" placeholder="Начало учёбы" name="start_year" width="100%"
                         value={values.start_year || ''} error={errors.start_year} errorMessage={errors.start_year}
                         onChange={handleChange}
              />
              <InputText type="month" placeholder="Окончание учёбы" name="end_year" width="100%"
                         value={values.end_year || ''} error={errors.end_year} errorMessage={errors.end_year}
                         onChange={handleChange}
              />
            </div>

            <InputSelect options={degreeOptions} placeholder="Степень" width="100%" />

            <InputText type="text" placeholder="Факультет" name="faculty" width="100%" value={values.faculty || ''}
                       error={errors.faculty} errorMessage={errors.faculty} onChange={handleChange} id="faculty"
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Сертификаты, грамоты, дипломы</h2>
            {/* переиспользуемый компонент с Forms/FreelancerCompleteForm */}
            <div className="freelancer-complete-form__input-doc-wrapper">
              {docKeysPortfolio.slice(0, MAX_ATTACHED_DOCS).map((key) => (
                <InputDoc key={key} name="portfolio" value={values.portfolio || ''} error={errors.portfolio}
                  errorMessage={errors.portfolio}
                  onChange={(event) => handleDocPortfolioChange(event, key)}
                  onDeleteDocClick={() => onDeleteDocPortfolioClick(key)}
                />
              ))}
            </div>
            {/* --------------------------------------------- */}
          </div>


          <div className="profile__separate-line"></div>

          <h2 className="profile__title">Контакты</h2>

          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="emailForContacts">
              Электронная почта
            </label>
            <InputText type="email" placeholder="Эл. почта" autoComplete="email" name="email" width="100%"
                       value={values.email || ''} error={errors.email} errorMessage={errors.email}
                       onChange={handleChange} id="emailForContacts"
            />
            {/* переиспользуемый компонент с Forms/FreelancerCompleteForm */}
            <label className="freelancer-complete-form__input-radio-text">
              <input type="radio" className="freelancer-complete-form__input-radio" name="contact-prefer" />
              Предпочтительный вид связи
            </label>
            {/* --------------------------------------------- */}
          </div>

          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="telegram">
              Телеграм
            </label>
            <InputText type="text" placeholder="Телеграм" autoComplete="telegram" name="telegram" width="100%"
                       value={values.telegram || ''} error={errors.telegram} errorMessage={errors.telegram}
                       onChange={handleChange} id="telegram"
            />
            {/* переиспользуемый компонент с Forms/FreelancerCompleteForm */}
            <label className="freelancer-complete-form__input-radio-text">
              <input type="radio" className="freelancer-complete-form__input-radio" name="contact-prefer" />
              Предпочтительный вид связи
            </label>
            {/* --------------------------------------------- */}
          </div>

          <div className="profile__separate-line"></div>

          <div className="form-profile__input-container">
            <h2 className="profile__title">Портфолио</h2>
            {/* // переиспользуемый компонент с Forms/FreelancerCompleteForm */}
            <div className="freelancer-complete-form__input-doc-wrapper">
              {docKeysPortfolio.slice(0, MAX_ATTACHED_DOCS).map((key) => (
                <InputDoc key={key} name="portfolio" value={values.portfolio || ''} error={errors.portfolio}
                  errorMessage={errors.portfolio}
                  onChange={(event) => handleDocPortfolioChange(event, key)}
                  onDeleteDocClick={() => onDeleteDocPortfolioClick(key)}
                />
              ))}
            </div>
            {/* --------------------------------------------- */}

            <div className="form-profile__input-container">
              <label
                className="profile__main-text"
                htmlFor="portfolioLink">
                Ссылка на портфолио
              </label>
              <InputText type="url" placeholder="www.example.com" name="web" width="100%" value={values.web || ''}
                         error={errors.web} errorMessage={errors.web} onChange={handleChange} id="portfolioLink"
              />
            </div>

          </div>

          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="portfolioLink">
              Ссылка на портфолио
            </label>
            <input
              type="url"
              name="portfolioLink"
              id="portfolioLink"
              className="profile__main-text form-profile__input"
              placeholder="https://myportfolio.ru/"
            />
          </div>

          {isEditable && (
            <div className="form-profile__bottom-buttons-container">
              <button
                className="profile__main-text form-profile__bottom-buttons"
                onClick={() => setIsEditable(false)}>
                Отмена
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="profile__main-text form-profile__bottom-buttons form-profile__bottom-buttons_type_submit">
                Сохранить
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  )
}

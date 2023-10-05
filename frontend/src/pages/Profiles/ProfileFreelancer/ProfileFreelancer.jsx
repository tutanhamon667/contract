import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";

import "../Profile.css";
import "./ProfileFreelancer.css";
import "../../../components/Forms/FreelancerCompleteForm/FreelancerCompleteForm.css";

import useFormAndValidation from "../../../hooks/useFormAndValidation";
import { Context } from "../../../context/context"
import InputSpecializationList from "../../../components/Inputs/InputSpecializationList/InputSpecializationList";
import InputTags from "../../../components/Inputs/InputTags/InputTags";
import { InputDoc } from "../../../components/Inputs/InputDoc/InputDoc";
// import { freelancerData } from "../../utils/frelance"; // заглушка для проверки обработки данных формы

export default function ProfileFreelancer() {
  const [isEditable, setIsEditable] = useState(false);
  // переиспользуемый хук с Forms/FreelancerCompleteForm
  const [docKeysPortfolio, setDocKeysPortfolio] = useState([Date.now()]);
  // ------------------------------------------
  // (1) временное решение для стилизации заголовка Степень
  const [title, setTitle] = useState('undefined');
  // ------------------------------------------
  const { updateUser, currentUser } = useContext(Context);
  const { values, errors, isValid, handleChange, setValues } = useFormAndValidation();

  // (1) временное решение для стилизации заголовка Степень
  function handleTitle(e) { setTitle(e.target.value) }
  const degreeTitleStyle = `
  form-profile__input form-profile__list ${title === 'undefined' ? 'form-profile__list-default' : ''}`
  // ------------------------------------------

  // переиспользуемые элементы с Forms/FreelancerCompleteForm
  const MAX_ATTACHED_DOCS = 8;

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
          <div className="profile__avatar"></div>
          <h2 className="profile__title">
            {currentUser.first_name}&nbsp;{currentUser.last_name}
          </h2>
          <p className="profile__main-text">Фрилансер</p>
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
            <input
              type="email"
              name="email"
              id="email"
              placeholder="birukov@gmail.com"
              className="profile__main-text form-profile__input"
            />
            <input
              type="tel"
              name="phone"
              id="phone"
              maxLength="12"
              placeholder="+7"
              className="profile__main-text form-profile__input"
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
            <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="Александр"
              className="profile__main-text form-profile__input"
            />
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Бирюков"
              className="profile__main-text form-profile__input"
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Специализация</h2>
            <InputSpecializationList />
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
            <input
              type="text"
              name="workingRate"
              id="workingRate"
              placeholder="150"
              className="profile__main-text form-profile__input form-profile__rate-input"
            />
          </div>

          <div className="profile__main-text form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="aboutMe">
              О себе
            </label>
            <textarea
              name="aboutMe"
              id="aboutMe"
              cols="30"
              rows="1"
              className="profile__main-text form-profile__input"
              placeholder="Расскажите о себе как о специалисте и чем вы можете быть полезны"
            ></textarea>
          </div>

          <div className="form-profile__input-container">

            <h2 className="profile__main-text">Образование</h2>
            <input
              type="text"
              name="education"
              id="education"
              className="profile__main-text form-profile__input"
              placeholder="Университет"
            />

            <div className="form-profile__dates">
              <input type="month"
                name="beginningOfStudies"
                id="beginningOfStudies"
                placeholder="Начало учёбы"
                className="profile__main-text form-profile__input form-profile__dates_input"
              />
              <input type="month"
                name="endOfStudies"
                id="endOfStudies"
                placeholder="Окончание учёбы"
                className="profile__main-text form-profile__input form-profile__dates_input"
              />
            </div>

            <select
              name="degree"
              id="degree"
              className={degreeTitleStyle}
              onChange={handleTitle}
            >
              <option
                value="undefined"
                className="profile__main-text form-profile__list-default">
                Степень
              </option>
              <option
                value="bachelor"
                className="profile__main-text">
                Студент
              </option>
              <option
                value="bachelor"
                className="profile__main-text">
                Бакалавр
              </option>
              <option
                value="specialist"
                className="profile__main-text">
                Специалист
              </option>
              <option
                value="master"
                className="profile__main-text">
                Магистр
              </option>
            </select>

            <input
              type="text"
              name="faculty"
              id="faculty"
              className="profile__main-text form-profile__input"
              placeholder="Факультет"
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
            <input
              type="emailForContacts"
              name="emailForContacts"
              id="email"
              className="profile__main-text form-profile__input"
              placeholder="Эл.почта"
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
            <input
              type="text"
              name="telegram"
              id="telegram"
              className="profile__main-text form-profile__input"
              placeholder="Телеграм"
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

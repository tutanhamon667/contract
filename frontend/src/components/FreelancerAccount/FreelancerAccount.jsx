import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";

import "../FreelancerAccount/FreelancerAccount.css";
import "../Forms/FreelancerCompleteForm/FreelancerCompleteForm.css";

import useFormAndValidation from "../../hooks/useFormAndValidation";
import { Context } from "../../context/context"
import InputSpecializationList from "../Inputs/InputSpecializationList/InputSpecializationList";
import InputTags from "../Inputs/InputTags/InputTags";
import { InputDoc } from "../Inputs/InputDoc/InputDoc";
// import { freelancerData } from "../../utils/frelance"; // заглушка для проверки обработки данных формы

export default function FreelancerAccount() {
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
  form-profile__list ${title === 'undefined' ? 'form-profile__list-default' : ''}`
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
    <div className="accountF">

      <div className="accountF_left-column">

        <div className="accountF__short-info">
          <div className="account__avatar"></div>
          <h2 className="accountF__title">
            {currentUser.first_name}&nbsp;{currentUser.last_name}
          </h2>
          <p className="accountF__specialty">Фрилансер</p>
        </div>

        <div className="accountF__separate-line"></div>

        <div className="accountF__setting-container">
          <h3 className="accountF__setting">Настройки</h3>
          <div className="accountF__separate-line"></div>
          <Link className="accountF__subtitle" to="#">Информация</Link>
        </div>

      </div>

      <div className="accountF__form-container">

        <form className="form-profile" onSubmit={handleSubmit}>

          <div className="form-profile__top-container">
            <h2 className="accountF__title">Информация об аккаунте</h2>
            {isEditable ? (
              <>
                <button
                  onClick={() => setIsEditable(false)}
                  className="accountF__subtitle form-profile__cansel">
                  Отмена
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="accountF__subtitle form-profile__save">
                  Сохранить
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditable(true)}
                className="accountF__subtitle form-profile__save">
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
              className="form-profile__input"
            />
            <input
              type="tel"
              name="phone"
              id="phone"
              maxLength="12"
              placeholder="+7"
              className="form-profile__input"
            />
          </div>

          <div className="accountF__separate-line"></div>

          <h2 className="accountF__title">Информация о профиле</h2>
          <div className="form-profile__input-container">
            <label
              className="accountF__subtitle"
              htmlFor="firstName">
              Имя Фамилия
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="Александр"
              className="form-profile__input"
            />
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Бирюков"
              className="form-profile__input"
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="accountF__subtitle">Специализация</h2>
            <InputSpecializationList />
          </div>

          <div className="form-profile__input-container">
            <h2 className="accountF__subtitle">Навыки</h2>
            <InputTags />
          </div>

          <div className="form-profile__input-container">
            <label
              className="accountF__subtitle"
              htmlFor="workingRate">
              Ставка в час
            </label>
            <input
              type="text"
              name="workingRate"
              id="workingRate"
              placeholder="150"
              className="form-profile__input form-profile__rate-input"
            />
          </div>

          <div className="form-profile__input-container">
            <label
              className="accountF__subtitle"
              htmlFor="aboutMe">
              О себе
            </label>
            <textarea
              name="aboutMe"
              id="aboutMe"
              cols="30"
              rows="1"
              className="form-profile__input"
              placeholder="Расскажите о себе как о специалисте и чем вы можете быть полезны"
            ></textarea>
          </div>

          <div className="form-profile__input-container">

            <h2 className="accountF__subtitle">Образование</h2>
            <input
              type="text"
              name="education"
              id="education"
              className="form-profile__input"
              placeholder="Университет"
            />

            <div className="form-profile__dates">
              <input type="month"
                name="beginningOfStudies"
                id="beginningOfStudies"
                placeholder="Начало учёбы"
                className="form-profile__input form-profile__input-dates"
              />
              <input type="month"
                name="endOfStudies"
                id="endOfStudies"
                placeholder="Окончание учёбы"
                className="form-profile__input form-profile__input-dates"
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
                className="form-profile__list form-profile__list-default">
                Степень
              </option>
              <option
                value="bachelor"
                className="form-profile__list">
                Студент
              </option>
              <option
                value="bachelor"
                className="form-profile__list">
                Бакалавр
              </option>
              <option
                value="specialist"
                className="form-profile__list">
                Специалист
              </option>
              <option
                value="master"
                className="form-profile__list">
                Магистр
              </option>
            </select>

            <input
              type="text"
              name="faculty"
              id="faculty"
              className="form-profile__input"
              placeholder="Факультет"
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="accountF__subtitle">Сертификаты, грамоты, дипломы</h2>
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


          <div className="accountF__separate-line"></div>

          <h2 className="accountF__title">Контакты</h2>

          <div className="form-profile__input-container">
            <label
              className="accountF__subtitle"
              htmlFor="emailForContacts">
              Электронная почта
            </label>
            <input
              type="emailForContacts"
              name="emailForContacts"
              id="email"
              className="form-profile__input"
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
              className="accountF__subtitle"
              htmlFor="telegram">
              Телеграм
            </label>
            <input
              type="text"
              name="telegram"
              id="telegram"
              className="form-profile__input"
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
              className="accountF__subtitle"
              htmlFor="portfolioLink">
              Ссылка на портфолио
            </label>
            <input
              type="url"
              name="portfolioLink"
              id="portfolioLink"
              className="form-profile__input"
              placeholder="https://myportfolio.ru/"
            />
          </div>

          <div className="accountF__separate-line"></div>

          <div className="form-profile__input-container">
            <h2 className="accountF__title">Портфолио</h2>
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
            <div className="form-profile__submit-container">
              <button
                className="form-profile__cansel-btn"
                onClick={() => setIsEditable(false)}>
                Отмена
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="form-profile__cansel-btn form-profile__submit-btn">
                Сохранить
              </button>
            </div>
          )}

        </form>

      </div>
    </div>
  )
}

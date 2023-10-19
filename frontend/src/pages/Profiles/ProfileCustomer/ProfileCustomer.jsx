import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../../context/context"
import { activityOptions } from '../../../utils/constants';
import useFormAndValidation from "../../../hooks/useFormAndValidation";
import InputMultipleSelect from "../../../components/Inputs/InputMultipleSelect/InputMultipleSelect";
import "../Profile.css";
import "../ProfileFreelancer/ProfileFreelancer.css";
import "../../../components/Forms/FreelancerCompleteForm/FreelancerCompleteForm.css";
import "./ProfileCustomer.css";
import InputText from '../../../components/Inputs/InputText/InputText';
import { InputImage } from '../../../components/Inputs/InputImage/InputImage';

export default function ProfileCustomer() {
  const [isEditable, setIsEditable] = useState(false);
  const { currentUser } = useContext(Context);
  const { values, errors, isValid, handleChange, setValues } = useFormAndValidation();

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
            <label
              className="profile__main-text"
              htmlFor="email">
              Электронная почта
            </label>
            <InputText type="email" placeholder="Эл. почта" autoComplete="email" name="email" width="100%"
                       value={values.email || ''} error={errors.email} errorMessage={errors.email}
                       onChange={handleChange} id="email"
            />
          </div>

          <div className="profile__separate-line"></div>

          <h2 className="profile__title">Информация о профиле</h2>
          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="companyName">
              Название компании или ваше имя
            </label>
            <InputText type="text" placeholder="Название компании или ваше имя" autoComplete="given-name" name="first_name" width="100%"
                       value={values.first_name || ''} error={errors.first_name} errorMessage={errors.first_name}
                       onChange={handleChange} id="companyName"
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Сфера деятельности</h2>
            <InputMultipleSelect name="activity" options={activityOptions} />
          </div>

          <div className="profile__main-text form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="aboutMe">
              О компании
            </label>
            <InputText type="textarea" placeholder="Расскажите чем занимается ваша компания" name="about" width="100%"
                       height={150} value={values.about || ''} error={errors.about} errorMessage={errors.about}
                       onChange={handleChange} id="aboutMe"
            />
          </div>

          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="portfolioLink">
              Ссылка на портфолио
            </label>
            <InputText type="url" placeholder="www.example.com" name="web" width="100%" value={values.web || ''}
                       error={errors.web} errorMessage={errors.web} onChange={handleChange} id="portfolioLink"
            />
            {isEditable && (
              <button
                type="button"
                className="form__add-info">
                Добавить ещё сайт или социальные сети +
              </button>
            )}
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

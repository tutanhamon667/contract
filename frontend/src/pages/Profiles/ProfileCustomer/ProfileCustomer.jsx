import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";

import "../Profile.css";
import "./ProfileCustomer.css";
import "../ProfileFreelancer/ProfileFreelancer.css";
import "../../../components/Forms/FreelancerCompleteForm/FreelancerCompleteForm.css";

// import useFormAndValidation from "../../../hooks/useFormAndValidation";
import { Context } from "../../../context/context"
import InputMultipleSelect from "../../../components/Inputs/InputMultipleSelect/InputMultipleSelect";
import { activityOptions } from '../../../utils/constants';

export default function ProfileCustomer() {
  const [isEditable, setIsEditable] = useState(false);
  const { currentUser } = useContext(Context);
  // const { values, errors, isValid, handleChange, setValues } = useFormAndValidation();

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
            <input
              type="email"
              name="email"
              id="email"
              placeholder="birukov@gmail.com"
              className="profile__main-text form-profile__input"
            />
          </div>

          <div className="profile__separate-line"></div>

          <h2 className="profile__title">Информация о профиле</h2>
          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="companyName">
              Название компании
            </label>
            <input
              type="text"
              name="companyName"
              id="companyName"
              placeholder=""
              className="profile__main-text form-profile__input"
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Специализация</h2>
            <InputMultipleSelect name="activity" options={activityOptions} />
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
              rows="3"
              className="profile__main-text form-profile__input"
              placeholder=""
            ></textarea>
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
              placeholder="www.example.com"
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

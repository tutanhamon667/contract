import React, { useState, useContext, useRef } from 'react';
import { Link } from "react-router-dom";
import { Context } from "../../../context/context"
import { industryCategoryOptions } from '../../../utils/constants';
import useFormAndValidation from "../../../hooks/useFormAndValidation";
import "../Profile.css";
import "../ProfileFreelancer/ProfileFreelancer.css";
import "../../../components/Forms/FreelancerCompleteForm/FreelancerCompleteForm.css";
import "./ProfileCustomer.css";
import InputText from '../../../components/Inputs/InputText/InputText';
import { InputImage } from '../../../components/Inputs/InputImage/InputImage';
import InputSelect from '../../../components/Inputs/InputSelect/InputSelect';
import * as Api from '../../../utils/Api';

export default function ProfileCustomer({ setCurrentUser }) {
  const { currentUser } = useContext(Context);
  const { values, errors, handleChange, setValues, setErrors } = useFormAndValidation();
  const [isEditable, setIsEditable] = useState(false);
  const [photo, setPhoto] = useState(null);
  const formRef = useRef(null);

  function addPhoto(url) {
    setPhoto({ photo: url })
  }

  function handleSubmit(e) {
    e.preventDefault()

    setValues({
      name: currentUser?.name || '',
      industry: currentUser?.industry?.name || ''
    })
    // console.log(values);

    let newErrors = {};

    // if (!values.name) {
    //   newErrors = {...newErrors, name: 'Введите название компании'};
    // }

    setErrors({...errors, ...newErrors});

    // if (
      // isValid
      // &&
      // values.name
      // && values.email
    // ) {
      const newData = {
        photo: photo?.photo,
        name: values?.name || currentUser?.name,
        industry: {
          name: values?.industry || currentUser?.industry?.name
        },
        about: values?.about,
        web: values?.web
      }
      Api.updateUserProfile(newData)
        .then((res) => {
          setCurrentUser(res);
          setIsEditable(false);
        })
        .catch((err)=>{
          console.error(err);
        })
    // }

  }

  return (
    <div className="profile">
      <div className="profile_left-column">

        <div className="profile_block profile__user-info">
          <InputImage name="photo" width={80} height={80} value={values.photo || currentUser?.photo || ''}
                      error={errors.photo} errorMessage={errors.photo} onChange={addPhoto} isDisabled={!isEditable}
          />
          <h2 className="profile__title profile__title_place_aside">
            {currentUser?.name}
          </h2>
          <p className="profile__main-text">
            Заказчик
          </p>
        </div>

        <div className="profile__separate-line"></div>

        <div className="profile_block profile__setting">
          <h3 className="profile__title">Настройки</h3>
          <div className="profile__separate-line"></div>
          <Link className="profile__main-text" to="#">Информация</Link>
        </div>

      </div>

      <div className="profile_block profile__form-container">
        <form
          className="form-profile"
          onSubmit={handleSubmit}
          ref={formRef}
        >

          <div className="form-profile__top-container">
            <h2 className="profile__title">Информация об аккаунте</h2>
            {isEditable ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    // formRef.current.reset();
                    setIsEditable(false);
                  }}
                  className="form-top-buttons form-top-buttons_type_cansel"
                >
                  Отмена
                </button>
                <button
                  className="form-top-buttons form-top-buttons_type_submit"
                >
                  Сохранить
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditable(true)}
                className="form-top-buttons form-top-buttons_type_submit"
              >
                Редактировать
              </button>
            )}
          </div>

          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="email"
            >
              Электронная почта
            </label>
            <InputText type="email" placeholder="Эл. почта" autoComplete="email" name="email" width="100%"
                       value={values.email || currentUser?.account_email || ''} error={errors.email}
                       errorMessage={errors.email} onChange={handleChange} id="email" isDisabled={true}
            />
          </div>

          <div className="profile__separate-line"></div>

          <h2 className="profile__title">Информация о профиле</h2>
          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="companyName"
            >
              Название компании
            </label>
            <InputText type="text" placeholder="Название компании" autoComplete="name" name="name"
                       width="100%" value={values.name || currentUser?.name || ''} error={errors.name}
                       errorMessage={errors.name} onChange={handleChange} id="companyName" isDisabled={!isEditable}
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Сфера деятельности</h2>
            <InputSelect name="industry" placeholder="Выберите из списка" width="100%" onChange={handleChange}
                         value={values.industry || currentUser.industry?.name || ''} options={industryCategoryOptions}
                         isDisabled={!isEditable}
            />
          </div>

          <div className="profile__main-text form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="aboutMe"
            >
              О компании
            </label>
            <InputText type="textarea" placeholder="Расскажите чем занимается ваша компания" name="about" width="100%"
                       height={150} value={values.about || currentUser?.about || ''} error={errors.about}
                       errorMessage={errors.about} onChange={handleChange} id="aboutMe" isDisabled={!isEditable}
            />
          </div>

          <div className="form-profile__input-container">
            <label
              className="profile__main-text"
              htmlFor="website"
            >
              Сайт
            </label>
            <InputText type="url" placeholder="https://example.com" name="web" width="100%"
                       value={values.web || currentUser?.web || ''} error={errors.web} errorMessage={errors.web}
                       onChange={handleChange} id="website" isDisabled={!isEditable}
            />
            {isEditable && (
              <button
                type="button"
                className="form__add-info"
              >
                Добавить ещё сайт или социальные сети +
              </button>
            )}
          </div>

          {isEditable && (
            <div className="form-profile__bottom-buttons-container">
              <button
                type="button"
                className="profile__main-text form-profile__bottom-buttons"
                onClick={() => setIsEditable(false)}
              >
                Отмена
              </button>
              <button
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

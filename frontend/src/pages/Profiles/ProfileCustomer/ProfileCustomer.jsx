import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../../../context/context';
import { useFormAndValidation } from '../../../hooks/useFormValidationProfileCustomer';
import { industryAndCategoryOptions } from '../../../utils/constants';
import * as Api from '../../../utils/Api';
import { InputText } from '../../../components/InputComponents/InputText/InputText';
import { InputImage } from '../../../components/InputComponents/InputImage/InputImage';
import { InputSelect } from '../../../components/InputComponents/InputSelect/InputSelect';
import { Button } from '../../../components/Button/Button';
import '../../../components/FormComponents/FreelancerCompleteForm/FreelancerCompleteForm.css';
import '../ProfileFreelancer/ProfileFreelancer.css';
import '../Profile.css';
import './ProfileCustomer.css';

function ProfileCustomer({ setCurrentUser }) {
  const { currentUser } = useContext(Context);

  const { values, errors, isValid, handleChange, setValues, setErrors, setIsValid, checkErrors } =
    useFormAndValidation();

  const [isEditable, setIsEditable] = useState(false);
  const [photo, setPhoto] = useState();
  const formReference = useRef(null);
  const initialData = {
    name: currentUser?.name || '',
    industry: currentUser?.industry?.name || '',
    about: currentUser?.about || '',
    web: currentUser?.web || '',
  };

  const isDisabled = !values.name || !values.industry || !isValid;

  function addPhoto(url) {
    setPhoto({ photo: url });
  }

  useEffect(() => {
    setValues(initialData);
  }, []);

  useEffect(() => {
    const valid = checkErrors(errors);
    setIsValid(valid);
  }, [isValid, errors]);

  function handleCancel() {
    setValues(initialData);
    setIsEditable(false);
    setErrors({});
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (values.name && values.industry && isValid) {
      const newData = {
        photo: photo?.photo,
        name: values?.name || currentUser?.name,
        industry: {
          name: values?.industry || currentUser?.industry?.name,
        },
        about: values?.about,
        web: values?.web,
      };
      Api.updateUserProfile(newData)
        .then((result) => {
          setCurrentUser(result);
          setIsEditable(false);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  return (
    <div className="profile">
      <div className="profile_left-column">
        <div className="profile_block profile__user-info">
          <InputImage
            name="photo"
            width={80}
            height={80}
            value={values.photo || currentUser?.photo || ''}
            error={errors.photo}
            setErrors={setErrors}
            // errors={errors}
            onChange={addPhoto}
            isDisabled={!isEditable}
          />
          <h2 className="profile__title profile__title_place_aside">{currentUser?.name}</h2>
          <p className="profile__main-text">Заказчик</p>
        </div>

        <div className="profile__separate-line" />

        <div className="profile_block profile__setting">
          <h3 className="profile__title">Настройки</h3>
          <div className="profile__separate-line" />
          <Link className="profile__main-text" to="#">
            Информация
          </Link>
        </div>
      </div>

      <div className="profile_block profile__form-container">
        <form className="form-profile" onSubmit={handleSubmit} ref={formReference}>
          <div className="form-profile__top-container">
            <h2 className="profile__title">Информация об аккаунте</h2>
            {isEditable ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="form-top-buttons form-top-buttons_type_cancel"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={`form-top-buttons form-top-buttons_type_submit 
                  ${isDisabled ? 'form-top-buttons_type_submit-disabled' : ''}`}
                  disabled={isDisabled}
                >
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
            <label className="profile__main-text" htmlFor="email">
              Электронная почта
            </label>
            <InputText
              type="email"
              placeholder="Эл. почта"
              autoComplete="email"
              name="email"
              width="100%"
              value={values.email || currentUser?.account_email || ''}
              error={errors.email}
              onChange={handleChange}
              id="email"
              isDisabled
            />
          </div>

          <div className="profile__separate-line" />

          <h2 className="profile__title">Информация о профиле</h2>
          <div className="form-profile__input-container">
            <label className="profile__main-text" htmlFor="companyName">
              Название компании
            </label>
            <InputText
              type="text"
              placeholder="Название компании"
              autoComplete="name"
              name="name"
              width="100%"
              value={isEditable ? values?.name || '' : currentUser?.name || ''}
              error={errors.name}
              onChange={handleChange}
              id="companyName"
              isDisabled={!isEditable}
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="profile__main-text">Сфера деятельности</h2>
            <InputSelect
              name="industry"
              placeholder="Выберите из списка"
              width="100%"
              onChange={handleChange}
              value={isEditable ? values?.industry || '' : currentUser?.industry?.name || ''}
              error={errors.industry}
              options={industryAndCategoryOptions}
              isDisabled={!isEditable}
            />
          </div>

          <div className="profile__main-text form-profile__input-container">
            <label className="profile__main-text" htmlFor="aboutMe">
              О компании
            </label>
            <InputText
              type="textarea"
              placeholder="Расскажите чем занимается ваша компания"
              name="about"
              width="100%"
              height={150}
              value={isEditable ? values?.about || '' : currentUser?.about || values?.about || ''}
              error={errors.about}
              onChange={handleChange}
              id="aboutMe"
              isDisabled={!isEditable}
            />
          </div>

          <div className="form-profile__input-container">
            <label className="profile__main-text" htmlFor="website">
              Сайт
            </label>
            <InputText
              type="url"
              placeholder="https://example.com"
              name="web"
              width="100%"
              value={isEditable ? values?.web || '' : currentUser?.web || values?.web || ''}
              error={errors.web}
              onChange={handleChange}
              id="website"
              isDisabled={!isEditable}
            />
            {isEditable && (
              <button type="button" className="form__add-info">
                Добавить ещё сайт или социальные сети +
              </button>
            )}
          </div>

          {isEditable && (
            <div className="form-profile__bottom-buttons-container">
              <button
                type="button"
                className="profile__main-text form-profile__bottom-buttons"
                onClick={handleCancel}
              >
                Отмена
              </button>
              <Button
                width={289}
                text="Сохранить"
                type="submit"
                className="profile__main-text form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
                disabled={isDisabled}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export { ProfileCustomer };

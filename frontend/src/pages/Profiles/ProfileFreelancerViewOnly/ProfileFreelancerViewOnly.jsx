import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import * as Api from '../../../utils/Api';
import { industryAndCategoryOptions } from '../../../utils/constants';
import { Context } from '../../../context/context';
import { InputDocument } from '../../../components/InputComponents/InputDocument/InputDocument';
import { InputImage } from '../../../components/InputComponents/InputImage/InputImage';
import { InputSelect } from '../../../components/InputComponents/InputSelect/InputSelect';
import { InputText } from '../../../components/InputComponents/InputText/InputText';
import { Button } from '../../../components/Button/Button';
import { useFormAndValidation } from '../../../hooks/useFormValidationProfileCustomer';
import '../../ForgotPass/ForgotPass.css';
import '../ProfileFreelancer/ProfileFreelancer.css';
import '../Profile.css';
import './ProfileFreelancerViewOnly.css';

function ProfileFreelancerViewOnly({
  tasks,
  getTasks,
  onSubmit,
  statePopup,
  setStatePopup,
  isPopupOpen,
  setIsPopupOpen,
  popupError,
  setPopupError,
}) {
  const [freelancer, setFreelancer] = useState({});
  let { id } = useParams();
  const { currentUser } = useContext(Context);
  const navigate = useNavigate();
  const { values, setValues, errors, handleChange, handleChangeCustom } = useFormAndValidation();

  useEffect(() => {
    if (currentUser?.is_customer) {
      getTasks();
    }
    currentUser.is_customer &&
      Api.getFreelancerById(id)
        .then((result) => {
          setFreelancer(result);
        })
        .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFormSubmit() {
    const chosenTask = tasks.find((task) => task.title === values.categories);

    const allValues = {
      job_id: chosenTask?.id || '',
      freelancer: id,
      message_text: values.message,
    };

    onSubmit(allValues);
    //setIsPopupOpen(false)
  }

  return (
    currentUser.is_customer && (
      // freelancer?.is_worker &&
      <>
        <Helmet>
          <title>
            {`${freelancer?.user?.first_name} ${freelancer?.user?.last_name}` || 'Фрилансер'} •
            Таски
          </title>
        </Helmet>

        <section className="profile">
          <div className="profile_left-column">
            <div className="profile_block profile__user-info">
              {freelancer?.photo ? (
                <InputImage
                  name="photo"
                  width={80}
                  height={80}
                  value={freelancer?.photo || ''}
                  isDisabled={true}
                />
              ) : (
                <div className="profile__avatar" />
              )}
              <h2 className="profile__title">
                {freelancer?.user?.first_name} {freelancer?.user?.last_name}
              </h2>
              <p className="profile__main-text profile__specialization">
                {freelancer?.categories &&
                  industryAndCategoryOptions.find(
                    (option) => option?.value === freelancer?.categories[0]?.name,
                  )?.label}
              </p>
            </div>

            <div className="profile_block profile__left-column-info">
              <div>
                <h2 className="profile__title">Ставка за час</h2>
                <p className="profile__main-text profile__info-main-text">
                  {freelancer?.payrate} ₽/час
                </p>
              </div>
              <div>
                <h2 className="profile__title">Портфолио</h2>
                <p className="profile__main-text profile__info-main-text">{freelancer?.web}</p>
              </div>
              <div>
                <h2 className="profile__title">Навыки</h2>
                <p className="profile__main-text profile__info-main-text">
                  {freelancer?.stacks?.map((item) => item?.name).join(', ')}
                </p>
              </div>
              <div>
                <h2 className="profile__title">Образование</h2>
                <p className="profile__main-text profile__info-main-text">
                  {freelancer?.education ? freelancer?.education[0]?.name : ''}
                </p>
              </div>
            </div>

            <Button
              type="button"
              text="Нанять"
              width={289}
              onClick={() => setIsPopupOpen(true)}
              className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
            />
          </div>

          <div className="profile_block profile_right-column">
            <div className="form-profile__input-container">
              <h1 className="profile__title">
                {freelancer?.categories &&
                  industryAndCategoryOptions.find(
                    (option) => option?.value === freelancer?.categories[0]?.name,
                  )?.label}
              </h1>
              <p className="profile__main-text">{freelancer?.about}</p>
            </div>

            <div className="profile__separate-line" />

            <div className="form-profile__input-container">
              <h3 className="profile__main-text">Портфолио</h3>
              <div className="profile__file-container">
                {/*<div className="profile__file" />*/}
                {/*<div className="profile__file" />*/}
                <InputDocument
                  name="portfolio"
                  value={freelancer?.portfolio || ''}
                  isDisabled={true}
                />
              </div>
            </div>

            <div className="profile__separate-line" />

            <div className="form-profile__input-container">
              <h3 className="profile__main-text">Дипломы и сертификаты</h3>
              <div className="profile__file-container">
                <InputDocument
                  name="portfolio"
                  value={freelancer?.education ? freelancer?.education[0]?.diploma : ''}
                  isDisabled={true}
                />
              </div>
            </div>
          </div>
        </section>

        {isPopupOpen && (
          <div className="popup-overlay">
            <div className="popup message-popup">
              <div className="profile__user-info message-popup__user-info">
                {freelancer?.photo ? (
                  <InputImage
                    name="photo"
                    width={80}
                    height={80}
                    value={freelancer?.photo || ''}
                    isDisabled={true}
                  />
                ) : (
                  <div className="profile__avatar" />
                )}
                <h2 className="profile__title">
                  {freelancer?.user?.first_name} {freelancer?.user?.last_name}
                </h2>
                <p className="profile__main-text profile__specialization">
                  {freelancer?.categories &&
                    industryAndCategoryOptions.find(
                      (option) => option?.value === freelancer?.categories[0]?.name,
                    )?.label}
                </p>
              </div>
              <form className="form-message">
                <button
                  type="button"
                  onClick={() => {
                    setIsPopupOpen(false);
                    setPopupError('');
                  }}
                  className="form-message__close-button"
                />
                <InputSelect
                  name="categories"
                  placeholder="Выберите заказ"
                  width="100%"
                  margin="20px 0 12px 0"
                  value={values.categories || ''}
                  onChange={handleChange}
                  options={tasks}
                  //isDisabled={!isEditable}
                />
                <InputText
                  type="textarea"
                  placeholder="Ваше сообщение"
                  name="message"
                  width={534}
                  height={200}
                  value={values.message || ''}
                  error={errors.message || popupError}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}
                  onClick={handleFormSubmit}
                  className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
                >
                  Отправить
                </button>
              </form>
            </div>
          </div>
        )}

        {statePopup && (
          <div className="popup-overlay">
            <div className="popup message-popup">
              <button
                type="button"
                onClick={() => {
                  setStatePopup(false);
                  setIsPopupOpen(false);
                }}
                className="form-message__close-button"
              />
              <div className="popup-message__image" />
              <h2 className="profile__title popup__title" style={{ marginBottom: 16 }}>
                Сообщение отправлено
              </h2>
              <p className="profile__main-text  popup__main-text" style={{ marginBottom: 40 }}>
                В ближайшее время фрилансер вам ответит. А пока рекомендуем связаться с несколькими
                фрилансерами, чтобы повысить шанс на выполнение заказа.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsPopupOpen(false);
                  setStatePopup(false);
                }}
                className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit popup-message__button-to-message"
                style={{ marginBottom: 16 }}
                disabled
              >
                Посмотреть сообщение
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPopupOpen(false);
                  setHiringSuccessful(false);
                  navigate('/', { replace: true });
                }}
                className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit popup-message__button-to-message popup-message__button-to-freelancers"
                style={{ marginBottom: 30 }}
              >
                Найти фрилансера
              </button>
            </div>
          </div>
        )}
      </>
    )
  );
}

export { ProfileFreelancerViewOnly };

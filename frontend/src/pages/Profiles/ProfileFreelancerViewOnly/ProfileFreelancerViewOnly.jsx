import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import * as Api from '../../../utils/Api';
import { industryAndCategoryOptions } from '../../../utils/constants';
import { Context } from '../../../context/context';
import { InputDocument } from '../../../components/InputComponents/InputDocument/InputDocument';
import { InputImage } from '../../../components/InputComponents/InputImage/InputImage';
import { Button } from '../../../components/Button/Button';
import '../../ForgotPass/ForgotPass.css';
import '../ProfileFreelancer/ProfileFreelancer.css';
import '../Profile.css';
import './ProfileFreelancerViewOnly.css';

function ProfileFreelancerViewOnly() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hiringSuccessful, setHiringSuccessful] = useState(false);
  const [freelancer, setFreelancer] = useState({});
  let { id } = useParams();
  const { currentUser } = useContext(Context);

  useEffect(() => {
    currentUser.is_customer &&
      Api.getFreelancerById(id)
        .then((result) => {
          setFreelancer(result);
        })
        .catch(console.error);
  }, []);

  return (
    <>
      {currentUser.is_customer && freelancer?.is_worker && (
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
              <div className="popup">
                <h2 className="profile__title popup__title">
                  Вы хотите нанять специалиста {freelancer?.user?.first_name}{' '}
                  {freelancer?.user?.last_name} для заказа «Создать дизайн лендинга»?
                </h2>
                <button
                  type="button"
                  style={{ marginBottom: 12 }}
                  onClick={() => setHiringSuccessful(true)}
                  className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
                >
                  Нанять
                </button>
                <button
                  type="button"
                  onClick={() => setIsPopupOpen(false)}
                  className="form-profile__bottom-buttons"
                >
                  Отменить
                </button>
              </div>
            </div>
          )}

          {hiringSuccessful && (
            <div className="popup-overlay">
              <div className="popup">
                <div className="popup-check-mark" />
                <h2 className="profile__title popup__title" style={{ marginBottom: 16 }}>
                  Вы успешно наняли специалиста {freelancer?.user?.first_name}{' '}
                  {freelancer?.user?.last_name} для заказа «Создать дизайн лендинга».
                </h2>
                <p className="profile__main-text  popup__main-text" style={{ marginBottom: 40 }}>
                  Свяжитесь с ним, чтобы обсудить детали проекта. Контактные данные вы можете найти
                  в профиле
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsPopupOpen(false);
                    setHiringSuccessful(false);
                  }}
                  className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
                  style={{ marginBottom: 50 }}
                >
                  Посмотреть профиль
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export { ProfileFreelancerViewOnly };

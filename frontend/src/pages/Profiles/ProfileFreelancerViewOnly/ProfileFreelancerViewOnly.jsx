import React, { useState } from "react";
import "../Profile.css"
import "../ProfileFreelancer/ProfileFreelancer.css"
import "./ProfileFreelancerViewOnly.css"
import "../../ForgotPass/ForgotPass.css"

export default function ProfileFreelancerViewOnly() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hiringSuccessful, setHiringSuccessful] = useState(false);

  return (
    <>
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h2 className="profile__title popup__title">
              Вы хотите нанять специалиста Иван Петров для заказа «Создать дизайн лендинга»?
            </h2>
            <button
              style={{ marginBottom: 12 }}
              onClick={() => setHiringSuccessful(true)}
              className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit">
              Нанять
            </button>
            <button
              onClick={() => setIsPopupOpen(false)}
              className="form-profile__bottom-buttons">
              Отменить
            </button>
          </div>
        </div>
      )}
      {hiringSuccessful && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popupCheckMark" />
            <h2
              className="profile__title popup__title"
              style={{ marginBottom: 16 }}>
              Вы успешно наняли специалиста Иван Петров для заказа «Создать дизайн лендинга».
            </h2>
            <p
              className="profile__main-text  popup__main-text"
              style={{ marginBottom: 40 }}>
              Свяжитесь с ним, чтобы обсудить детали проекта. Контактные данные вы можете найти в профиле
            </p>
            <button
              onClick={() => {setIsPopupOpen(false); setHiringSuccessful(false)}}
              className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
              style={{ marginBottom: 50 }}>
              Посмотреть профиль
            </button>
          </div>
        </div>
      )}

      <section className="profile">

        <div className="profile_left-column">

          <div className="profile_block profile__user-info">
            <div className="profile__avatar"></div>
            <h2 className="profile__title">Иван&nbsp;Петров</h2>
            <p className="profile__main-text profile__specialization">UX/UI дизайнер</p>
          </div>

          <div className="profile_block profile__left-column-info">
            <div>
              <h2 className="profile__title">Ставка за час</h2>
              <p className="profile__main-text profile__info-main-text">150 р/час</p>
            </div>
            <div>
              <h2 className="profile__title">Портфолио</h2>
              <p className="profile__main-text profile__info-main-text">example.com</p>
            </div>
            <div>
              <h2 className="profile__title">Навыки</h2>
              <p className="profile__main-text profile__info-main-text">HTML, CSS, JavaScript, Figma, MongoDB</p>
            </div>
            <div>
              <h2 className="profile__title">Образование</h2>
              <p className="profile__main-text profile__info-main-text">МГУ им. М.В. Ломоносова</p>
            </div>
          </div>

          <button
            onClick={() => setIsPopupOpen(true)}
            className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit">
            Нанять
          </button>

        </div>

        <div className="profile_block profile_right-column">

          <div className="form-profile__input-container">
            <h1 className="profile__title">UX/UI дизайнер</h1>
            <p className="profile__main-text">
              Я - дизайнер с огромным опытом и страстью к творчеству. Моя работа - это создание уникальных
              и стильных дизайн-проектов, которые придают пространству характер и уют. Моя цель - не просто
              удовлетворить ваши ожидания, но и превзойти их, чтобы ваш дом стал истинным отражением вашей
              индивидуальности. Давайте вместе сделаем ваш интерьер неповторимым!
              Я также стремлюсь к тому, чтобы мой дизайн не только выглядел прекрасно, но и был функциональным,
              учитывая ваши потребности и образ жизни. Мой подход к работе основан на внимательном
              прослушивании ваших пожеланий и вдохновении вашей уникальной историей. Вместе мы создадим
              пространство, которое будет радовать вас каждый день и отражать вашу индивидуальность.
            </p>
          </div>

          <div className="profile__separate-line"></div>

          <div className="form-profile__input-container">
            <h3 className="profile__main-text">Портфолио</h3>
            <div className="profile__file-container">
              <div className="profile__file"></div>
              <div className="profile__file"></div>
            </div>
          </div>

          <div className="profile__separate-line"></div>

          <div className="form-profile__input-container">
            <h3 className="profile__main-text">Дипломы и сертификаты</h3>
            <div className="profile__file-container">
              <div className="profile__file"></div>
              <div className="profile__file"></div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

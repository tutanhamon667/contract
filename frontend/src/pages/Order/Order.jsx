import React, { useState, useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Context } from '../../context/context';
import * as Api from '../../utils/Api';
import { industryAndCategoryOptions } from '../../utils/constants';
import { InputDocument } from '../../components/InputComponents/InputDocument/InputDocument';
import { Button } from '../../components/Button/Button';
import { InputMultipleSelect } from '../../components/InputComponents/InputMultipleSelect/InputMultipleSelect';
import { InputTags } from '../../components/InputComponents/InputTags/InputTags';
import '../../components/FormComponents/CreateTaskForm/CreateTaskForm.css';
import '../ForgotPass/ForgotPass.css';
import '../Profiles/ProfileFreelancerViewOnly/ProfileFreelancerViewOnly.css';
import '../Profiles/ProfileFreelancer/ProfileFreelancer.css';
import '../Profiles/Profile.css';
import './Order.css';

function Order() {
  const [responded, setResponded] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const { currentUser } = useContext(Context);
  const [stacksValues, setStacksValues] = useState([]);
  const [activityValues, setActivityValues] = useState([]);
  let { id } = useParams();
  const [order, setOrder] = useState({});
  const [document, setDocument] = useState(null);

  useEffect(() => {
    Api.getTaskById(id)
      .then((result) => {
        setOrder(result);
      })
      .catch(console.error);
  }, []);

  // Стили
  const freelancerButtonStyle = `form-profile__bottom-buttons form-profile__bottom-buttons_type_submit${
    responded ? ' form-profile__bottom-buttons-hide' : ''
  }`;
  const customerButtonStyle = `form-profile__bottom-buttons${
    isEditable ? ' form-profile__bottom-buttons-hide' : ''
  }`;
  // Получаю данные заказа
  // const tasks = JSON.parse(localStorage.getItem('taskValues'));
  // const task = tasks?.find((item) => String(item?.id) === id);
  // Записываю значения в переменные
  const stacksList = order?.stack?.map((item, index) => (
    <li key={index} className="order__list-item">
      {item?.name}
    </li>
  ));
  // -----------

  function addDocument(items) {
    setDocument(items);
  }

  return (
    (currentUser.is_worker || currentUser?.id === order?.client?.id) && (
      <>
        <Helmet>
          <title>{order?.title || 'Задача'} • Таски</title>
        </Helmet>

        <section className="profile order">
          <Link to=".." className="order__back-container">
            <div className="order__back" />
            Назад
          </Link>

          <div className="order_block">
            <div className="profile_block profile_right-column left-column">
              {isEditable ? (
                <form className="form-profile">
                  <h1 className="profile__title">Редактирование заказа</h1>

                  <div className="form-profile__input-container">
                    <label className="profile__main-text" htmlFor="name">
                      Название
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Александр"
                      className="profile__main-text form-profile__input"
                      value="Создать дизайн лендинга"
                    />
                  </div>

                  <div className="form-profile__input-container">
                    <label className="profile__main-text" htmlFor="name">
                      Описание
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      cols="30"
                      rows="10"
                      className="profile__main-text form-profile__input"
                      value="Ищу веб дизайнера (веб-дизайнера-верстальщика), чтобы сделать дизайн и верстку
                  в Figma страницы сайта ИТ тематики. Нужна десктоп и мобильная версия, можно сдать последовательно.

                    Разработать дизайн лендинга для продвижения нового продукта/услуги.
                    Следовать брендбуку компании (цвета, шрифты и т.д.).
                    Создать адаптивный дизайн, который будет хорошо выглядеть на всех устройствах (десктоп, таблет,
                     смартфон).
                    Интеграция с формами для сбора контактной информации, подписки на новости и т.д.a

                  ТЗ предоставляю в виде:
                  Прототип в Фигме, примеры страниц с нужным стилем дизайна и созвон в Zoom для уточнения ТЗ.
                  Потребуется немного вникнуть в специфику услуг и целевой аудитории. Готов рассказать подробнее
                   при созвоне.
                  Результат нужен в Figma, чтобы передать веб-разработчику.
                  Сроки: Прототип готов.
                  Созвониться готов сегодня до конца дня или завтра вечером. Макет нужен оперативно до конца
                   дня понедельника 18 сентября 2023. Прошу в отклике указать стоимость и прислать 1 – 3 примеров
                    ваших работ, наиболее релевантных ТЗ (ссылку или вложением, например PDF).
                  И указать, есть ли у вас опыт дизайна для ИТ или для B2B тематики. Предпочтение дизайнерам с опытом
                  веб-дизайна сайтов/лендингов для ИТ или для B2B тематики. Рассматриваю исключительно самостоятельных
                  специалистов дизайнеров, не студии, не агентства.
                  Бюджет готов обсудить. Ориентируюсь на примерно 15 000р."
                    />
                  </div>

                  <div className="form-profile__input-container">
                    <h2 className="profile__main-text">Специализация</h2>
                    <InputMultipleSelect setActivityValues={setActivityValues} />
                  </div>

                  <div className="form-profile__input-container">
                    <h2 className="profile__main-text">Навыки</h2>
                    <InputTags setStacksValues={setStacksValues} />
                  </div>

                  <div className="form-profile__input-container">
                    <label className="profile__main-text" htmlFor="workingRate">
                      Бюджет
                    </label>
                    <input
                      type="text"
                      name="workingRate"
                      id="workingRate"
                      placeholder="5000"
                      className="profile__main-text form-profile__input form-profile__rate-input"
                    />
                    {/* переиспользуемый компонент с FormComponents/FreelancerCompleteForm */}
                    <label className="freelancer-complete-form__input-radio-text">
                      <input
                        type="radio"
                        className="freelancer-complete-form__input-radio"
                        name="contact-prefer"
                      />
                      Жду предложений от фрилансеров
                    </label>
                    {/* --------------------------------------------- */}
                  </div>

                  <div className="form-profile__input-container">
                    <label className="profile__main-text" htmlFor="projectTimeline">
                      Сроки
                    </label>
                    <input
                      type="month"
                      name="projectTimeline"
                      id="projectTimeline"
                      placeholder="Дедлайн задачи"
                      className="profile__main-text form-profile__input form-profile__dates_input"
                    />
                    {/* переиспользуемый компонент с FormComponents/FreelancerCompleteForm */}
                    <label className="freelancer-complete-form__input-radio-text">
                      <input
                        type="radio"
                        className="freelancer-complete-form__input-radio"
                        name="contact-prefer"
                      />
                      Жду предложений от фрилансеров
                    </label>
                    {/* --------------------------------------------- */}
                  </div>

                  <div className="form-profile__bottom-buttons-container">
                    <button
                      type="button"
                      className="profile__main-text form-profile__bottom-buttons"
                      onClick={() => setIsEditable(false)}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      onClick={() => setIsEditable(false)}
                      className="profile__main-text form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
                    >
                      Сохранить
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="form-profile__input-container">
                    <h1 className="profile__title">{order?.title}</h1>
                    <p className="profile__main-text">{order?.description}</p>
                    <ul className="order__list">{stacksList}</ul>
                  </div>

                  <div className="form-profile__input-container">
                    <h3 className="profile__title">Файлы</h3>
                    <div className="profile__file-container">
                      <InputDocument
                        name="portfolio"
                        value={order?.job_files || ''}
                        // error={errors.portfolio}
                        // errorMessage={errors.portfolio}
                        onChange={addDocument}
                        isDisabled={true}
                        // onChange={(event) => handleDocPortfolioChange(event, key)} key={key}
                        // onDeleteDocClick={() => onDeleteDocPortfolioClick(key)}
                      />
                      {/*<div className="profile__file" />*/}
                      {/*<div className="profile__file" />*/}
                    </div>
                  </div>

                  {currentUser?.is_worker && (
                    <div className="form-profile__input-container">
                      <h3 className="profile__title">О заказчике</h3>
                      <div className="order__customer-container">
                        <img
                          src={order?.client?.photo}
                          alt="Фото заказчика"
                          className="order__client-logo"
                        />
                        <div>
                          <p className="profile__main-text">{order?.client?.name}</p>
                          <div className="order__customer-container">
                            <p className="profile__main-text order__client-text">
                              {order?.client?.web}
                            </p>
                            <p className="profile__main-text order__client-text">
                              {
                                industryAndCategoryOptions.find(
                                  (option) => option?.value === order?.client?.industry?.name,
                                )?.label
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="profile__main-text">{order?.client?.about}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="profile_left-column">
              {currentUser?.is_worker ? (
                <Button
                  type="button"
                  text={!order.is_responded ? 'Откликнуться' : 'Просмотреть отклик'}
                  width={289}
                  className={freelancerButtonStyle}
                  onClick={() => setResponded(true)}
                />
              ) : (
                <>
                  <Button
                    type="button"
                    text="Отклики"
                    width={289}
                    className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
                  />
                  <Button
                    type="button"
                    text="Редактировать заказ"
                    width={289}
                    buttonSecondary={true}
                    className={customerButtonStyle}
                    // onClick={() => setIsEditable(true)}
                  />
                  <Button
                    type="button"
                    text="Удалить заказ"
                    width={289}
                    buttonSecondary={true}
                    onClick={() => setIsPopupOpen(true)}
                    className="form-profile__bottom-buttons"
                  />
                </>
              )}

              {!isEditable && (
                <div className="profile_block profile__left-column-info">
                  <div>
                    <h2 className="profile__title">Дата публикации</h2>
                    <p className="profile__main-text profile__info-main-text">
                      {new Date(order?.pub_date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <h2 className="profile__title">Специализация</h2>
                    <p className="profile__main-text profile__info-main-text">
                      {
                        industryAndCategoryOptions.find(
                          (option) => order?.category && option?.value === order?.category[0],
                        )?.label
                      }
                    </p>
                  </div>
                  <div>
                    <h2 className="profile__title">Навыки</h2>
                    <p className="profile__main-text profile__info-main-text">
                      {/*{stacksList2}*/}
                      {order?.stack?.map((item) => item?.name).join(', ')}
                    </p>
                  </div>
                  <div>
                    <h2 className="profile__title">Бюджет</h2>
                    <p className="profile__main-text profile__info-main-text">
                      {order?.ask_budget ? 'Ожидает предложений' : `${order?.budget} ₽`}
                    </p>
                  </div>
                  <div>
                    <h2 className="profile__title">Срок</h2>
                    <p className="profile__main-text profile__info-main-text">
                      {order?.ask_deadline
                        ? 'По договоренности'
                        : new Date(order?.deadline).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {isPopupOpen && (
          <div className="popup-overlay">
            <div className="popup">
              <h2 className="popup-title">Вы действительно хотите удалить заказ?</h2>
              <p className="popup-description">Отменить это действие будет невозможно</p>
              <button
                type="button"
                style={{ marginBottom: 12 }}
                onClick={() => setIsPopupOpen(false)}
                className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
              >
                Удалить
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
      </>
    )
  );
}

export { Order };

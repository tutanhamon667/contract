import React, { useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Context } from '../../context/context';
import { order } from '../../utils/order';
import { InputMultipleSelect } from '../../components/Inputs/InputMultipleSelect/InputMultipleSelect';
import { InputTags } from '../../components/Inputs/InputTags/InputTags';
import '../../components/Forms/CreateTaskForm/CreateTaskForm.css';
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

  // Стили
  const userIsCustomer = currentUser.is_customer;

  const freelancerBtnStyle = `form-profile__bottom-buttons form-profile__bottom-buttons_type_submit${
    responded ? ' form-profile__bottom-buttons-hide' : ''
  }`;
  const customerBtnStyle = `form-profile__bottom-buttons${
    isEditable ? ' form-profile__bottom-buttons-hide' : ''
  }`;
  // Получаю данные заказа
  let { id } = useParams();
  // const tasks = JSON.parse(localStorage.getItem('taskValues'));
  const tasks = order;
  const task = tasks.find((item) => String(item.id) === id);
  // console.log(task);
  // Записываю значения в переменные
  const stacksList = task.stack.map((item, index) => (
    <li key={index} className="order__list-item">
      {item}
    </li>
  ));
  const stacksList2 = task.stack?.join(', ');
  const specialization = task.direction?.join(', ');
  const budgetMoney = task.budget;
  const budgetDiscussion = task.budgetDiscussion?.toString();
  const { deadline } = task;
  const deadlineDiscussion = task.deadlineDiscussion?.toString();
  // -----------

  return (
    <>
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
                  {/* переиспользуемый компонент с Forms/FreelancerCompleteForm */}
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
                  {/* переиспользуемый компонент с Forms/FreelancerCompleteForm */}
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
                  <h1 className="profile__title">{task.task_name}</h1>
                  <p className="profile__main-text">{task.about}</p>
                  <ul className="order__list">{stacksList}</ul>
                </div>

                <div className="form-profile__input-container">
                  <h3 className="profile__title">Файлы</h3>
                  <div className="profile__file-container">
                    <div className="profile__file" />
                    <div className="profile__file" />
                  </div>
                </div>

                {!userIsCustomer && (
                  <div className="form-profile__input-container">
                    <h3 className="profile__title">О заказчике</h3>
                    <div className="order__customer-container">
                      <div className="order__client-logo" />
                      <div>
                        <p className="profile__main-text">AndyClass</p>
                        <div className="order__customer-container">
                          <p className="profile__main-text order__client-text">wwww.andyclass.ru</p>
                          <p className="profile__main-text order__client-text">Маркетинг</p>
                        </div>
                      </div>
                    </div>
                    <p className="profile__main-text">
                      AndyClass полноценное маркетинговое агентство с более чем 10-летним опытом на
                      рынке. Мы специализируемся на создании и реализации комплексных стратегий для
                      продвижения брендов и товаров в интернете и оффлайн. Наша команда
                      профессионалов охватывает все аспекты современного маркетинга: от SEO и
                      контент-маркетинга до проведения рекламных кампаний и анализа данных. Мы
                      стремимся предоставлять нашим клиентам высококачественные и результативные
                      решения для достижения их бизнес-целей.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="profile_left-column">
            {!userIsCustomer ? (
              <button
                type="button"
                className={freelancerBtnStyle}
                onClick={() => setResponded(true)}
              >
                Откликнуться
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
                >
                  Отклики
                </button>
                <button
                  type="button"
                  className={customerBtnStyle}
                  onClick={() => setIsEditable(true)}
                >
                  Редактировать заказ
                </button>
                <button
                  type="button"
                  onClick={() => setIsPopupOpen(true)}
                  className="form-profile__bottom-buttons"
                >
                  Удалить заказ
                </button>
              </>
            )}

            {!isEditable && (
              <div className="profile_block profile__left-column-info">
                <div>
                  <h2 className="profile__title">Дата публикации</h2>
                  <p className="profile__main-text profile__info-main-text">
                    {task.orderCreationDate}
                  </p>
                </div>
                <div>
                  <h2 className="profile__title">Специализация</h2>
                  <p className="profile__main-text profile__info-main-text">{specialization}</p>
                </div>
                <div>
                  <h2 className="profile__title">Навыки</h2>
                  <p className="profile__main-text profile__info-main-text">{stacksList2}</p>
                </div>
                <div>
                  <h2 className="profile__title">Бюджет</h2>
                  <p className="profile__main-text profile__info-main-text">
                    {budgetMoney}, ожидает предложений: {budgetDiscussion}
                  </p>
                </div>
                <div>
                  <h2 className="profile__title">Срок</h2>
                  <p className="profile__main-text profile__info-main-text">
                    {deadline}, по договорённости: {deadlineDiscussion}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export { Order };

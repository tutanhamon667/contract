import React, { useState } from "react";
import { Link } from "react-router-dom"
import "./Order.css";
import "../Profiles/Profile.css";
import "../Profiles/ProfileFreelancer/ProfileFreelancer.css";
import "../Profiles/ProfileFreelancerViewOnly/ProfileFreelancerViewOnly.css";

export default function Order() {
  const [responded, setResponded] = useState(false);

  return (
    <section className="profile order">

      <Link className="order__back-container">
        <div className="order__back"></div>
        Назад
      </Link>

      <div className="order_block">

        <div className="profile_block profile_right-column">

          <div className="form-profile__input-container">
            <h1 className="profile__title">Создать дизайн лендинга</h1>
            <p className="profile__main-text">
              Ищу веб дизайнера (веб-дизайнера-верстальщика), чтобы сделать дизайн и верстку
              в Figma страницы сайта ИТ тематики. Нужна десктоп и мобильная версия, можно сдать последовательно. <br />
              <ul>
                <li>Разработать дизайн лендинга для продвижения нового продукта/услуги.</li>
                <li>Следовать брендбуку компании (цвета, шрифты и т.д.).</li>
                <li>Создать адаптивный дизайн, который будет хорошо выглядеть на всех устройствах (десктоп, таблет, смартфон).</li>
                <li>Интеграция с формами для сбора контактной информации, подписки на новости и т.д.a </li>
              </ul>
              ТЗ предоставляю в виде: <br />
              Прототип в Фигме, примеры страниц с нужным стилем дизайна и созвон в Zoom для уточнения ТЗ.
              Потребуется немного вникнуть в специфику услуг и целевой аудитории. Готов рассказать подробнее при созвоне.
              Результат нужен в Figma, чтобы передать веб-разработчику. <br /><br />
              Сроки: Прототип готов. <br />
              Созвониться готов сегодня до конца дня или завтра вечером. Макет нужен оперативно до конца дня понедельника
              18 сентября 2023.Прошу в отклике указать стоимость и прислать 1 – 3 примеров ваших работ, наиболее
              релевантных ТЗ (ссылку или вложением, например PDF).
              И указать, есть ли у вас опыт дизайна для ИТ или для B2B тематики. Предпочтение дизайнерам с опытом
              веб-дизайна сайтов/лендингов для ИТ или для B2B тематики. Рассматриваю исключительно самостоятельных
              специалистов дизайнеров, не студии, не агентства. <br /><br />
              Бюджет готов обсудить. Ориентируюсь на примерно 15 000р.
            </p>

            <ul className="order__list">
              <li className="order__list-item">Дизайн</li>
              <li className="order__list-item">Web</li>
              <li className="order__list-item">Figma</li>
              <li className="order__list-item">Adobe</li>
            </ul>
          </div>

          <div className="form-profile__input-container">
            <h3 className="profile__title">Файлы</h3>
            <div className="profile__file-container">
              <div className="profile__file"></div>
              <div className="profile__file"></div>
            </div>
          </div>

          <div className="form-profile__input-container">
            <h3 className="profile__title">О заказчике</h3>
            <div className="order__customer-container">
              <div className="order__client-logo"></div>
              <div>
                <p className="profile__main-text">AndyClass</p>
                <div className="order__customer-container">
                  <p className="profile__main-text order__client-text">wwww.andyclass.ru</p>
                  <p className="profile__main-text order__client-text">Маркетинг</p>
                </div>
              </div>
            </div>
            <p className="profile__main-text">
              AndyClass полноценное маркетинговое агентство с более чем 10-летним опытом на рынке.
              Мы специализируемся на создании и реализации комплексных стратегий для продвижения брендов
              и товаров в интернете и оффлайн. Наша команда профессионалов охватывает все аспекты современного маркетинга: от SEO и контент-маркетинга до проведения рекламных кампаний и анализа данных.
              Мы стремимся предоставлять нашим клиентам высококачественные и результативные решения для достижения их бизнес-целей.
            </p>
          </div>

        </div>

        <div className="profile_left-column">

          {!responded && (
            <button
              className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
              onClick={() => setResponded(true)}>
              Откликнуться
            </button>
          )}

          <div className="profile_block profile__left-column-info">
            <div>
              <h2 className="profile__title">Дата публикации</h2>
              <p className="profile__main-text profile__info-main-text">14.09.2023</p>
            </div>
            <div>
              <h2 className="profile__title">Специализация</h2>
              <p className="profile__main-text profile__info-main-text">Дизайн</p>
            </div>
            <div>
              <h2 className="profile__title">Навыки</h2>
              <p className="profile__main-text profile__info-main-text">UX, UI, Figma, Adobe, Web design</p>
            </div>
            <div>
              <h2 className="profile__title">Бюджет</h2>
              <p className="profile__main-text profile__info-main-text">Ожидает предложений</p>
            </div>
            <div>
              <h2 className="profile__title">Срок</h2>
              <p className="profile__main-text profile__info-main-text">По договорённости</p>
            </div>
          </div>

        </div>

      </div>

    </section>
  )
}

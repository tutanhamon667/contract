import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import useFormAndValidation from "../../hooks/useFormAndValidation";
import { Context } from "../../context/context"
import TagsInput from "../TagsInput/TagsInput";
import "../FreelancerAccount/FreelancerAccount.css";

export default function FreelancerAccount() {
  // открывает форму редактирования имейла
  const [updateEmail, setUpdateEmail] = useState(false);
  // открывает форму редактирования пароля
  const [updatePassword, setUpdatePassword] = useState(false);
  const {updateUser, currentUser} = useContext(Context);
  // кастомный хук для валидации формы
  const { values, errors, isValid, handleChange, setValues } = useFormAndValidation();

  // function handleSubmitEmail(e) {
  //   e.preventDefault()
  //   if (!isValid) return
  //   updateUser(values)
  //   setValues({ ...values, email: '' })
  // }

  // function closeEmailChange() {
  //   setUpdateEmail(false)
  //   setValues({ ...values, email: '' })
  // }

  function handleSubmit(e) {
    e.preventDefault()
  }

  return (
    <div className="accountF">

      <div className="accountF_left-column">

        <div className="accountF__short-info">
          <div className="account__avatar"></div>
          <h2 className="accountF__title">Имя&nbsp;Фамилия</h2>
          <p className="accountF__specialty">специальность</p>
        </div>

        <div className="accountF__setting-container">
          <Link className="accountF__setting" to="#">Настройки</Link>
          <div className="accountF__separate-line"></div>
          <Link className="accountF__title" to="#">Информация</Link>
        </div>

      </div>

      <div className="accountF__form-container">

        <form className="form-profile" onSubmit={handleSubmit}>

          <div className="form-profile__top-container">
            <h2 className="accountF__title">Информация об аккаунте</h2>
            <button className="accountF__subtitle form-profile__cansel">Отмена</button>
            <button type="submit" className="accountF__subtitle form-profile__save">Сохранить</button>
            {/* <button className="accountF__subtitle">Редактировать</button> */}
          </div>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="email">Электронная почта</label>
            <input type="email" name="email" id="email" placeholder="Эл. почта" className="form-profile__input" />
            <div>
              <input type="checkbox" name="notifyOfNewOrders" id="notifyOfNewOrders" />
              <label className="accountF__subtitle form-profile__notify" htmlFor="notifyOfNewOrders">Уведомлять о новых заказах</label>
            </div>
          </div>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="phone">Номер телефона</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              maxLength="12"
              placeholder="+7 000 000 00 00"
              className="form-profile__input"
            />
          </div>

          <div className="accountF__separate-line"></div>

          <h2 className="accountF__title">Информация о профиле</h2>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="firstName">Имя Фамилия</label>
            <input type="text" name="firstName" id="firstName" placeholder="Имя" className="form-profile__input" />
            <input type="text" name="lastName" id="lastName" placeholder="Фамилия" className="form-profile__input" />
          </div>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="specialization">Специализация</label>
            <select name="specialization" id="specialization" size="1" placeholder="Выберите из списка" className="form-profile__specialization">
              <option value="design" className="form-profile__specialization">Дизайн</option>
              <option value="development" className="form-profile__specialization">Разработка</option>
              <option value="testing" className="form-profile__specialization">Тестирование</option>
              <option value="administration" className="form-profile__specialization">Администрирование</option>
              <option value="marketing" className="form-profile__specialization">Маркетинг</option>
              <option value="content" className="form-profile__specialization">Контент</option>
              <option value="other" className="form-profile__specialization">Разное</option>
            </select>
          </div>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="skills">Навыки</label>
            <TagsInput />
          </div>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="workingRate">Ставка в час</label>
            <input type="number" name="workingRate" id="workingRate" className="form-profile__input" />
          </div>

          <div className="form-profile__input-container">
            <h2 className="accountF__subtitle">Образование</h2>
            <input type="text" name="education" id="education" className="form-profile__input" />
            <input type="date" name="beginningOfStudies" id="beginningOfStudies" className="form-profile__input" />
            <input type="date" name="endOfStudies" id="endOfStudies" className="form-profile__input" />
            <select name="degree" id="degree" className="form-profile__specialization">
              <option value="bachelor" className="form-profile__specialization">Студент</option>
              <option value="bachelor" className="form-profile__specialization">Бакалавр</option>
              <option value="specialist" className="form-profile__specialization">Специалист</option>
              <option value="master" className="form-profile__specialization">Магистр</option>
            </select>
            <input type="text" name="faculty" id="faculty" className="form-profile__input" />
          </div>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="aboutMe">О себе</label>
            <textarea name="aboutMe" id="aboutMe" cols="30" rows="10" className="form-profile__input"></textarea>
          </div>

          <div className="accountF__separate-line"></div>

          <h2 className="accountF__title">Контакты</h2>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="emailForContacts">Электронная почта</label>
            <input type="emailForContacts" name="emailForContacts" id="email" className="form-profile__input" />
            <div>
              <input type="checkbox" name="preferredEmail" id="preferredEmail" />
              <label className="accountF__subtitle" htmlFor="preferredEmail">Предпочтительный вид связи</label>
            </div>
          </div>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="telegram">Телеграм</label>
            <input type="text" name="telegram" id="telegram" className="form-profile__input" />
            <div>
              <input type="checkbox" name="preferredTelegram" id="preferredTelegram" />
              <label className="accountF__subtitle" htmlFor="preferredTelegram">Предпочтительный вид связи</label>
            </div>
          </div>

          <button type="button" className="form-profile__add-communication-type">
            Добавить другой вид связи +
          </button>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="portfolioLink">Ссылка на портфолио</label>
            <input type="url" name="portfolioLink" id="portfolioLink" className="form-profile__input" />
            <button className="accountF__subtitle">Добавить</button>
          </div>

          <div className="accountF__separate-line"></div>

          <div className="form-profile__input-container">
            <h2 className="accountF__title">Портфолио</h2>
            <div>
              <div></div>
              <div></div>
              <div></div>
              <div>
                <input type="file" name="" id="" />
              </div>
            </div>
          </div>

          <div>
            <button className="accountF__title">Отмена</button>
            <button type="submit" className="accountF__title">Сохранить</button>
          </div>

        </form>

      </div>
    </div>
  )
}
/*
    <div className="freelance-account">
      <h2>Account of freelancer</h2>
      <h3>Привет, {user.firstName} {user.lastName}!</h3>
      <p>----------------------------</p>
      <h3>{user.email}</h3>
      <button
        type="button"
        onClick={() => setUpdateEmail(true)}>
        Редактировать
      </button>
      {updateEmail && (
        <>
          <form
            name="email"
            noValidate
            onSubmit={handleSubmitEmail}
          >
            <label htmlFor="email">Введите новый email:</label>
            <input
              type="email"
              autoComplete="email"
              id="email"
              name="email"
              onInput={handleChange}
              value={values.email || ''}
            /> <br />
            <span>
              {!isValid && errors.email}
            </span> <br />
            <button type="submit">Сохранить</button>
            <button
              type="button"
              onClick={closeEmailChange}>
              Закрыть
            </button>
          </form>
        </>
      )}
      <p>----------------------------</p>
      <h3>Кошелёк</h3>
      <p>----------------------------</p>
      <p>Текущий пароль: {user.password}</p>
      <button
        type="button"
        onClick={() => setUpdatePassword(true)}>
        Изменить пароль
      </button>
      {updatePassword && (
        <form>
          <label>Текущий пароль</label>
          <input type="password" autoComplete="current-password" /><br />
          <label>Новый пароль</label>
          <input type="password" autoComplete="new-password" /><br />
          <label>Подтвердите новый пароль</label>
          <input type="password" autoComplete="new-password" /><br />
          <input
            type="radio"
          />
          <label>Показать пароль</label><br />
          <button>Сохранить</button>
          <button
            type="button"
            onClick={() => setUpdatePassword(false)}>
            Отменить
          </button>
        </form>
      )}
      <p>----------------------------</p>
      <h3>Список подписок</h3>
    </div>
    */

/*
Личный кабинет фрилансера имеется следующий вид:
-Сбоку блок со следующими элементами:
  -Информация;
  -Кошелёк;
  -Пароль и безопасность;
  -Уведомления о новых заказах;
---------------------------------
"Данный блок состоит из:
-E-mail

При нажатии на кнопку редактировать - можно менять информацию из этого блока.
В режиме редактирования также доступны 2 кнопки:
-Сохранить;
-Закрыть

При смене почты не производится выход из аккаунта"
---------------------------------
-смотри фичу "Кошелёк".
---------------------------------
"Содержание этой страницы - только кнопка ""Изменить пароль"".
При нажатии на кнопку открывается форма с тремя полями:
-Текущий пароль;
-Новый пароль;
-Новый пароль ещё раз;
-Под ними две кнопки ""Сохранить"" и ""Отменить"".
Ограничения на символы такие же как при регистрации.

При смене пароля не производится выход из аккаунта."
---------------------------------
"Данный блок состоит из:
Списка активных подписок с возможностью удаления подписки. При нажатии открывается
главная страница (фрилансер) с выбранными в данной подписке фильтрами (выдача происходит по новизне)"

*/

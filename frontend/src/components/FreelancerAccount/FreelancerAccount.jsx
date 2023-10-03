import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import useFormAndValidation from "../../hooks/useFormAndValidation";
import { Context } from "../../context/context"
// import { CurrentUser } from "../../context/context";
import InputTags from "../Inputs/InputTags/InputTags";
// import InputTagsOld from "../Inputs/InputTagsOld/InputTagsOld";
import InputSpecializationList from "../Inputs/InputSpecializationList/InputSpecializationList";
import "../FreelancerAccount/FreelancerAccount.css";
import { InputDoc } from "../Inputs/InputDoc/InputDoc";
import "../Forms/FreelancerCompleteForm/FreelancerCompleteForm.css"

export default function FreelancerAccount() {
  // открывает форму редактирования имейла
  const [updateEmail, setUpdateEmail] = useState(false);
  // открывает форму редактирования пароля
  const [updatePassword, setUpdatePassword] = useState(false);
  const [docKeysPortfolio, setDocKeysPortfolio] = useState([Date.now()]);
  const { updateUser, currentUser } = useContext(Context);
  // кастомный хук для валидации формы
  const { values, errors, isValid, handleChange, setValues } = useFormAndValidation();

  const MAX_ATTACHED_DOCS = 8;

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

  const handleDocPortfolioChange = (event) => {
    handleChange(event);
    if (event.currentTarget.files[0]) {
      setDocKeysPortfolio(prevKeys => [...prevKeys, Date.now()]);
    }
  };

  const onDeleteDocPortfolioClick = (key) => {
    setDocKeysPortfolio(prevKeys => prevKeys.filter(prevKey => prevKey !== key));
  }

  function handleSubmit(e) {
    e.preventDefault()
  }

  return (
    <div className="accountF">

      <div className="accountF_left-column">

        <div className="accountF__short-info">
          <div className="account__avatar"></div>
          <h2 className="accountF__title">Александр&nbsp;Бирюков</h2>
          <p className="accountF__specialty">Фрилансер</p>
        </div>

        <div className="accountF__setting-container">
          <Link className="accountF__setting" to="#">Настройки</Link>
          <div className="accountF__separate-line"></div>
          <Link className="accountF__subtitle" to="#">Информация</Link>
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
            <input
              type="email"
              name="email"
              id="email"
              placeholder="birukov@gmail.com"
              className="form-profile__input"
            />
            <input
              type="tel"
              name="phone"
              id="phone"
              maxLength="12"
              placeholder="+7"
              className="form-profile__input"
            />
          </div>


          <div className="accountF__separate-line"></div>

          <h2 className="accountF__title">Информация о профиле</h2>

          <div className="form-profile__input-container">
            <label
              className="accountF__subtitle"
              htmlFor="firstName">
              Имя Фамилия
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="Александр"
              className="form-profile__input"
            />
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Бирюков"
              className="form-profile__input"
            />
          </div>

          <div className="form-profile__input-container">
            <h2 className="accountF__subtitle">Специализация</h2>
            <InputSpecializationList />
          </div>

          <div className="form-profile__input-container">
            <h2 className="accountF__subtitle">Навыки</h2>
            <InputTags />
          </div>

          <div className="form-profile__input-container">
            <label
              className="accountF__subtitle"
              htmlFor="workingRate">
              Ставка в час
            </label>
            <input
              type="text"
              name="workingRate"
              id="workingRate"
              placeholder="150"
              className="form-profile__input form-profile__rate-input"
            />
          </div>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="aboutMe">О себе</label>
            <textarea name="aboutMe" id="aboutMe" cols="30" rows="1" className="form-profile__input" placeholder="Расскажите о себе как о специалисте и чем вы можете быть полезны"></textarea>
          </div>

          <div className="form-profile__input-container">
            <h2 className="accountF__subtitle">Образование</h2>
            <input
              type="text"
              name="education"
              id="education"
              className="form-profile__input"
              placeholder="Университет"
            />
            <div className="form-profile__dates">
              <input type="month"
                name="beginningOfStudies"
                id="beginningOfStudies"
                placeholder="Начало учёбы"
                className="form-profile__input form-profile__input-dates"
              />
              <input type="month"
                name="endOfStudies"
                id="endOfStudies"
                placeholder="Окончание учёбы"
                className="form-profile__input form-profile__input-dates"
              />
            </div>
            <select
              name="degree"
              id="degree"
              className="form-profile__list"
            >
              <option value="" className="form-profile__list form-profile__list-default">Степень</option>
              <option value="bachelor" className="form-profile__list">Студент</option>
              <option value="bachelor" className="form-profile__list">Бакалавр</option>
              <option value="specialist" className="form-profile__list">Специалист</option>
              <option value="master" className="form-profile__list">Магистр</option>
            </select>
            <input type="text" name="faculty" id="faculty" className="form-profile__input" placeholder="Факультет" />
          </div>

          <div className="form-profile__input-container">
            <h2 className="accountF__subtitle">Сертификаты, грамоты, дипломы</h2>
            <div className="freelancer-complete-form__input-doc-wrapper">
              {docKeysPortfolio.slice(0, MAX_ATTACHED_DOCS).map((key) => (
                <InputDoc key={key} name="portfolio" value={values.portfolio || ''} error={errors.portfolio}
                  errorMessage={errors.portfolio}
                  onChange={(event) => handleDocPortfolioChange(event, key)}
                  onDeleteDocClick={() => onDeleteDocPortfolioClick(key)}
                />
              ))}
            </div>
          </div>


          <div className="accountF__separate-line"></div>

          <h2 className="accountF__title">Контакты</h2>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="emailForContacts">Электронная почта</label>
            <input type="emailForContacts" name="emailForContacts" id="email" className="form-profile__input" placeholder="Эл.почта" />
          </div>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="telegram">Телеграм</label>
            <input type="text" name="telegram" id="telegram" className="form-profile__input" placeholder="Телеграм" />
          </div>

          <div className="form-profile__input-container">
            <label className="accountF__subtitle" htmlFor="portfolioLink">Ссылка на портфолио</label>
            <input type="url" name="portfolioLink" id="portfolioLink" className="form-profile__input" placeholder="https://myportfolio.ru/" />
          </div>

          <div className="accountF__separate-line"></div>

          <div className="form-profile__input-container">
            <h2 className="accountF__title">Портфолио</h2>
            <div className="freelancer-complete-form__input-doc-wrapper">
              {docKeysPortfolio.slice(0, MAX_ATTACHED_DOCS).map((key) => (
                <InputDoc key={key} name="portfolio" value={values.portfolio || ''} error={errors.portfolio}
                  errorMessage={errors.portfolio}
                  onChange={(event) => handleDocPortfolioChange(event, key)}
                  onDeleteDocClick={() => onDeleteDocPortfolioClick(key)}
                />
              ))}
            </div>
          </div>

          <div className="form-profile__submit-container">
            <button className="form-profile__cansel-btn">Отмена</button>
            <button type="submit" className="form-profile__cansel-btn form-profile__submit-btn">Сохранить</button>
          </div>

        </form>

      </div>
    </div>
  )
}
/*
    <div className="freelance-account">
    <h2>Account of freelancer</h2>
    <h3>Привет, {user.first_name} {user.last_name}!</h3>
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

import "../FreelancerAccount/FreelancerAccount.css";
import { React, useState, useContext } from "react";
import useFormAndValidation from "../hooks/useFormAndValidation";
import { CurrentUser } from "../../context/context"

export default function FreelancerAccount({ updateUser }) {
  // открывает форму редактирования имейла
  const [updateEmail, setUpdateEmail] = useState(false);
  // открывает форму редактирования пароля
  const [updatePassword, setUpdatePassword] = useState(false);
  const user = useContext(CurrentUser);
  // кастомный хук для валидации формы
  const { values, errors, isValid, handleChange, setValues } = useFormAndValidation();

  function handleSubmitEmail(e) {
    e.preventDefault()
    if (!isValid) return
    updateUser(values)
    setValues({ ...values, email: '' })
  }

  function closeEmailChange() {
    setUpdateEmail(false)
    setValues({ ...values, email: '' })
  }

  return (
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
            <label for="email">Введите новый email:</label>
            <input
              type="email"
              autoComplete="off"
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
          <input type="password" /><br />
          <label>Новый пароль</label>
          <input type="password" /><br />
          <label>Подтвердите новый пароль</label>
          <input type="password" /><br />
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
  )
}

/*
Личный кабинет фрилансера имеется следующий вид:
-Сбоку блок с следующими элементами:
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
главная страница (фрилансер) с выбранными в данной подписке фильтрами(выдача происходит по новизне)"

*/
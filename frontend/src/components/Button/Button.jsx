import React from "react";
import "./Button.css";

// Всё это надо будет прокинуть(например text='Создать аккаунт' width={399} height={53})
// Чтобы изменять тему кнопки просто пишем в компоненте inheritTheme без значения
// Обязательно прокидываем тип кнопки (например type="submit" если это форма)
// ТАК КАК У НАС ПРОЕКТ БЕЗ TS - ПОДСКАЗКИ НЕ ВЫЛЕЗУТ, ВНИМАТЕЛЬНО СМОТРИТЕ, ЧТО ПРОКИДЫВАЕТЕ
// P.S Не стесняемся добавлять функционал, если что-то будет нужно
const Button = ({ text, width, height, inheritTheme, type, onClick }) => {
  return (
    <button
      className={`buttonActHov ${inheritTheme ? "buttonInherit" : "button"}`}
      style={{
        width,
        height,
      }}
      type={type}
      onClick={onClick}
    >
      <p className={`${inheritTheme ? "button__textBlack" : "button__text"}`}>
        {text}
      </p>
    </button>
  );
};

export default Button;

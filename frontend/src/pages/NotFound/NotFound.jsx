import React from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button"
import './NotFound.css'


const NotFound = () => {
  return (
    <div className="page">
      <div className="imgErr"/>
      <p className="titleErr">Страница не найдена.</p>
      <span className="descriptionErr"> Попробуйте вернуться назад или перейдите на главную.</span>
      <Link
        className="backLink"
        to="/"
      >
        <Button text='На главный экран' width={295} height={53} buttonSecondary />
      </Link>
    </div>
  );
};

export default NotFound;

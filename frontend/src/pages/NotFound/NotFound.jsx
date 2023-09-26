import React from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button"
import './NotFound.css'


const NotFound = () => {
  return (
    <div className="page">
      <h1 className="titleError">
        404
      </h1>
      <p className="descriptionError">Страница не найдена. Попробуйте вернуться назад или перейдите на главную.</p>
      <Link
        className="backLink"
        to="/"
      >
        <Button text='На главную' width={295} height={53} inheritTheme/>
      </Link>
    </div>
  );
};

export default NotFound;

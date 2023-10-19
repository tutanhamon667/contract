import React from 'react';
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button"
import './NotFound.css'

const NotFound = () => {
  return (
    <div className="notFoundPage">
      <h1 className="titleErr">404</h1>
      <p className="subtitleErr">Страница не найдена</p>
      <span className="descriptionErr">Попробуйте вернуться назад или перейдите на главную.</span>
      <Link className="backLink" to="/">
        <Button text='На главный экран' width={289} height={52} buttonSecondary />
      </Link>
    </div>
  );
};

export default NotFound;

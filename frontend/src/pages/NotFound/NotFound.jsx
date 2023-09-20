import React from "react";
import { Link } from "react-router-dom";
import './NotFound.css'


const NotFound = () => {
  return (
    <div className="page">
      <h1 className="title">
        Такой страницы не существует
      </h1>
      <Link
        className="backLink"
        to="/"
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;

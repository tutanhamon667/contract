import React from "react";
import { Link } from "react-router-dom";
import styles from './NotFound.module.css'


const NotFound = () => {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        Такой страницы не существует
      </h1>
      <Link
        className={styles.backLink}
        to="/"
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;

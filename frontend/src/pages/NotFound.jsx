import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{textAlign: "center" }}>
      <h1 style={{ color: "#000", fontSize: "32px" }}>
        Такой страницы не существует
      </h1>
      <Link
        style={{ color: "#000", fontSize: "24px" }}
        to="/"
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;

import React from "react";
import { Link } from "react-router-dom";
import vkIcon from "../../images/vk.svg";
import googleIcon from "../../images/google.svg";
import githubIcon from "../../images/github.svg";
import yandexIcon from "../../images/yandex.svg";
import "./LinkBar.css";

const LinkBar = () => {
  return (
    <div className="linkBar">
      <p className="linkBar__text">или</p>
      <nav className="linkBar__menu">
        <Link className="linkBar__item" to="#">
          <img src={vkIcon} alt="Vk" />
        </Link>
        <Link className="linkBar__item" to="#">
          <img src={googleIcon} alt="Google" />
        </Link>
        <Link className="linkBar__item" to="#">
          <img src={githubIcon} alt="GitHub" />
        </Link>
        <Link className="linkBar__item" to="#">
          <img src={yandexIcon} alt="Yandex" />
        </Link>
      </nav>
    </div>
  );
};

export default LinkBar;

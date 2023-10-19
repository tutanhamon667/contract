import React from "react";
import { Link } from "react-router-dom";
import "./SocialLinksBar.css";

const SocialLinksBar = () => {
  return (
    <div className="linkBar">
      <p className="linkBar__text">или</p>
      <nav className="linkBar__menu">
        <Link className="linkBar__item" to="#">
          <div className="linkBar__item__vk" />
        </Link>
        <Link className="linkBar__item" to="#">
          <div className="linkBar__item__google" />
        </Link>
        <Link className="linkBar__item" to="#">
          <div className="linkBar__item__github" />
        </Link>
        <Link className="linkBar__item" to="#">
          <div className="linkBar__item__yandex" />
        </Link>
      </nav>
    </div>
  );
};

export default SocialLinksBar;

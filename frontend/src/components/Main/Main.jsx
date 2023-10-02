import "./Main.css";
import React  from "react";
import StartWork from "../StartWork/StartWork";
import FreelanceOrder from "../FreelanceOrder/FreelanceOrder";
import { useLocation } from "react-router-dom";
import Header from "../Header/Header";

function Main() {
  const { pathname } = useLocation();


  return (
    <main className="content">
      <div className="content__image">
        {pathname === "/" && <Header />}
        <StartWork />
        <div className="content__image-decorate"></div>
        <div className="content__border"></div>
      </div>
      <div className="content__order-container">
        <FreelanceOrder />
      </div>
    </main>
  );
}

export default Main;

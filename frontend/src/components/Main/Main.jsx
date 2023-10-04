import "./Main.css";
import React from "react";
import StartWork from "../StartWork/StartWork";
import FreelanceOrder from "../FreelanceOrder/FreelanceOrder";

function Main() {

  return (
    <main className="content">
      <StartWork />
      <div className="content__image-decorate"></div>
      <div className="content__border"></div>
      <div className="content__order-container">
        <FreelanceOrder />
      </div>
    </main>
  );
}

export default Main;

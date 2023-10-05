import "./Main.css";
import React from "react";
import Marquee from "react-fast-marquee";
import StartWork from "../StartWork/StartWork";
import FreelanceOrder from "../FreelanceOrder/FreelanceOrder";

function Main() {
  return (
    <main className="content">
      <StartWork />
      <Marquee>
        <div className="content__image-decorate">//       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        </div>
      </Marquee>
      <div className="content__border"></div>
      <div className="content__order-container">
        <FreelanceOrder />
      </div>
    </main>
  );
}

export default Main;

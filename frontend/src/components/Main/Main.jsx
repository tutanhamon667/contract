import "./Main.css";
import React, { useContext } from "react";
import Marquee from "react-fast-marquee";
import StartWork from "../StartWork/StartWork";
import FreelanceOrder from "../FreelanceOrder/FreelanceOrder";
import { Context } from "../../context/context";

function Main() {
  const { isAuthenticated } = useContext(Context);
  const contentBorderAuthorized = `content__border ${isAuthenticated ? 'content__border-authorized' : ''}`

  return (
    <main className="content">
      { !isAuthenticated &&
        <>
          <StartWork />
          <Marquee>
            <div className="content__image-decorate">//       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        //       контент       //       дизайн       //       разработка       //      тестирование       //        маркетинг        </div>
          </Marquee>
        </>
      }
      <div className={contentBorderAuthorized}></div>
      <div className="content__order-container">
        <FreelanceOrder />
      </div>
    </main>
  );
}

export default Main;

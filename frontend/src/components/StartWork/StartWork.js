import "./StartWork.css";
import React from "react";

function StartWork() {
  return (
    <section className="start-work">
      <h1 className="start-work__title">
        Творчество и профессионализм в одном месте!
      </h1>
      <div className="start-work__buttons-container">
        <button className="start-work__button start-work__button_freelance">Стать фрилансером</button>
        <button className="start-work__button start-work__button_order">Создать заказ</button>
      </div>
    </section>
  );
}

export default StartWork;

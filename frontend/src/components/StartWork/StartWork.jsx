import "./StartWork.css";
import React from "react";
import Button from "../Button/Button";
import { Link } from "react-router-dom";

function StartWork() {
  return (
    <section className="start-work">
      <h1 className="start-work__title">
        Творчество и профессионализм в одном месте!
      </h1>
      <div className="start-work__buttons-container">
        {/* <button className="start-work__button start-work__button_freelance">Стать фрилансером</button> */}
        <Link to='signin'>
          <Button text="Стать фрилансером" width={295} buttonSecondary />
        </Link>
        <Link to='signin'>
          <Button text="Создать заказ" width={295} buttonSecondary />
        </Link>
        {/* <button className="start-work__button start-work__button_order">Создать заказ</button> */}
      </div>
    </section>
  );
}

export default StartWork;

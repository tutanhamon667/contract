import React from "react";
import "./OrderCards.css";

const OrderCards = () => {
  return (
    <div className="orderCards">
      <div className="orderCard">
        <div className="orderCard__header-container">
          <div className="orderCard__title-container">
            <h3 className="orderCard__title">Создать дизайн лендинга</h3>
            <p className="orderCard__direction">UX/UI дизайнер</p>
          </div>
          <p className="orderCard__price">30 000 ₽</p>
        </div>
        <p className="orderCard__description">
          Нужен талантливый, профессиональный графический дизайнер для проектной
          постоянной работы, умеющий создавать уникальные и эксклюзивные
          дизайны...
        </p>
        <div className="orderCard__tag-container">
          <p className="orderCard__tag">Дизайн</p>
        </div>
      </div>
    </div>
  );
};

export default OrderCards;

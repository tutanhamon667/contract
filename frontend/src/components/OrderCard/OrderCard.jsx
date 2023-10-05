import React, { useContext } from "react";
import "./OrderCard.css";
import { Context } from "../../context/context";

const OrderCard = ({ cards, orderArea }) => {
  // eslint-disable-next-line array-callback-return
  const { currentUser, authenticated } = useContext(Context);
  return cards.map((item, index) => {
    return (
      <div key={index} className="orderCard">
        <div className="orderCard__header-container">
          <div className="orderCard__title-container">
            <h3 className="orderCard__title">{item.title}</h3>
            <p className="orderCard__direction">{item.direction}</p>
          </div>
          <p className="orderCard__price">{item.price}</p>
        </div>
        <p className="orderCard__description">{item.description}</p>
        <div className="orderCard__tag-container">
          {item.tag.map((tag, index) => {
            return <p key={index} className="orderCard__tag">{tag}</p>;
          })}
        </div>
        {orderArea && (
          <div className="orderCard__respond-button-container">
            {currentUser.role === "Фрилансер" && authenticated ? (
              <button className="orderCard__respond-button">
                Откликнуться
              </button>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
    );
  });
};

export default OrderCard;

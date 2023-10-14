import React, { useContext } from "react";
import "./OrderCard.css";
import { Context } from "../../context/context";

const OrderCard = ({ cards, orderArea }) => {
  // eslint-disable-next-line array-callback-return
  const { currentUser, authenticated } = useContext(Context);

  console.log(cards);
  return cards.map((item, index) => {
    return (
      <div key={index} className="orderCard">
        <div className="orderCard__header-container">
          <div className="orderCard__avatar-container">
            {item.avatar && (
              <svg
                className="orderCard__avatar"
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
              >
                <circle cx="24" cy="24" r="24" fill="#D9D9D9" />
              </svg>
            )}
            <div className="orderCard__title-container">
              <h3 className="orderCard__title">{item.title}</h3>
              <p className="orderCard__direction">{item.direction}</p>
            </div>
          </div>
          <p className="orderCard__price">{item.price}</p>
        </div>
        <p className="orderCard__description">{item.description}</p>
        <div className="orderCard__tag-container">
          {item.tag.map((tag, index) => {
            return (
              <p key={index} className="orderCard__tag">
                {tag}
              </p>
            );
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

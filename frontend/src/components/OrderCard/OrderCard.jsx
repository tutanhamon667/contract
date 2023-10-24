import React, { useContext, useEffect } from "react";
import { Link } from 'react-router-dom'
import "./OrderCard.css";
import { Context } from "../../context/context";

const OrderCard = ({ cards, orderArea, operationMode, freelanceFilter, isTasks }) => {
  // eslint-disable-next-line array-callback-return
  const { currentUser, authenticated } = useContext(Context);
  const filter = one();

  useEffect(() => {
    console.log("тут111111")
  }, [freelanceFilter])


  function one() {
    for (const key in freelanceFilter) {
      if (freelanceFilter[key]) {
        return false
      }
    }
    return true
  }

  return cards.map((item, index) => {
    // eslint-disable-next-line no-lone-blocks
    {
      return (freelanceFilter[`${item.direction}`] || !operationMode || filter) && (
        <Link to={isTasks ? `order/${item.orderId}` : ''}>
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
                  <h3 className="orderCard__title">{item.title || item.task_name}</h3>
                  {/* <p className="orderCard__direction">{item.direction || ''}</p> */}
                  <div className="orderCard__tag-container">
                    {item.direction.map((item, index) => {
                      return (
                        <p key={index} className="orderCard__direction">
                          {item}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="orderCard__price">{item.price || item.budget}</p>
            </div>
            <p className="orderCard__description">{item.description || item.about}</p>
            <div className="orderCard__tag-container">
              {item.stacks.map((tag, index) => {
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
        </Link>
      );
    }
  });
};
export default OrderCard;

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../../context/context';
import './OrderCard.css';

function OrderCard({ cards, orderArea, operationMode, isTasks }) {
  const { currentUser, isAuthenticated, freelanceFilter, rerender } = useContext(Context);

  function one() {
    for (const key in freelanceFilter) {
      if (freelanceFilter[key]) {
        return false;
      }
    }
    return true;
  }
console.log(cards)
  return (
    (rerender || !rerender) &&
    cards?.map(
      (item, index) =>
        (freelanceFilter[`${item.direction}`] || !operationMode || one()) && (
          <Link key={index} to={isTasks ? `order/${item.orderId}` : ''}>
            <div className="order-card">
              <div className="order-card__header-container">
                <div className="order-card__avatar-container">
                  {item.avatar && (
                    <svg
                      className="order-card__avatar"
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
                    <h3 className="order-card__title">{item.title || item.task_name}</h3>
                    <p className="order-card__direction">{item.direction[0] || ''}</p>
                    {/*<div className="order-card__tag-container">*/}
                    {/*  {item.direction.map((item, index) => {*/}
                    {/*    return (*/}
                    {/*      <p key={index} className="order-card__direction">*/}
                    {/*        {item}*/}
                    {/*      </p>*/}
                    {/*    );*/}
                    {/*  })}*/}
                    {/*</div>*/}
                  </div>
                </div>
                <p className="order-card__price">{item.price || item.budget}</p>
              </div>
              <p className="order-card__description">{item.description || item.about}</p>
              <div className="order-card__tag-container">
                {item.stacks.map((tag, index) => (
                  <p key={index} className="order-card__tag">
                    {tag}
                  </p>
                ))}
              </div>
              {orderArea && (
                <div className="order-card__respond-button-container">
                  {currentUser.is_worker && isAuthenticated ? (
                    <button type="button" className="order-card__respond-button">
                      Откликнуться
                    </button>
                  ) : (
                    ''
                  )}
                </div>
              )}
            </div>
          </Link>
        ),
    )
  );
}

export { OrderCard };

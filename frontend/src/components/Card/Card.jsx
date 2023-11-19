import React, { useContext } from 'react';
import { Context } from '../../context/context';
import { industryAndCategoryOptions } from '../../utils/constants';
import './Card.css';

function Card({ cards, isFirstTab }) {
  const { currentUser } = useContext(Context);

  // function one() {
  //   for (const key in freelanceFilter) {
  //     if (freelanceFilter[key]) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  return cards?.map(
    (item, index) => (
      // (freelanceFilter[`${item?.category}`] || !isFirstTab || one()) && (
      // {isAuthenticated && (
      //   <Link
      //   key={index}
      //   to={
      //     item.hasOwnProperty('is_responded')
      //       ? `order/${item?.id}`
      //       : `profile-freelancer/${item?.id}`
      //   }
      // >
      <div key={item?.id || index} className="order-card">
        <div className="order-card__header-container">
          <div className="order-card__avatar-container">
            {item?.user && (
              <div
                className="order-card__avatar"
                style={
                  (item?.avatar || item?.photo) && {
                    backgroundImage: `url('${item?.avatar || item?.photo}')`,
                  }
                }
              />
            )}
            <div className="orderCard__title-container">
              <h3 className="order-card__title">
                {item?.title || `${item?.user?.first_name} ${item?.user?.last_name}`}
              </h3>
              <p className="order-card__direction">
                {industryAndCategoryOptions
                  .find((option) => {
                    if (item?.category) return option?.value === item?.category[0];
                    if (item?.categories) return option?.value === item?.categories[0]?.name;
                  })
                  ?.label.toLowerCase()}
              </p>
            </div>
          </div>
          <div className="order-card__price-wrapper">
            <p className="order-card__price">
              {item?.budget || item?.payrate}
              {typeof item?.budget === 'number'
                ? ' ₽'
                : typeof item?.payrate === 'number'
                  ? ' ₽/час'
                  : ''}
            </p>
          </div>
        </div>
        <p className="order-card__description">{item?.description || item?.about}</p>
        <div className="order-card__tag-container">
          {(item?.stacks || item?.stack)?.map((tag, index) => (
            <p key={index} className="order-card__tag">
              {tag?.name}
            </p>
          ))}
        </div>
        {currentUser?.is_worker && isFirstTab && (
          <div className="order-card__respond-button-container">
            <button type="button" className="order-card__respond-button">
              Откликнуться
            </button>
          </div>
        )}
      </div>
      // </Link>
      // </div>
    ),
    // )
  );
}

export { Card };

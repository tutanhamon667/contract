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
    (data, index) => (
      // (freelanceFilter[`${data?.category}`] || !isFirstTab || one()) && (
      // {isAuthenticated && (
      //   <Link
      //   key={index}
      //   to={
      //     data.hasOwnProperty('is_responded')
      //       ? `order/${data?.id}`
      //       : `profile-freelancer/${data?.id}`
      //   }
      // >
      <div key={data?.id || index} className="order-card">
        <div className="order-card__header-container">
          <div className="order-card__avatar-container">
            {data?.user && (
              <div
                className="order-card__avatar"
                style={
                  (data?.avatar || data?.photo) && {
                    backgroundImage: `url('${data?.avatar || data?.photo}')`,
                  }
                }
              />
            )}
            <div className="orderCard__title-container">
              <h3 className="order-card__title">
                {data?.title || `${data?.user?.first_name} ${data?.user?.last_name}`}
              </h3>
              <p className="order-card__direction">
                {industryAndCategoryOptions
                  .find((option) => {
                    if (data?.category) return option?.value === data?.category[0];
                    if (data?.categories) return option?.value === data?.categories[0]?.name;
                  })
                  ?.label.toLowerCase()}
              </p>
            </div>
          </div>
          <div className="order-card__price-wrapper">
            <p className="order-card__price">
              {data?.budget || data?.payrate}
              {typeof data?.budget === 'number'
                ? ' ₽'
                : typeof data?.payrate === 'number'
                  ? ' ₽/час'
                  : ''}
            </p>
          </div>
        </div>
        <p className="order-card__description">{data?.description || data?.about}</p>
        <div className="order-card__tag-container">
          {(data?.stacks || data?.stack)?.map((tag, index) => (
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

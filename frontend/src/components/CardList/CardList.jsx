import React, { useContext } from 'react';
import { Context } from '../../context/context';
import { Card } from '../Card/Card';
import './CardList.css';

function CardList({
  firstTabData,
  firstTabNavigation,
  loadFirstTabPaginationData,
  secondTabData,
  secondTabNavigation,
  loadSecondTabPaginationData,
  isFirstTab
}) {
  const { isAuthenticated } = useContext(Context);

  function handleFirstTabPagination(e) {
    const value = e.target.value
    loadFirstTabPaginationData(firstTabNavigation[value])
    window.scrollTo({
      top: isAuthenticated ? 0 : 500,
      behavior: "smooth",
    })
  }

  function handleSecondTabPagination(e) {
    const value = e.target.value
    loadSecondTabPaginationData(secondTabNavigation[value])
    window.scrollTo({
      top: isAuthenticated ? 0 : 500,
      behavior: "smooth",
    })
  }

  if (firstTabData || secondTabData) {
    return (
      <div className="card-list">
        {isFirstTab ?
          <>
            <Card cards={firstTabData} isFirstTab={isFirstTab} />
            <div className={'card-list__navigation'}>
              {firstTabNavigation.previous &&
                <button
                  value={'previous'}
                  onClick={handleFirstTabPagination}
                  className={'card-list__button button button_type_secondary'}
                >
                  Предыдущая страница
                </button>}
              {firstTabNavigation.next &&
                <button
                  value={'next'}
                  onClick={handleFirstTabPagination}
                  className={'card-list__button button button_type_secondary'}
                >
                  Следующая страница
                </button>}
            </div>
          </> :
          <>
            <Card cards={secondTabData} isFirstTab={isFirstTab} />
            <div className={'card-list__navigation'}>
              {secondTabNavigation.previous &&
                <button
                  value={'previous'}
                  onClick={handleSecondTabPagination}
                  className={'card-list__button button button_type_secondary'}
                >
                  Предыдущая страница
                </button>}
              {secondTabNavigation.next &&
                <button
                  value={'next'}
                  onClick={handleSecondTabPagination}
                  className={'card-list__button button button_type_secondary'}
                >
                  Следующая страница
                </button>}
            </div>

          </>
        }
      </div>
    );
  }
}

export { CardList };

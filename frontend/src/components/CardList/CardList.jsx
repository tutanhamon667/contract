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
  const { currentUser } = useContext(Context);

  function handleFirstTabPagination(e) {
    const value = e.target.value
    loadFirstTabPaginationData(firstTabNavigation[value])
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
    console.log(firstTabNavigation[value])
  }

  function handleSecondTabPagination(e) {
    const value = e.target.value
    loadSecondTabPaginationData(secondTabNavigation[value])
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
    console.log(firstTabNavigation[value])
  }

  if (firstTabData || secondTabData) {
    return (
      <div className="card-list">
        {isFirstTab ?
          <>
            <Card cards={firstTabData} isFirstTab={isFirstTab} />
            {firstTabNavigation.next && <button value={'next'} onClick={handleFirstTabPagination}>Следующая страница</button>}
            {firstTabNavigation.previous && <button value={'previous'} onClick={handleFirstTabPagination}>Предыдущая страница</button>}
          </> :
          <>
            <Card cards={secondTabData} isFirstTab={isFirstTab} />
            {secondTabNavigation.next && <button value={'next'} onClick={handleSecondTabPagination}>Следующая страница</button>}
            {secondTabNavigation.previous && <button value={'previous'} onClick={handleSecondTabPagination}>Предыдущая страница</button>}
          </>
        }
      </div>
    );
  }
}

export { CardList };

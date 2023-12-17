import React, { useContext } from 'react';
import { Context } from '../../context/context';
import { Card } from '../Card/Card';
import './CardList.css';

function CardList({ tasks, freelancers, isFirstTab }) {
  const { currentUser } = useContext(Context);

  if (tasks || freelancers) {
    return (
      <div className="card-list">
        {isFirstTab ? (
          <Card cards={currentUser.is_customer ? freelancers : tasks} isFirstTab={isFirstTab} />
        ) : (
          <Card
            cards={
              Object.keys(currentUser).length === 0
                ? freelancers
                : currentUser.is_customer
                  ? tasks.filter((task) => task?.client?.id === currentUser?.id)
                  : tasks.filter((task) => task?.is_responded === true)
            }
            isFirstTab={isFirstTab}
          />
        )}
      </div>
    );
  }
}

export { CardList };

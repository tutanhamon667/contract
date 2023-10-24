import React, { useContext, useEffect, useState } from "react";
import "./OrderCards.css";
import { tasks } from "../../utils/tasks";
import { freelance } from "../../utils/freelance";
import { order } from "../../utils/order";
import OrderCard from "../OrderCard/OrderCard"
import { Context } from "../../context/context";

const OrderCards = ({ operationMode, freelanceFilter }) => {

  const { currentUser, authenticated } = useContext(Context);
  const [area2, setArea2] = useState(false);
  const { handleOrderFilter } = useContext(Context);
  // const area2 = currentUser.role === 'Фрилансер' && authenticated ? order : freelance;
  useEffect((() => {
    if (currentUser.role === 'Фрилансер' && !operationMode) {
      handleOrderFilter(true);
    } else {
      handleOrderFilter(false)
    }
    if (currentUser.role === 'Заказчик' && authenticated) {
      setArea2(false)
    } else {
      setArea2(true)
    }
  }), [currentUser, authenticated, operationMode, handleOrderFilter, freelanceFilter])


  const arrayOfTasks = JSON.parse(localStorage.getItem('taskValues'))

  return (
    <div className="orderCards">
      {operationMode
        ? <OrderCard
          cards={area2 ? tasks : freelance}
          orderArea={area2}
          operationMode={operationMode}
          freelanceFilter={freelanceFilter}
        />
        : <OrderCard
          cards={arrayOfTasks}
          freelanceFilter={freelanceFilter}
          isTasks={true}
        />}
    </div>
  );
};

export default OrderCards;

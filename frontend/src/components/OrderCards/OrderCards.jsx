import React, { useContext, useEffect, useState } from "react";
import { tasks } from "../../utils/tasks";
import { freelance } from "../../utils/freelance";
import OrderCard from "../OrderCard/OrderCard"
import { Context } from "../../context/context";
import "./OrderCards.css";

const OrderCards = ({ operationMode }) => {

  const { currentUser, isAuthenticated } = useContext(Context);
  const [area2, setArea2] = useState(false);
  const { handleOrderFilter } = useContext(Context);
  // const area2 = currentUser.role === 'Фрилансер' && authenticated ? order : freelance;
  useEffect((() => {
    // if (currentUser.role === 'Фрилансер' && !operationMode) {
    if (currentUser.is_worker && !operationMode) {
      handleOrderFilter(true);
    } else {
      handleOrderFilter(false);
    }
    // if (currentUser.role === 'Заказчик' && isAuthenticated ) {
    if (currentUser.is_customer && isAuthenticated ) {
      setArea2(false);
    } else {
      setArea2(true);
    }
  }), [currentUser, isAuthenticated, operationMode, handleOrderFilter])

  const arrayOfTasks = JSON.parse(localStorage.getItem('taskValues'));

  return (
    <div className="orderCards">
      {operationMode
        ? <OrderCard
          cards={area2 ? tasks : freelance}
          orderArea={area2}
          operationMode={operationMode}
        />
        : <OrderCard
          cards={arrayOfTasks}
          isTasks={true}
        />}
    </div>
  );
};

export default OrderCards;

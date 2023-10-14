import React, { useContext, useEffect, useState } from "react";
import "./OrderCards.css";
import { tasks } from "../../utils/tasks";
import { freelance } from "../../utils/freelance";
import { order } from "../../utils/order";
import OrderCard from "../OrderCard/OrderCard"
import { Context } from "../../context/context";

const OrderCards = ({ operationMode }) => {

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
    if (currentUser.role === 'Фрилансер' && authenticated ) return setArea2(true)
    setArea2(false)
  }), [currentUser, authenticated, operationMode])

  console.log(area2);


  return (
    <div className="orderCards">
      {operationMode ? <OrderCard cards={area2 ? tasks : freelance} orderArea={true}/> : <OrderCard   cards={order} /> }
    </div>
  );
};

export default OrderCards;

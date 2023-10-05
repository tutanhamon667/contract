import React from "react";
import "./OrderCards.css";
import { tasks } from "../../utils/tasks";
import { frelance } from "../../utils/frelance";
import OrderCard from "../OrderCard/OrderCard"

const OrderCards = ({ operationMode }) => {

  return (
    <div className="orderCards">
      {operationMode ? <OrderCard   cards={frelance}/> : <OrderCard   cards={tasks}/> }

    </div>
  );
};

export default OrderCards;

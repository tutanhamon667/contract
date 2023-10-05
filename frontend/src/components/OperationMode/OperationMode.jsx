import React from "react";
import { Context } from "../../context/context";
import { userCustomer, userFreelancer } from "../../utils/constants";
import "./OperationMode.css";

function OperationMode({ operationMode, setOperationMode }) {
  const {authenticated, currentUser} = React.useContext(Context)


  return (
    <section className="operation-mode">
      <button
        className={
          operationMode
            ? `operation-mode__button operation-mode__button_projects operation-mode__button_action`
            : `operation-mode__button operation-mode__button_projects`
        }
        onClick={() => setOperationMode(true)}
      >
        {!authenticated ? 'Фрилансеры' : (currentUser === userFreelancer ? 'Таски' : 'Фрилансеры')}
      </button>
      <button
        className={
          operationMode
            ? `operation-mode__button operation-mode__button_freelance`
            : `operation-mode__button operation-mode__button_freelance operation-mode__button_action`
        }
        onClick={() => setOperationMode(false)}
      >
        {!authenticated && 'Таски'}
        {authenticated && 'Мои заказы'}
      </button>
    </section>
  );
}

export default OperationMode;

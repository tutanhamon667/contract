import React, { useContext } from "react";
import "./OperationMode.css";
import { Context } from "../../context/context";

function OperationMode({ operationMode, setOperationMode }) {
  const { currentUser, authenticated } = useContext(Context);

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
        { currentUser.role === 'Заказчик' ? 'Фрилансеры' : 'Tаски'}

      </button>
      <button
        className={
          operationMode
            ? `operation-mode__button operation-mode__button_freelance`
            : `operation-mode__button operation-mode__button_freelance operation-mode__button_action`
        }
        onClick={() => setOperationMode(false)}
      >
        { authenticated ? 'Мои заказы' : 'Фрилансеры'}

      </button>
    </section>
  );
}

export default OperationMode;

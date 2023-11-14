import React, { useContext } from 'react';
import { Context } from '../../context/context';
import './OperationMode.css';

function OperationMode({ operationMode, setOperationMode }) {
  const { currentUser, isAuthenticated } = useContext(Context);

  return (
    <section className="operation-mode">
      <button
        type="button"
        className={
          operationMode
            ? 'operation-mode__button operation-mode__button_projects operation-mode__button_action'
            : 'operation-mode__button operation-mode__button_projects'
        }
        onClick={() => setOperationMode(true)}
      >
        {currentUser.is_customer ? 'Фрилансеры' : 'Tаски'}
      </button>
      <button
        type="button"
        className={
          operationMode
            ? `operation-mode__button operation-mode__button_freelance`
            : `operation-mode__button operation-mode__button_freelance operation-mode__button_action`
        }
        onClick={() => setOperationMode(false)}
      >
        {isAuthenticated ? 'Мои заказы' : 'Фрилансеры'}
      </button>
    </section>
  );
}

export { OperationMode };

import React, { useState } from "react";
import "./OperationMode.css";

function OperationMode() {
  const [operationMode, setOperationMode] = useState(true);

  const handleOperationMode = () => {
    setOperationMode(!operationMode);
  };

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
        Список проектов
      </button>
      <button
        className={
          operationMode
            ? `operation-mode__button operation-mode__button_freelance`
            : `operation-mode__button operation-mode__button_freelance operation-mode__button_action`
        }
        onClick={() => setOperationMode(false)}
      >
        Фрилансеры
      </button>
    </section>
  );
}

export default OperationMode;

import React, { useState } from "react";
import "./OperationMode.css";

function OperationMode({ operationMode, setOperationMode }) {



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
        Tаски
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

import "./FreelanceOrder.css";
import React, { useState } from "react";
import SearchMain from "../SearchMain/SearchMain";
import FilterSection from "../FilterSection/FilterSection";
import OrderCards from "../OrderCards/OrderCards";
import OperationMode from "../OperationMode/OperationMode";

function FreelanceOrder() {
  const [operationMode, setOperationMode] = useState(true);

  return (
    <section className="freelance-order">
      <div className="freelance-order__column-order">
        <OperationMode
          operationMode={operationMode}
          setOperationMode={setOperationMode}
        />
        <SearchMain />
        <OrderCards operationMode={operationMode}/>
      </div>
      <div className="freelance-order__column-filter">
        <FilterSection />
      </div>
    </section>
  );
}

export default FreelanceOrder;

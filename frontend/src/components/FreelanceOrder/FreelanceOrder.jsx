import "./FreelanceOrder.css";
import React, { useEffect, useState, useCallback } from "react";
import SearchMain from "../SearchMain/SearchMain";
import FilterSection from "../FilterSection/FilterSection";
import OrderCards from "../OrderCards/OrderCards";
import OperationMode from "../OperationMode/OperationMode";

function FreelanceOrder() {
  const [operationMode, setOperationMode] = useState(true);
  const [freelanceFilter, setFreelanceFilter] = useState([]);


  const handleFreelanceFilter = (filter) => {
    setFreelanceFilter(filter);
  }


  return (
    <section className="freelance-order">
      <div className="freelance-order__column-order">
        <OperationMode
          operationMode={operationMode}
          setOperationMode={setOperationMode}
        />
        <SearchMain />
        <OrderCards operationMode={operationMode}  freelanceFilter={freelanceFilter} />
      </div>
      <div className="freelance-order__column-filter">
        <FilterSection freelanceFilter={freelanceFilter} handleFreelanceFilter={handleFreelanceFilter}/>
      </div>
    </section>
  );
}

export default FreelanceOrder;

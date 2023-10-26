import "./FreelanceOrder.css";
import React, { useContext, useState } from 'react';
import SearchMain from "../SearchMain/SearchMain";
import FilterSection from "../FilterSection/FilterSection";
import OrderCards from "../OrderCards/OrderCards";
import OperationMode from "../OperationMode/OperationMode";
import { Context } from '../../context/context';

function FreelanceOrder() {
  const [operationMode, setOperationMode] = useState(true);
  const { setFreelanceFilter } = useContext(Context);

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
        <OrderCards operationMode={operationMode} />
      </div>
      <div className="freelance-order__column-filter">
        <FilterSection handleFreelanceFilter={handleFreelanceFilter} />
      </div>
    </section>
  );
}

export default FreelanceOrder;

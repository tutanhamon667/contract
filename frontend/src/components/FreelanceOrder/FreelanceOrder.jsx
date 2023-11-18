import React, { useContext, useState } from 'react';
import { Context } from '../../context/context';
import { SearchMain } from '../SearchMain/SearchMain';
import { FilterSection } from '../FilterSection/FilterSection';
import { OrderCards } from '../OrderCards/OrderCards';
import { OperationMode } from '../OperationMode/OperationMode';
import './FreelanceOrder.css';

function FreelanceOrder({freelancers}) {
  const [operationMode, setOperationMode] = useState(true);
  const { setFreelanceFilter } = useContext(Context);


  const handleFreelanceFilter = (filter) => {
    setFreelanceFilter(filter);
  };

  return (
    <section className="freelance-order">
      <div className="freelance-order__column-order">
        <OperationMode operationMode={operationMode} setOperationMode={setOperationMode} />
        <SearchMain />
        <OrderCards operationMode={operationMode} freelancers={freelancers} />
      </div>
      <div className="freelance-order__column-filter">
        <FilterSection handleFreelanceFilter={handleFreelanceFilter} />
      </div>
    </section>
  );
}

export { FreelanceOrder };

import "./FreelanceOrder.css";
import React from "react";
import SearchMain from "../SearchMain/SearchMain";
import FilterSection from "../FilterSection/FilterSection";
import OrderCards from "../OrderCards/OrderCards";

function FreelanceOrder() {
  return (
    <section className="freelance-order">
      <div className="freelance-order__column-order">
        <SearchMain />
        <OrderCards />
      </div>
      <div className="freelance-order__column-filter">
        <FilterSection />
      </div>
    </section>
  );
}

export default FreelanceOrder;

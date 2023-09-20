import "./FreelanceOrder.css";
import React from "react";
import SearchMain from "../SearchMain/SearchMain";
import FilterSection from "../FilterSection/FilterSection";

function FreelanceOrder() {
  return (
    <section className="freelance-order">
      <div className="freelance-order__column-order">
        <SearchMain />
      </div>
      <div className="freelance-order__column-filter">
        <FilterSection />
      </div>
    </section>
  );
}

export default FreelanceOrder;

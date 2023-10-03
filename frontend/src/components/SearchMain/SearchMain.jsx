import "./SearchMain.css";
import React from "react";

function SearchMain() {
  function handleFormSubmit(evt) {
    evt.preventDefault();
  }

  return (
    <section className="search">
      <form className="search__form" onSubmit={handleFormSubmit}>
        <div className="search__container">
          <button type="submit" className="search__button">
            <div className="search__search-image"></div>
          </button>
          <input
            className="search__input"
            placeholder="Поиск задач и проектов по навыкам, ключевым словам, технологиям..."
            minLength="2"
            maxLength="30"
            type="text"
            required
          />
        </div>
      </form>
    </section>
  );
}

export default SearchMain;

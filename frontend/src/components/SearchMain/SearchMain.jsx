import "./SearchMain.css";
import React from "react";
import searchBtn from "../../images/magnifyingGlass.svg"

function SearchMain() {
  return (
    <section className="search">
      <form className="search__form">
        <div className="search__container">
          <button type="submit" className="search__button">
            <img
              className="search__search-image"
              src={searchBtn}
              alt="кнопка поиска"
            />
          </button>
          <input
            className="search__input"
            placeholder="Поиск проектов, приложений и всего остального"
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

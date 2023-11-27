import React, { useContext } from 'react';
import { Context } from '../../context/context';
import './Search.css';

function Search() {
  const { currentUser } = useContext(Context);

  function handleFormSubmit(event) {
    event.preventDefault();
  }

  return (
    <section className="search">
      <form className="search__form" onSubmit={handleFormSubmit}>
        <div className="search__container">
          <button type="submit" className="search__button">
            <div className="search__search-image" />
          </button>
          <input
            className="search__input"
            placeholder={
              currentUser.is_worker
                ? 'Поиск задач и проектов по навыкам, ключевым словам, технологиям...'
                : 'Поиск фрилансеров по специальности, навыкам, ключевым словам...'
            }
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

export { Search };

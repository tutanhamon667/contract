import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../context/context';
import './Search.css';

function Search({ setSearchQuery }) {
  const { currentUser } = useContext(Context);
  const [searchPhrase, setSearchPhrase] = useState('');
  const navigate = useNavigate();

  function handleFormSubmit(event) {
    event.preventDefault();
    const searchQuery = searchPhrase ? `?search=${searchPhrase}` : '';
    setSearchQuery(searchQuery);
    setSearchPhrase(searchPhrase.replace(/ +(?= )/g, ''));
    navigate(searchQuery);
  }

  function handleChange(event) {
    setSearchPhrase(event.target.value);
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
            type="text"
            value={searchPhrase}
            onChange={handleChange}
          />
        </div>
      </form>
    </section>
  );
}

export { Search };

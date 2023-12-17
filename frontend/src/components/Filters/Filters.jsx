import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Context } from '../../context/context';
import { Button } from '../Button/Button';
import * as Api from '../../utils/Api';
import './Filters.css';

function Filters({ setSearchQuery }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [selectedCategories, setSelectedCategories] = useState(
    queryParams.getAll('category') || null,
  );
  const [categories, setCategories] = useState([]);
  const [budgetStart, setBudgetStart] = useState(queryParams.get('min_budget') || null);
  const [budgetEnd, setBudgetEnd] = useState(queryParams.get('max_budget') || null);
  const { currentUser, orderFilter, isAuthenticated } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    Api.getAllCategories()
      .then((response) => {
        setCategories(response);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  function handleReset() {
    setBudgetStart('');
    setBudgetEnd('');
    setSelectedCategories([]);
    setSearchQuery('');
    navigate('/');
  }

  const filtersContainerStyle = `filters-container${
    orderFilter && isAuthenticated ? ' filters-container__freelance ' : ''
  }`;

  function handleFilter() {
    const searchCategory = selectedCategories.map((category) => `category=${category}`);
    if (budgetStart) searchCategory.push(`min_budget=${budgetStart}`);
    if (budgetEnd) searchCategory.push(`max_budget=${budgetEnd}`);
    const searchQuery = `?${[...searchCategory].join('&')}`;
    setSearchQuery(searchQuery);
    navigate(searchQuery);
  }

  function FilterInput({ id, name, slug }) {
    const iSchecked = selectedCategories.includes(slug);

    const handleChange = (e) => {
      const value = e.target.value;
      const checked = e.target.checked;

      if (checked) {
        setSelectedCategories([...selectedCategories, value]);
      } else {
        setSelectedCategories(selectedCategories.filter((category) => category !== value));
      }
    };

    return (
      <div>
        <input
          type="checkbox"
          id={`freelance-item${id}`}
          name="freelance-item"
          className="filters-checkbox"
          value={slug}
          checked={iSchecked}
          onChange={handleChange}
        />
        <label htmlFor={`freelance-item${id}`} className="filters-checkbox__item">
          {name}
        </label>
      </div>
    );
  }

  return (
    <section className="filters">
      {currentUser?.is_customer && (
        <Button
          text="Создать заказ"
          width={289}
          marginBottom={24}
          onClick={() => navigate('/create-task')}
        />
      )}
      <div className={filtersContainerStyle}>
        <h2 className="filters-container__title">Специализация</h2>

        {categories.map((category) => (
          <FilterInput
            key={category.id}
            slug={category.slug}
            name={category.name}
            id={category.id}
          />
        ))}
      </div>

      <div className="filters-container filters-container__budget">
        <h2 className="filters-container__title">Бюджет</h2>
        <form className="filters-form-budget">
          <input
            type="text"
            id="filters-budget__start"
            className="filters-budget"
            value={budgetStart || ''}
            placeholder="от"
            onChange={(event) => setBudgetStart(event.target.value)}
            required
          />
          <input
            type="text"
            id="filters-budget__end"
            className="filters-budget"
            value={budgetEnd || ''}
            placeholder="до"
            onChange={(event) => setBudgetEnd(event.target.value)}
            required
          />
        </form>
      </div>
      <div className="filters-buttons">
        <Button text="Применить фильтры" width={289} onClick={handleFilter} />
        <Button text="Очистить фильтры" width={289} buttonSecondary onClick={handleReset} />
      </div>
    </section>
  );
}

export { Filters };

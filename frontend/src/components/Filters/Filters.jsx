import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Context } from '../../context/context';
import { Button } from '../Button/Button';
import * as Api from '../../utils/Api';
import './Filters.css';

function Filters({ setSearchQuery, marginTop, isFirstTab }) {
  const location = useLocation();
  const queryParameters = new URLSearchParams(location.search);
  const [selectedCategories, setSelectedCategories] = useState(
    queryParameters.getAll('category') || undefined,
  );
  const [categories, setCategories] = useState([]);
  const [budgetStart, setBudgetStart] = useState(queryParameters.get('min_budget') || undefined);
  const [budgetEnd, setBudgetEnd] = useState(queryParameters.get('max_budget') || undefined);
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
    // navigate('/');
  }

  function handleBudgetStart({ target: { value } }) {
    const regex = /[^0-9]/g;
    setBudgetStart(value.replace(regex, ''));
  }
  function handleBudgetEnd({ target: { value } }) {
    const regex = /[^0-9]/g;
    setBudgetEnd(value.replace(regex, ''));
  }

  const isFreelance =
    (orderFilter && isAuthenticated) || /^\/order\/\d+\/responses$/.test(location.pathname);
  const filtersContainerStyle = isFreelance
    ? 'filters-container filters-container__freelance'
    : 'filters-container';
  // const filtersContainerStyle = `filters-container${orderFilter && isAuthenticated ? ' filters-container__freelance ' : ''}`;

  function handleFilter() {
    const searchCategory = selectedCategories.map((category) => `category=${category}`);
    if (budgetStart) searchCategory.push(`min_budget=${budgetStart}`);
    if (budgetEnd) searchCategory.push(`max_budget=${budgetEnd}`);
    const searchQuery = `?${[...searchCategory].join('&')}`;
    setSearchQuery(searchQuery);
    navigate(searchQuery);
  }

  function FilterInput({ id, name, slug }) {
    const isChecked = selectedCategories.includes(slug);

    function handleChange({ target: { value, checked } }) {
      if (checked) {
        setSelectedCategories([...selectedCategories, value]);
      } else {
        setSelectedCategories(selectedCategories.filter((category) => category !== value));
      }
    }

    return (
      <div>
        <input
          type="checkbox"
          id={`freelance-item${id}`}
          name="freelance-item"
          className="filters-checkbox"
          value={slug}
          checked={isChecked}
          onChange={handleChange}
        />
        <label htmlFor={`freelance-item${id}`} className="filters-checkbox__item">
          {name}
        </label>
      </div>
    );
  }

  return (
    <section className="filters" style={{ marginTop }}>
      {currentUser?.is_customer && location.pathname === '/' && (
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
        <h2 className="filters-container__title">
          {!isAuthenticated && isFirstTab && 'Бюджет'}
          {!isAuthenticated && !isFirstTab && 'Ставка'}
          {isAuthenticated && currentUser?.is_customer && isFirstTab && 'Ставка'}
          {isAuthenticated && currentUser?.is_customer && !isFirstTab && 'Бюджет'}
          {isAuthenticated && currentUser?.is_worker && isFirstTab && 'Бюджет'}
        </h2>
        <form className="filters-form-budget">
          <div className="filters-budget__wrapper">
            <span className="filters-budget__label">От</span>
            <input
              type="text"
              id="filters-budget__start"
              className="filters-budget"
              value={budgetStart || ''}
              onChange={handleBudgetStart}
              required
            />
          </div>
          <div className="filters-budget__wrapper">
            <span className="filters-budget__label">До</span>
            <input
              type="text"
              id="filters-budget__end"
              className="filters-budget"
              value={budgetEnd || ''}
              onChange={handleBudgetEnd}
              required
            />
          </div>
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

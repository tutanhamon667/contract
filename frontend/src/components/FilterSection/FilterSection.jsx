import "./FilterSection.css";
import React, { useState, useContext, useEffect } from "react";
import Button from "../Button/Button";
import { Context } from "../../context/context";
import { useNavigate } from "react-router-dom";

function FilterSection({ freelanceFilter, handleFreelanceFilter }) {
  const [budgetStart, setBudgetStart] = useState(null);
  const [budgetEnd, setBudgetEnd] = useState(null);
  const { currentUser, orderFilter, isAuthenticated } = useContext(Context);
  const navigate = useNavigate();
  let localFreelanceFilter = {};

  useEffect(() => {
    load(7);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBudgetClean = () => {
    setBudgetStart("");
    setBudgetEnd("");
  };

  function load(n) {
    while (n) {
      let checked = JSON.parse(localStorage.getItem(`freelance-item${n}`));
      let profession = document.getElementById(`freelance-item${n}`).value
      localFreelanceFilter[`${profession}`] = checked;
      document.getElementById(`freelance-item${n}`).checked = checked;
      n--;
    }
    handleFreelanceFilter(localFreelanceFilter);
  }

  const saveFilters = (n) => {
    let checkbox = document.getElementById(`freelance-item${n}`);
    localFreelanceFilter = freelanceFilter;
    localFreelanceFilter[`${checkbox.value}`] = checkbox.checked;
    localStorage.setItem(`freelance-item${n}`, checkbox.checked);
    handleFreelanceFilter(localFreelanceFilter);
  }

  const filtersContainerStyle = `filters-container  ${
    orderFilter && isAuthenticated ? "filters-conteiner__freelance " : ""
  }`;

  return (
    <section className="filters">
      {/*{isAuthenticated && currentUser.role === 'Заказчик' ? (*/}
      {isAuthenticated && currentUser.name ? (
        <Button text="Создать заказ" width={289} marginBottom={24} onClick={() => navigate('/create-task')} />
      ) : (<></>)}
      <div className={filtersContainerStyle}>
        <h2 className="filters-container__title">Специализация</h2>
        <div>
          <input
            type="checkbox"
            id="freelance-item1"
            name="freelance-item1"
            className="filters-checkbox"
            value="дизайн"
            onClick={() => saveFilters(1)}
          />
          <label htmlFor="freelance-item1" className="filters-checkbox__item">
            дизайн
          </label>
        </div>
        <div>
          <input
            type="checkbox"
            id="freelance-item2"
            name="freelance-item2"
            className="filters-checkbox"
            value="разработка"
            onClick={() => saveFilters(2)}
          />
          <label htmlFor="freelance-item2" className="filters-checkbox__item">
            разработка
          </label>
        </div>
        <div>
          <input
            type="checkbox"
            id="freelance-item3"
            name="freelance-item3"
            className="filters-checkbox"
            value="тестирование"
            onClick={() => saveFilters(3)}
          />
          <label htmlFor="freelance-item3" className="filters-checkbox__item">
            тестирование
          </label>
        </div>
        <div>
          <input
            type="checkbox"
            id="freelance-item4"
            name="freelance-item4"
            className="filters-checkbox"
            value="администрирование"
            onClick={() => saveFilters(4)}
          />
          <label htmlFor="freelance-item4" className="filters-checkbox__item">
            администрирование
          </label>
        </div>
        <div>
          <input
            type="checkbox"
            id="freelance-item5"
            name="freelance-item5"
            className="filters-checkbox"
            value="маркетинг"
            onClick={() => saveFilters(5)}
          />
          <label htmlFor="freelance-item5" className="filters-checkbox__item">
            маркетинг
          </label>
        </div>
        <div>
          <input
            type="checkbox"
            id="freelance-item6"
            name="freelance-item6"
            className="filters-checkbox"
            value="контент"
            onClick={() => saveFilters(6)}
          />
          <label htmlFor="freelance-item6" className="filters-checkbox__item">
            контент
          </label>
        </div>
        <div>
          <input
            type="checkbox"
            id="freelance-item7"
            name="freelance-item7"
            className="filters-checkbox"
            value="разное"
            onClick={() => saveFilters(7)}
          />
          <label htmlFor="freelance-item7" className="filters-checkbox__item">
            разное
          </label>
        </div>
      </div>

      <div className="filters-container filters-container__budget">
        <h2 className="filters-container__title">Бюджет</h2>
        <form className="filters-form-budget">
          <input
            type="text"
            id="filters-budget__start"
            className="filters-budget"
            value={budgetStart || ""}
            placeholder="от"
            onChange={(e) => setBudgetStart(e.target.value)}
            required
          />
          <input
            type="text"
            id="filters-budget__end"
            className="filters-budget"
            value={budgetEnd || ""}
            placeholder="до"
            onChange={(e) => setBudgetEnd(e.target.value)}
            required
          />
        </form>
      </div>
      <div className="filters-buttons">
        <Button text="Применить фильтр" width={289} />
        <Button
          text="Очистить фильтры"
          width={289}
          buttonSecondary
          onClick={handleBudgetClean}
        />
      </div>
    </section>
  );
}

export default FilterSection;

import "./FilterSection.css";
import React from "react";
import Button from "../Button/Button";

function FilterSection() {
  return (
    <section className="filters">
      <div className="filters-container filters-conteiner__freelance">
        <h2 className="filters-container__title">Выбрать фильтр</h2>
        <div>
          <input type="checkbox" id="freelance-item1" name="freelance-item1" className="filters-checkbox" value="freelance-item1" />
          <label htmlFor="freelance-item1" className="filters-checkbox__item">Фильтр 1</label>
        </div>
        <div>
          <input type="checkbox" id="freelance-item2" name="freelance-item2" className="filters-checkbox" value="freelance-item2" />
          <label htmlFor="freelance-item2" className="filters-checkbox__item">Фильтр 2</label>
        </div>
        <div>
          <input type="checkbox" id="freelance-item3" name="freelance-item3" className="filters-checkbox" value="freelance-item3" />
          <label htmlFor="freelance-item3" className="filters-checkbox__item">Фильтр 3</label>
        </div>
        <div>
          <input type="checkbox" id="freelance-item4" name="freelance-item4" className="filters-checkbox" value="freelance-item4" />
          <label htmlFor="freelance-item4" className="filters-checkbox__item">Фильтр 4</label>
        </div>
        <div>
          <input type="checkbox" id="freelance-item5" name="freelance-item5" className="filters-checkbox" value="freelance-item5" />
          <label htmlFor="freelance-item5" className="filters-checkbox__item">Фильтр 5</label>
        </div>
        <div>
          <input type="checkbox" id="freelance-item6" name="freelance-item6" className="filters-checkbox" value="freelance-item6" />
          <label htmlFor="freelance-item6" className="filters-checkbox__item">Фильтр 6</label>
        </div>
        <div>
          <input type="checkbox" id="freelance-item7" name="freelance-item7" className="filters-checkbox" value="freelance-item7" />
          <label htmlFor="freelance-item7" className="filters-checkbox__item">Фильтр 7</label>
        </div>
        <div>
          <input type="checkbox" id="freelance-item8" name="freelance-item8" className="filters-checkbox" value="freelance-item81" />
          <label htmlFor="freelance-item8" className="filters-checkbox__item">Фильтр 8</label>
        </div>
      </div>
      <div className="filters-container filters-container__budget">
      <h2 className="filters-container__title">Бюджет</h2>
        <div>
          <input type="checkbox" id="budget-item1" name="budget-item1" className="filters-checkbox" />
          <label htmlFor="budget-item1" className="filters-checkbox__item">Фильтр 1</label>
        </div>
        <div>
          <input type="checkbox" id="budget-item2" name="budget-item2" className="filters-checkbox" />
          <label htmlFor="budget-item2" className="filters-checkbox__item">Фильтр 2</label>
        </div>
        <div>
          <input type="checkbox" id="budget-item3" name="budget-item3" className="filters-checkbox" />
          <label htmlFor="budget-item3" className="filters-checkbox__item">Фильтр 3</label>
        </div>
        <div>
          <input type="checkbox" id="budget-item4" name="budget-item4" className="filters-checkbox" />
          <label htmlFor="budget-item4" className="filters-checkbox__item">Фильтр 4</label>
        </div>
      </div>
      <div className="filters-buttons">
      <Button text="Применить фильтр" width={295}/>
      <Button text="Очистить фильтры" width={295} inheritTheme/>
      </div>
    </section>
  );
}

export default FilterSection;

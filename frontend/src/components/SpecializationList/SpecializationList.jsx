import React, { useState } from "react";
import Multiselect from "multiselect-react-dropdown";
import "../FreelancerAccount/FreelancerAccount";
import "./SpecializationList.css";

const options = [
  { label: 'First', value: 1 },
  { label: 'Second', value: 2 },
  { label: 'Third', value: 3 },
]

export default function SpecializationList() {
  const [value, setValue] = useState([options[1]]);
  const [isOpen, setIsopen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(1);

  function clearOptions(e) {
    e.stopPropagation()
    setValue([])
  }

  function selectOption(option) {
    if (value.includes(option)) {
      setValue(value.filter(o => o !== option))
    } else {
      setValue([...value, option])
    }
  }


  function isOptionSelected(option) {
    return value.includes(option)
  }

  return (
    <div
      tabIndex={0}
      onClick={() => setIsopen(prev => !prev)}
      onBlur={() => setIsopen(false)}
      className="list__container"
    >
      <span className="list__value">
        {value.map(v => (
          <button
            key={v.value}
            onClick={e => { e.stopPropagation(); selectOption(v) }}>
            {v.label}
            <span className="list__clear">&times;</span>
          </button>
        ))
        }
      </span>
      <button onClick={e => clearOptions(e)}>
        &times;
      </button>
      <div className="list__caret"></div>
      <ul className={`list__options ${isOpen ? 'list__options_show' : ''}`}>
        {options.map((option, index) => (
          <li
            key={option.label}
            onClick={e => {
              e.stopPropagation()
              selectOption(option)
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`list__option 
          ${isOptionSelected(option) ? 'list__option-selected' : ''}
          ${index === highlightedIndex ? 'list__option-highlighted' : ''}`}>
            {option.label}
          </li>
        ))}
      </ul>
    </div>

    // <div className="form-profile__input-container">
    //   <label className="accountF__subtitle" for="specialization">Специализация</label>
    //   <select
    //     name="specialization"
    //     id="specialization"
    //     size="1"
    //     placeholder="Выберите из списка"
    //     className="form-profile__list form-profile__list-title"
    //   >
    //     <option value="" className="form-profile__list form-profile__list-default">Выберите из списка</option>
    //     <option value="design" className="form-profile__list">Дизайн</option>
    //     <option value="development" className="form-profile__list">Разработка</option>
    //     <option value="testing" className="form-profile__list">Тестирование</option>
    //     <option value="administration" className="form-profile__list">Администрирование</option>
    //     <option value="marketing" className="form-profile__list">Маркетинг</option>
    //     <option value="content" className="form-profile__list">Контент</option>
    //     <option value="other" className="form-profile__list">Разное</option>
    //   </select>
    // </div>
  )
}
import React, { useState } from "react";
import "../../../pages/Profiles/Profile.css"
import "../../../pages/Profiles/ProfileFreelancer/ProfileFreelancer.css"
import "./InputMultipleSelect.css";

export default function InputMultipleSelect({options}) {
  const [value, setValue] = useState([]);
  const [isOpen, setIsopen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(true);

  function selectOption(option) {
    if (!isEditMode) return
    if (value.includes(option)) {
      setValue(value.filter(o => o !== option))
    } else {
      setValue([...value, option])
    }
  }

  function isOptionSelected(option) {
    return value.includes(option)
  }

  function exposeList() {
    if (!isEditMode) return
    setIsopen(prev => !prev)
  }

  const listContainerStyle = `list__container ${isOpen ? 'list__container-open' : ''}`;

  return (
    <div
      tabIndex={0}
      onClick={exposeList}
      onBlur={() => setIsopen(false)}
      className={listContainerStyle}
    >
      <span className={`list__preview ${(value.length < 1) ? 'list__preview_show' : ''}`}>Выберите из списка</span>
      <div className="list__value">
        {value.map(v => (
          <div className="list__title"
            key={v.value}
            onClick={e => { e.stopPropagation(); selectOption(v) }}>
            {v.label}
            {isEditMode && <span className="list__item-close"></span>}
          </div>
        ))}
      </div>
      <ul className={`list__options ${isOpen ? 'list__options_show' : ''}`}>
        {options.map((option, index) => (
          <li
            key={option.label}
            onClick={e => { e.stopPropagation(); selectOption(option) }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`list__option ${index === highlightedIndex ? 'list__option-highlighted' : ''}`}
          >
            <div className={`list__checkbox ${isOptionSelected(option) ? 'list__checkbox-highlighted' : ''}`}></div> {option.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

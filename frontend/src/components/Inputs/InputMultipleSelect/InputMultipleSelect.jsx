/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from "react";
import "../../../pages/Profiles/Profile.css"
import "../../../pages/Profiles/ProfileFreelancer/ProfileFreelancer.css"
import "./InputMultipleSelect.css";

export default function InputMultipleSelect({ options, setActivityValues }) {
  const [value, setValue] = useState([]);
  const [isOpen, setIsopen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(true);

  function selectOption(option) {
    if (!isEditMode) return

    if (value.includes(option)) {
      setValue(value.filter(o => o !== option))
      setActivityValues(value.filter(o => o !== option))
    } else {
      setValue([...value, option])
      setActivityValues([...value, option])
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
  const listPreviewStyle = `list__preview ${(value.length < 1) ? 'list__preview_show' : ''}`;
  const listOptionsStyle = `list__options ${isOpen ? 'list__options_show' : ''}`;

  return (
    <div
      tabIndex={0}
      onClick={exposeList}
      onBlur={() => setIsopen(false)}
      className={listContainerStyle}
    >
      <span className={listPreviewStyle}>Выберите из списка</span>
      <div className="list__value">
        {value.map((value, index) => (
          <div className="list__title"
            key={index}
            onClick={e => { e.stopPropagation(); selectOption(value) }}>
            {value}
            {isEditMode && <span className="list__item-close"></span>}
          </div>
        ))}
      </div>
      <ul className={listOptionsStyle}>
        {options.map((option, index) => (
          <li
            key={index}
            onClick={e => { e.stopPropagation(); selectOption(option) }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`list__option ${index === highlightedIndex ? 'list__option-highlighted' : ''}`}
          >
            <div className={`list__checkbox ${isOptionSelected(option) ? 'list__checkbox-highlighted' : ''}`}></div>
            {option}
          </li>
        ))}
      </ul>
    </div>
  )
}

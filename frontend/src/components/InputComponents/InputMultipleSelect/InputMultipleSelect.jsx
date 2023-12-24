import { useState } from 'react';
import '../../../pages/Profiles/ProfileFreelancer/ProfileFreelancer.css';
import '../../../pages/Profiles/Profile.css';
import './InputMultipleSelect.css';

function InputMultipleSelect({ options, setActivityValues, isDisabled }) {
  const [value, setValue] = useState([]);
  const [isOpen, setIsopen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  function selectOption(option) {
    if (isDisabled) return;

    if (value.includes(option)) {
      setValue(value.filter((o) => o !== option));
      setActivityValues(value.filter((o) => o !== option));
    } else {
      setValue([...value, option]);
      setActivityValues([...value, option]);
    }
  }

  function isOptionSelected(option) {
    return value.includes(option);
  }

  function exposeList() {
    if (isDisabled) return;
    setIsopen((previous) => !previous);
  }

  const listContainerStyle = `list__container${isOpen ? ' list__container-open' : ''}`;
  const listPreviewStyle = `list__preview${value.length === 0 ? ' list__preview_show' : ''}`;
  const listOptionsStyle = `list__options${isOpen ? ' list__options_show' : ''}`;

  return (
    <div
      tabIndex={0}
      onClick={exposeList}
      onBlur={() => setIsopen(false)}
      className={listContainerStyle}
      disabled={isDisabled}
    >
      <span className={listPreviewStyle}>Выберите из списка</span>
      <div className="list__value">
        {value.map((value, index) => (
          <div
            className="list__title"
            key={index}
            onClick={(event) => {
              event.stopPropagation();
              selectOption(value);
            }}
          >
            {value.label}
            {!isDisabled && <span className="list__item-close" />}
          </div>
        ))}
      </div>
      <ul className={listOptionsStyle}>
        {options.map((option, index) => (
          <li
            key={index}
            onClick={(event) => {
              event.stopPropagation();
              selectOption(option);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`list__option${
              index === highlightedIndex ? ' list__option-highlighted' : ''
            }`}
          >
            <div
              className={`list__checkbox${
                isOptionSelected(option) ? ' list__checkbox-highlighted' : ''
              }`}
            />
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { InputMultipleSelect };

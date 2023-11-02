/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react';
import '../InputMultipleSelect/InputMultipleSelect.css';
import './InputTags.css';

function InputTags({ setStacksValues, isDisabled, tags, setTags }) {
  // const [tags, setTags] = useState([]);
  const [isEditMode, setIsEditMode] = useState(true);

  function handleKeyDown(e) {
    if (e.key !== 'Enter') return;
    const value = e.target.value;
    if (!value.trim()) return;

    setTags([...tags, value]);
    // setStacksValues([...tags, value]);

    e.target.value = '';
    e.preventDefault();
  }

  function removeTag(index) {
    if (!isEditMode) return;
    setTags(tags.filter((el, i) => i !== index));
  }

  return (
    <div className="tags">
      {isEditMode && (
        <input
          type="text"
          onKeyDown={handleKeyDown}
          className="tag__input"
          placeholder="Начните вводить"
          disabled={isDisabled}
        />
      )}
      {tags.map((tag, index) => (
        <div
          className={`tag__title${isDisabled ? ' tag__title_disabled' : ''}`}
          key={index}
          onClick={() => !isDisabled && removeTag(index)}>
          {tag}
          {isEditMode && !isDisabled && <span className="tag__item-close"></span>}
        </div>
      ))}
    </div>
  )
}

export default InputTags;

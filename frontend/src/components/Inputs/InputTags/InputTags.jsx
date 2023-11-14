import React from 'react';
import '../InputMultipleSelect/InputMultipleSelect.css';
import './InputTags.css';

function InputTags({ name, isDisabled, tags, setTags }) {
  function handleKeyDown(e) {
    if (e.key !== 'Enter') return;
    const { value } = e.target;
    if (!value.trim()) return;

    setTags([...tags, value]);

    e.target.value = '';
    e.preventDefault();
  }

  function removeTag(index) {
    if (isDisabled) return;
    setTags(tags.filter((el, i) => i !== index));
  }

  return (
    <div className={`tags${isDisabled ? ' tags_disabled' : ''}`}>
      {(!isDisabled || tags.length === 0) && (
        <input
          name={name}
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
          onClick={() => !isDisabled && removeTag(index)}
        >
          {tag}
          {!isDisabled && <span className="tag__item-close" />}
        </div>
      ))}
    </div>
  );
}

export { InputTags };

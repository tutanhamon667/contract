import React, { useEffect } from 'react';
import '../InputMultipleSelect/InputMultipleSelect.css';
import './InputTags.css';


function InputTags({ name, isDisabled, tags, setTags, handleChange, error, errorMessage }) {
  function handleKeyDown(event) {
    const { value } = event.target;

    if (event.key !== 'Enter') return;

    if (!value.trim()) return;


    setTags([...tags, value]);

    event.target.value = '';
    event.preventDefault();
  }


  function removeTag(searchIndex) {
    if (isDisabled) return;
    setTags(tags.filter((_, index) => index !== searchIndex));
  }

  useEffect(() => {
    handleChange('tags', tags)
  }, [tags])

  return (
    <>
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
      {error ? <span>{errorMessage}</span> : ''}
    </>
  );
}

export { InputTags };

import React from 'react';
import '../InputMultipleSelect/InputMultipleSelect.css';
import './InputTags.css';

function InputTags({ name, isDisabled, tags, setTags, errors, setErrors, errorMessage }) {
  const tagsRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\-_@.+#]{1,50}$/;

  function handleKeyDown(event) {
    const { value } = event.target;

    if (event.key !== 'Enter') return;

    if (!value.trim()) return;

    if (!tagsRegex.test(value)) {
      setErrors({
        ...errors,
        stacks:
          'Навык может состоять только из латинских и кириллических букв, цифр и следующих символов: .-_@+#',
      });
    } else {
      setTags([...tags, value]);
    }

    event.target.value = '';
    event.preventDefault();
  }

  function removeTag(tag) {
    if (isDisabled) return;
    setTags(tags.filter((element) => element !== tag));
  }

  return (
    <div className="tags__container">
      <div className={`tags${isDisabled ? ' tags_disabled' : ''}`}>
        {(!isDisabled || tags.length === 0) && (
          <input
            name={name}
            type="text"
            onKeyDown={handleKeyDown}
            className="tag__input"
            placeholder="Начните вводить"
            disabled={tags.length > 20}
          />
        )}
        {tags.map((tag, index) => (
          <div
            className={`tag__title${isDisabled ? ' tag__title_disabled' : ''}`}
            key={index}
            onClick={() => !isDisabled && removeTag(tag)}
          >
            {tag}
            {!isDisabled && <span className="tag__item-close" />}
          </div>
        ))}
      </div>
      <span className="input__error-text">{errorMessage}</span>
    </div>
  );
}

export { InputTags };

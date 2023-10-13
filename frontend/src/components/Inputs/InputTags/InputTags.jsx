import { useState } from 'react';
import '../InputMultipleSelect/InputMultipleSelect.css';
import './InputTags.css';

function InputTags() {
  const [tags, setTags] = useState([]);
  const [isEditMode, setIsEditMode] = useState(true);

  function handleKeyDown(e) {
    if (e.key !== 'Enter') return;
    const value = e.target.value;
    if (!value.trim()) return;
    setTags([...tags, value]);
    e.target.value = '';
    // onChange(tags);
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
        />
      )}
      {tags.map((tag, index) => (
        <div
          className="list__title"
          key={index}
          onClick={() => removeTag(index)}>
          {tag}
          {isEditMode && <span className="list__item-close"></span>}
        </div>
      ))}
    </div>
  )
}

export default InputTags;

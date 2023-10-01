import { useState } from "react";
import "./InputTags.css";

function InputTags({ name, onChange }) {
  const [tags, setTags] = useState([]);

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
    setTags(tags.filter((el, i) => i !== index));
  }

  return (
    <div className="tags-input-container">
      {tags.map((tag, index) => (
        <div className="tag-item" key={index}>
          <span className="text">{tag}</span>
          <span className="close" onClick={() => removeTag(index)}>&times;</span>
        </div>
      ))}
      <input
        name={name}
        type="text"
        onKeyDown={handleKeyDown}
        className="tags-input"
        placeholder="Теги"
      />
    </div>
  );
}

export default InputTags;

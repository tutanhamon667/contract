import React, { useState } from "react";
import "./InputDoc.css";

const InputDoc = ({ name, onChange, onDeleteDocClick, error, errorMessage }) => {
  const [file, setFile] = useState(null);

  const handleChange = (event) => {
    setFile(event.currentTarget.files[0]);
    onChange(event);
  };

  return !file ? (
    <label className="input-doc__real-input">
      <input
        className="input-doc__fake-input"
        type="file"
        name={name}
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleChange}
      />
      <div>
        <span className="input-doc__input-text">Загрузить</span>
        <span className="input-doc__input-text input-doc__input-text_type_tooltip">макс. 50 MB</span>
      </div>
      <span className="input-doc__input-text input-doc__input-text_type_tooltip">.jpg .jpeg .png</span>
    </label>
  ) : (
    <div className="input-doc__real-input input-doc__real-input_uploaded">
      <input className="input-doc__fake-input" name={name}/>
      <span className="input-doc__input-text input-doc__input-text_uploaded">{file.name}</span>
      <button type="button" className="input-doc__close-button" onClick={onDeleteDocClick}></button>
    </div>
  );
};

export { InputDoc };

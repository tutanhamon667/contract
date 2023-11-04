import React, { useState } from "react";
import "./InputDoc.css";

const InputDoc = ({ name, value, onChange, onDeleteDocClick, errorMessage, isDisabled }) => {
  const [file, setFile] = useState(value || null);
  const [error, setError] = useState('');
  const allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg'];

  const handleChange = (event) => {
   // setFile(event.currentTarget.files[0]);

    const selectedFile = event.currentTarget.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile)


    reader.onload = function () {
      // console.log(reader.result)
      onChange(reader.result, selectedFile.name)
    }

    reader.onerror = function () {
      console.error(reader.error);
    };

    if (selectedFile) {
      if (allowedFileTypes.includes(selectedFile.type) && selectedFile.size < 52428800) {
        setFile(selectedFile);
        setError('');
        // console.log(selectedFile)
      } else {
        setFile(null);
        setError('Выберите файл в формате PNG, JPG или JPEG до 50 МБ.');
      }
    }
  };

  return (
    <>
      <label className="input-doc__real-input">
        <input
          className="input-doc__fake-input"
          type="file"
          name={name}
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
          disabled={isDisabled}
        />
        <div>
          <span className="input-doc__input-text">Загрузить</span>
          <span className="input-doc__input-text input-doc__input-text_type_tooltip">макс. 50 MB</span>
        </div>
        <span className="input-doc__input-text input-doc__input-text_type_tooltip">.jpg .jpeg .png</span>
      </label>
      {file ?
        <div className="input-doc__real-input input-doc__real-input_uploaded">
          <input className="input-doc__fake-input" name={name} disabled={isDisabled} />
          <span className="input-doc__input-text input-doc__input-text_uploaded">{file.name}</span>
          <button className="input-doc__close-button" onClick={onDeleteDocClick} disabled={isDisabled} />
        </div>
        : ''
      }
    </>
  );
};

export { InputDoc };

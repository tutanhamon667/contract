import React, { useState } from "react";
import "./InputImage.css";

const InputImage = ({ name, value, onChange }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const inputStyle = file && {
    backgroundImage: `url(${file && URL.createObjectURL(file)})`,
    backgroundSize: "contain"
  };
  const allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg'];

  const handleChange = (event) => {
    // setFile(event.currentTarget.files[0]);

    // onChange(event);

    const selectedFile = event.currentTarget.files[0];

    if (selectedFile) {
      if (allowedFileTypes.includes(selectedFile.type) && selectedFile.size < 52428800) {
        setFile(selectedFile);
        setError('');
      } else {
        setFile(null);
        setError('Выберите файл в формате PNG, JPG или JPEG до 50 МБ.');
      }
    }
  };

  return (
    <>
      <label
        className={`input-image__real-input${error ? ' input-image__error' : ''}`}
        style={inputStyle}
      >
        <input
          className="input-image__fake-input"
          type="file"
          name={name}
          accept=".png,.jpg,.jpeg"
          onChange={handleChange}
        />
      </label>
      <span className="input-image__error-text">{error}</span>
    </>
  );
};

export { InputImage };

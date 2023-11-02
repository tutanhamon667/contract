import React, { useState } from "react";
import "./InputImage.css";

const InputImage = ({ name, value, onChange, width, height, isDisabled }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  // const inputStyle = file && {
  const inputStyle = {
    backgroundImage: `url(${file ? URL.createObjectURL(file) : value})`,
    backgroundSize: 'contain'
  };
  const allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg'];

  const handleChange = (event) => {
    // setFile(event.currentTarget.files[0]);
    const selectedFile = event.currentTarget.files[0];

    // console.log('ok')

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile)

    reader.onload = function () {
      // console.log(reader.result)
      onChange(reader.result)
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
      <label
        className={`input-image__real-input${width === 80 ? ' input-image__real-input_small' : ''}${error ? ' input-image__error' : ''}`}
        style={{ ...inputStyle, width, height }}
      >
        <input
          className="input-image__fake-input"
          type="file"
          name={name}
          // value={value}
          accept=".png,.jpg,.jpeg"
          onChange={handleChange}
          disabled={isDisabled}
        />
      </label>
      <span className="input-image__error-text">{error}</span>
    </>
  );
};

export { InputImage };

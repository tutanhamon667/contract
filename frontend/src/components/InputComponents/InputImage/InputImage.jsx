import { useState } from 'react';
import './InputImage.css';

function InputImage({ name, value, onChange, width, height, isDisabled, setErrors, error }) {
  const [file, setFile] = useState();
  // const [error, setError] = useState('');
  const allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  const inputStyle = {};

  if (file) {
    inputStyle.backgroundImage = `url('${file}')`; // `url('${URL.createObjectURL(file)}')`;
    inputStyle.backgroundSize = 'cover';
  } else if (value) {
    inputStyle.backgroundImage = `url(${value})`;
    inputStyle.backgroundSize = 'cover';
  }

  const handleChange = (event) => {
    const selectedFile = event.currentTarget.files[0];
    // console.log(selectedFile);
    setFile(URL.createObjectURL(selectedFile));

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);

    reader.onload = () => {
      onChange(reader.result);
    };

    reader.onerror = () => {
      // console.error(reader.error);
    };

    if (selectedFile) {
      if (allowedFileTypes.includes(selectedFile.type) && selectedFile.size < 52_428_800) {
        // setFile(selectedFile);
        // setError('');
        // console.log(selectedFile)
        setErrors({ ...error, photo: '' });
      } else {
        setFile(undefined);
        setErrors({ ...error, photo: 'Выберите файл в формате PNG, JPG или JPEG до 50 МБ.' });
        // setError('Выберите файл в формате PNG, JPG или JPEG до 50 МБ.');
      }
    }
  };

  return (
    <>
      <label
        className={`input-image__real-input${width === 80 ? ' input-image__real-input_small' : ''}${
          error ? ' input-image__error' : ''
        }`}
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
}

export { InputImage };

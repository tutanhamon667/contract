import React, { useState } from 'react';
import './InputDoc.css';

function InputDoc({
  name,
  value,
  onChange,
  // onDeleteDocClick,
  errorMessage,
  isDisabled,
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg'];

  React.useEffect(() => {
    if (value) {
      setFile(value);
      console.log(value);
    }
  }, []);

  function handleChange(event) {
    const selectedFile = event.currentTarget.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);

    reader.onload = () => {
      onChange(reader.result, selectedFile.name);
      if (allowedFileTypes.includes(selectedFile.type) && selectedFile.size < 52428800) {
        setFile({ file: reader.result, name: selectedFile.name });
        setError('');
      } else {
        setFile(null);
        setError('Выберите файл в формате PNG, JPG или JPEG до 50 МБ.');
      }
    };

    reader.onerror = () => {
      console.error(reader.error);
    };
  }

  return !file ? (
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
        <span className="input-doc__input-text input-doc__input-text_type_tooltip">
          макс. 50 MB
        </span>
      </div>
      <span className="input-doc__input-text input-doc__input-text_type_tooltip">
        .jpg .jpeg .png
      </span>
    </label>
  ) : (
    <div className="input-doc__real-input input-doc__real-input_uploaded">
      <input className="input-doc__fake-input" name={name} disabled />
      <span className="input-doc__input-text input-doc__input-text_uploaded">{file.name}</span>
      {!isDisabled && (
        <button className="input-doc__close-button" onClick={() => setFile(null)} type="button" />
      )}
    </div>
  );
}

export { InputDoc };

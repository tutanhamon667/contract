import React, { useState } from 'react';
import './InputDocument.css';

function InputDocument({ name, value, onChange, isDisabled }) {
  // const [currentFile, setCurrentFile] = useState({});
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg'];

  React.useEffect(() => {
    if (value) {
      setFiles(value);
    }
  }, [value]);

  function handleChange(event) {
    const selectedFile = event.currentTarget.files[0];

    const reader = new FileReader();
    selectedFile && reader.readAsDataURL(selectedFile);

    reader.onload = () => {
      if (
        allowedFileTypes.includes(selectedFile.type) &&
        selectedFile.size <= 52428800 &&
        !files.find((file) => file.file === reader.result)
      ) {
        setFiles([...files, { file: reader.result, name: selectedFile.name }]);
        // setCurrentFile({ file: reader.result, name: selectedFile.name });
        onChange([...files, { file: reader.result, name: selectedFile.name }]);
        setError('');
      } else if (!allowedFileTypes.includes(selectedFile.type) || selectedFile.size > 52428800) {
        // setFiles(null);
        setError('Выберите файл в формате PNG, JPG или JPEG до 50 МБ.');
      } else if (files.find((file) => file.file === reader.result)) {
        // setFiles(null);
        setError('Такой файл уже загружен.');
      }
    };

    reader.onerror = () => {
      console.error(reader.currentTarget);
    };
  }

  function handleDelete(item) {
    const newFiles = files.filter((file) => file.file !== item.file);
    setFiles(newFiles);
    onChange(newFiles);

    // TODO [2023-12-01]: исправить проблему, что не прикрепляется тот же файл после удаления
  }

  return (
    <>
      {files?.length > 0 &&
        files?.map((item, index) => (
          <div
            className="input-doc__real-input input-doc__real-input_uploaded"
            // key={index}
            key={new Date().getTime() + index}
          >
            <input className="input-doc__fake-input" name={name} disabled />
            <span className="input-doc__input-text input-doc__input-text_uploaded">
              {item.name}
            </span>
            {!isDisabled && (
              <button
                className="input-doc__close-button"
                onClick={() => handleDelete(item)}
                type="button"
              />
            )}
          </div>
        ))}

      {files?.length < 8 && !isDisabled && (
        <div className="input-doc__wrapper">
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
          <span className="input-doc__error">{error}</span>
        </div>
      )}
    </>
  );
}

export { InputDocument };

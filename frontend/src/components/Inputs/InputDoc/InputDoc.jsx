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
  const [currentFile, setCurrentFile] = useState({});
  const [files, setFile] = useState([]);
  const [error, setError] = useState('');
  const allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg'];

  React.useEffect(() => {
    if (value) {
      setFile(value);
      console.log(value);
    }
  }, []);
  console.log(files.length, files)

  function handleChange(event) {
    const selectedFile = event.currentTarget.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);

    reader.onload = () => {
      onChange([...files, { file: reader.result, name : selectedFile.name}]);
      if (allowedFileTypes.includes(selectedFile.type) && selectedFile.size < 52428800) {
        setFile([ ...files, {file: reader.result, name: selectedFile.name }]);
        setCurrentFile({file: reader.result, name: selectedFile.name })
        setError('');
      } else {
        setFile(null);
        setError('Выберите файл в формате PNG, JPG или JPEG до 50 МБ.');
      }
    };

    reader.onerror = () => {
      console.error(reader.currentTarget);
    };
  }

  function handleDelete(item){
    const newFiles = files.filter((file) => file.file !== item.file);
    setFile(newFiles)
    console.log(newFiles)
    onChange(newFiles)

  }

  return (
    <>
    {files.length < 5 ?
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
      : ''
    }
      {files.length > 0 ?
        files.map((item, index) => {
          return (
            <div className="input-doc__real-input input-doc__real-input_uploaded" key={index}>
              <input className="input-doc__fake-input" name={name} disabled />
              <span className="input-doc__input-text input-doc__input-text_uploaded">{item.name}</span>
              {!isDisabled && (
                <button className="input-doc__close-button" onClick={(event) => handleDelete(item)} type="button" />
              )}
            </div>
          )
        })
        : ''
      }
    </>
  )

}

export { InputDoc };

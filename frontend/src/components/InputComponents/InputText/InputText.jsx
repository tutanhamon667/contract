import React from 'react';
import './InputText.css';

function InputText({
  id,
  type,
  placeholder,
  autoComplete,
  width,
  height,
  value,
  onChange,
  onBlur,
  marginTop,
  pass,
  name,
  error,
  errorMessage,
  isDisabled,
}) {
  const InputType = type === 'textarea' ? 'textarea' : 'input';
  const inputStyle =
    type === 'textarea'
      ? { width, height, marginTop, resize: 'none' }
      : { width, height, marginTop };

  return (
    <div className="input-container">
      <InputType
        className={`input${
          name === 'payrate'
            ? ' input_type_number'
            : name.includes('password')
              ? ' input_type_password'
              : ''
        }${error ? ' input_type_error' : ''}`}
        type={type !== 'textarea' ? type : ''}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={inputStyle}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onWheel={(event) => event.target.blur()}
        name={name}
        id={id}
        disabled={isDisabled}
      />
      {pass && <button className="input__show-pass" type="button" onClick={pass} />}
      <span className="input__error-text">{errorMessage}</span>
    </div>
  );
}

export { InputText };

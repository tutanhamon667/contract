import React from "react";
import "./InputText.css";

const InputText = (
  {
    type,
    placeholder,
    autoComplete,
    width,
    height,
    value,
    onChange,
    marginTop,
    pass,
    name,
    error,
    errorMessage
  }
) => {
  const InputType = type === 'textarea' ? 'textarea' : 'input';
  const inputStyle = type === 'textarea'
    ? {width, height, marginTop, resize: 'none'}
    : {width, height, marginTop};

  return (
    <div className="inputContainer">
      <InputType
        className={`input${error ? ' input__error' : ''}`}
        type={type !== 'textarea' ? type : ''}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={inputStyle}
        value={value}
        onChange={onChange}
        name={name}
      />
      {pass && <div className="input__showPass" onClick={pass} />}
      <span className="input__errorText">{errorMessage}</span>
    </div>
  );
};

export default InputText;

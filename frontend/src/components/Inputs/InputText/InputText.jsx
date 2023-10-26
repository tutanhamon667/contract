/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import "./InputText.css";

const InputText = (
  {
    id,
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
    errorMessage,
    isDisabled
  }
) => {
  const InputType = type === 'textarea' ? 'textarea' : 'input';
  const inputStyle = type === 'textarea'
    ? {width, height, marginTop, resize: 'none'}
    : {width, height, marginTop};

  return (
    <div className="inputContainer">
      <InputType
        className={`input${name === 'payrate' ? ' input_type_number'
          : name.includes('password') ? ' input_type_password' : ''}${error ? ' input_type_error' : ''}`}
        type={type !== 'textarea' ? type : ''}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={inputStyle}
        value={value}
        onChange={onChange}
        name={name}
        id={id}
        disabled={isDisabled}
      />
      {pass && <button className="input__showPass" type="button" onClick={pass} />}
      <span className="input__errorText">{errorMessage}</span>
    </div>
  );
};

export default InputText;

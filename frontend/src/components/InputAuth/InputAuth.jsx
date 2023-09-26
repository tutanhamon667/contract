import React from "react";
import "./InputAuth.css";

const InputAuth = ({
  placeholder,
  type,
  autocomplete,
  width,
  height,
  value,
  onChange,
  marginTop,
  marginBottom,
  pass,
  name,
  error,
  errorMessage
}) => {
  return (
    <div className="inputContainer">
      <input
        className={`input ${error && "input__error"}`}
        placeholder={placeholder}
        autoComplete={autocomplete}
        style={{ width, height, marginTop, marginBottom }}
        value={value}
        onChange={onChange}
        type={type}
        name={name}
        error={error}
        />
      {pass && <div className="input__showPass" onClick={pass} />}
      <span className="input__errorText">{errorMessage}</span>
    </div>
  );
};

export default InputAuth;

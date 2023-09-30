import React from "react";
import "./InputText.css";

const InputText = ({
  placeholder,
  type,
  autocomplete,
  width,
  height,
  value,
  onChange,
  marginTop,
  pass,
  name,
  error,
  errorMessage
}) => {
  return (
    <div className="inputContainer">
      <input
        className={`input${error ? " input__error" : ""}`}
        placeholder={placeholder}
        autoComplete={autocomplete}
        style={{ width, height, marginTop }}
        value={value}
        onChange={onChange}
        type={type}
        name={name}
      />
      {pass && <div className="input__showPass" onClick={pass} />}
      <span className="input__errorText">{errorMessage}</span>
    </div>
  );
};

export default InputText;

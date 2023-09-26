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
  pass,
}) => {
  return (
    <div className="inputContainer">
      <input
        className="input"
        placeholder={placeholder}
        autoComplete={autocomplete}
        style={{ width, height, marginTop }}
        value={value}
        onChange={onChange}
        type={type}
      />
      {pass && <div className="input__showPass" onClick={pass} />}
    </div>
  );
};

export default InputAuth;

import React from "react";
import "./InputAuth.css";

const InputAuth = ({ placeholder, type, autocomplete, width, value, onChange, marginTop, pass }) => {
  return (
    <div className="inputContainer">
      <input
        className="input"
        placeholder={placeholder}
        autoComplete={autocomplete}
        style={{width, marginTop}}
        value={value}
        onChange={onChange}
        type={type}
      />
      {pass && <div className="input__showPass" onClick={pass}/>}
    </div>
  );
};

export default InputAuth;

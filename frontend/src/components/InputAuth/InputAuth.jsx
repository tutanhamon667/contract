import React from "react";
import "./InputAuth.css";

const InputAuth = ({ placeholder, type, autocomplete, width, value, onChange, marginTop }) => {
  return (
    <div className="inputContainer">
      <input
        className="input"
        placeholder={placeholder}
        type={type}
        autoComplete={autocomplete}
        style={{width, marginTop}}
      />
    </div>
  );
};

export default InputAuth;

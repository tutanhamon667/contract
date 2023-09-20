import React from "react";
import "./InputAuth.css";

const InputAuth = ({ placeholder, width, value, onChange, marginTop }) => {
  return (
    <div className="inputContainer">
      <input
        className="input"
        type="text"
        placeholder={placeholder}
        style={{width, marginTop}}
      />
    </div>
  );
};

export default InputAuth;

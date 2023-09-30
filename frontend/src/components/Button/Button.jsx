import React from "react";
import "./Button.css";

const Button = ({ text, width, height, marginTop, marginBottom, buttonSecondary, type, onClick, disabled }) => {
  return (
    <button
      className={`button${buttonSecondary ? " buttonSecondary" : ""}`}
      style={{
        width,
        height,
        marginTop,
        marginBottom
      }}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      <p className={`button__text${buttonSecondary ? " buttonSecondary__text" : ""}`}>
        {text}
      </p>
    </button>
  );
};

export default Button;

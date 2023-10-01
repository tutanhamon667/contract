import React from "react";
import "./Button.css";

const Button = ({
  text,
  width,
  height,
  marginTop,
  marginBottom,
  buttonSecondary,
  buttonWhite,
  type,
  onClick,
  disabled,
  fontWeight,
  fontSize,
  color,
  border
}) => {
  return (
    <button
      className={`button${buttonSecondary ? " buttonSecondary" : ""} ${
        buttonWhite&&"buttonWhite"
      }`}
      style={{
        width,
        height,
        marginTop,
        marginBottom,
        fontWeight,
        fontSize,
        color,
        border
      }}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      <p
        className={`button__text${
          buttonSecondary ? " buttonSecondary__text" : ""
        }`}
      >
        {text}
      </p>
    </button>
  );
};

export default Button;

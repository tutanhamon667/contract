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
  border,
  opacity,
}) => {
  return (
    <button
      className={`button${buttonSecondary ? " buttonSecondary" : ""} ${
        buttonWhite && "buttonWhite"
      } ${disabled && "buttonDisabled"}`}
      style={{
        width,
        height,
        marginTop,
        marginBottom,
        fontWeight,
        fontSize,
        border,
        opacity,
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

import React from "react";
import "./Button.css";

const Button = ({
  text,
  width,
  height,
  marginTop,
  marginBottom,
  buttonSecondary,
  buttonBlack,
  buttonWhite,
  type,
  onClick,
  disabled,
  border,
  fontSize,
  fontWeight,
  opacity
}) => {
  return (
    <button
      className={`button${buttonSecondary ? " buttonSecondary" : ""} button${
        buttonBlack ? " buttonBlack" : ""
      } ${
        buttonWhite && " buttonWhite"}`}
      style={{
        width,
        height,
        marginTop,
        marginBottom,
        border,
        fontSize,
        fontWeight,
        opacity
      }}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      <p
        className={`button__text${
          buttonSecondary ? " buttonSecondary__text" : ""
        }  button__text${buttonBlack ? " buttonBlack__text" : ""}`}
      >
        {text}
      </p>
    </button>
  );
};

export default Button;

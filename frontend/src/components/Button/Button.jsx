import React from "react";
import "./Button.css";

const Button = ({ text, width, height, inheritTheme, type, onClick, white, disabled }) => {
  return (
    <button
      className={`buttonActHov ${inheritTheme ? "buttonInherit" : "button"} ${white && "buttonWhite"}`}
      style={{
        width,
        height,
      }}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      <p className={`${inheritTheme ? "button__textBlack" : "button__text"}`}>
        {text}
      </p>
    </button>
  );
};

export default Button;

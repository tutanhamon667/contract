import React from "react";
import "./Button.css";

const Button = ({ text, width, height, marginTop, marginBottom, inheritTheme, type, onClick, white, disabled }) => {
  return (
    <button
      className={`buttonActHov ${inheritTheme ? "buttonInherit" : "button"} ${white && "buttonWhite"}`}
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
      <p className={`${inheritTheme ? "button__textBlack" : "button__text"}`}>
        {text}
      </p>
    </button>
  );
};

export default Button;

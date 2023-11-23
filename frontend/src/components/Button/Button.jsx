import React from 'react';
import './Button.css';

function Button({
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
  opacity,
}) {
  return (
    <button
      className={`button ${buttonSecondary ? 'button_type_secondary' : disabled ? 'button_type_disabled' : ''
        } ${buttonWhite ? 'button_color_white' : ''} ${buttonBlack ? 'button_color_black' : ''}`}
      style={{
        width,
        height,
        marginTop,
        marginBottom,
        border,
        fontSize,
        fontWeight,
        opacity,
      }}
      // eslint-disable-next-line react/button-has-type
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      <span
        className={`button__text${buttonSecondary ? ' button_type_secondary__text' : ''
          } button__text${buttonBlack ? ' button_color_black__text' : ''}`}
      >
        {text}
      </span>
    </button>
  );
}

export { Button };

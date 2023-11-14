import React from 'react';
import './InputSwitch.css';

function InputSwitch({
  id,
  type,
  label,
  value,
  onChange,
  marginTop,
  name,
  error,
  errorMessage,
  isDisabled,
  defaultChecked,
}) {
  return (
    <div className="input-switch__container">
      <label className="input-switch__label" style={{ marginTop }}>
        <input
          className={`input-switch__input${
            type === 'radio'
              ? ' input-switch__input_type_radio'
              : ' input-switch__input_type_checkbox'
          }${error ? ' input_type_error' : ''}`}
          type={type}
          value={value}
          onChange={onChange}
          name={name}
          id={id}
          disabled={isDisabled}
          required={type === 'radio'}
          defaultChecked={defaultChecked}
        />
        {label}
      </label>
      <span className="input-switch__error-text">{errorMessage}</span>
    </div>
  );
}

export { InputSwitch };

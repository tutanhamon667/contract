import React from "react";
import "./InputSwitch.css";

export function InputSwitch(
  {
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
    defaultChecked
  }
) {
  return (
    <div className="inputSwitch__container">
      <label className="inputSwitch__label" style={{ marginTop }}>
        <input
          className={`inputSwitch__input${type === 'radio' ? ' inputSwitch__input_type_radio'
            : ' inputSwitch__input_type_checkbox'}${error ? ' input_type_error' : ''}`}
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
      <span className="inputSwitch__errorText">{errorMessage}</span>
    </div>
  );
}

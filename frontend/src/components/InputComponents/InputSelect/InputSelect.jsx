import React from 'react';
import './InputSelect.css';

function InputSelect({ name, options, placeholder, width, isDisabled, value, onChange }) {
  return (
    <select
      className={`select${value === '' ? ' select_type_placeholder' : ''}`}
      name={name}
      value={value}
      onChange={onChange}
      style={{ width }}
      disabled={isDisabled}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} className="option" value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export { InputSelect };

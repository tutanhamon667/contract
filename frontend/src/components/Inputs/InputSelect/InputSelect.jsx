import React from 'react';
import './InputSelect.css';

export default function InputSelect({ options, placeholder, width, isDisabled, value, onChange }) {

  return (
    <select
      className={`select${value === '' ? ' select_type_placeholder' : ''}`}
      name="degree"
      value={value}
      onChange={onChange}
      style={{width}}
      disabled={isDisabled}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} className="option" value={option.value}>{option.label}</option>
      ))}
    </select>
  )
}

import React from 'react';
import './InputSelect.css';

export default function InputSelect({ options, placeholder, width }) {
  const [value, setValue] = React.useState('');

  return (
    <select
      className={`select${value === '' ? ' select_type_placeholder' : ''}`}
      name="degree"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{width}}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} className="option" value={option.value}>{option.label}</option>
      ))}
    </select>
  )
}

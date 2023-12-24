import './InputSelect.css';

function InputSelect({
  name,
  options,
  placeholder,
  width,
  isDisabled,
  value,
  onChange,
  onBlur,
  error,
  required,
  margin,
}) {
  return (
    <div className="select-container">
      <select
        className={`select${value === '' ? ' select_type_placeholder' : ''}${
          error ? ' select_type_error' : ''
        }`}
        name={name}
        value={value}
        onChange={onChange}
        style={{ width, margin }}
        disabled={isDisabled}
        onBlur={onBlur}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} className="option" value={option.value}>
            {option.label || option.title}
          </option>
        ))}
      </select>
      {error && <span className="input__error-text">{error}</span>}
    </div>
  );
}

export { InputSelect };

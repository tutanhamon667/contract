import React, { useState } from "react";
import "./InputImage.css";

const InputImage = ({ name, value, onChange }) => {
  const [file, setFile] = useState(null);
  const inputStyle = file && {
    backgroundImage: `url(${file && URL.createObjectURL(file)})`,
    backgroundSize: "contain"
  };

  const handleChange = (event) => {
    setFile(event.currentTarget.files[0]);
    // onChange(event);
  };

  return (
    <label
      className="input-image__real-input"
      style={inputStyle}
    >
      <input
        className="input-image__fake-input"
        type="file"
        name={name}
        accept=".png,.jpg,.jpeg"
        onChange={handleChange}
      />
      {/*{file && <img className="input-image__image" src={URL.createObjectURL(file)} alt="Предпросмотр файла" />}*/}
    </label>
  );
};

export { InputImage };

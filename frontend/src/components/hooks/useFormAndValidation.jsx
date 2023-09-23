import { React, useState } from "react"

export default function useFormAndValidation() {
  const [values, setValues] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  }

  return {
    values,
    handleChange,
    setValues,
  }
}
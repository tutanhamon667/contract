export const isDisabled = (errors) =>
  Object.values(errors).some((error) => error !== "");

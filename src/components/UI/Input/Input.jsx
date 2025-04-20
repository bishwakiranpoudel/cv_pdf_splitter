"use client";
import "./Input.css";

function Input({
  type = "text",
  value,
  onChange,
  onBlur,
  className = "",
  ...rest
}) {
  const combinedClasses = `input ${className}`.trim();

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={combinedClasses}
      {...rest}
    />
  );
}

export default Input;

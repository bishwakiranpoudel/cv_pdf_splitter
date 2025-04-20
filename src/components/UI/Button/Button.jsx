"use client";
import "./Button.css";

function Button({
  variant = "primary",
  disabled = false,
  onClick,
  className = "",
  children,
  ...rest
}) {
  const baseClass = "button";
  const variantClass = `button-${variant}`;
  const disabledClass = disabled ? "button-disabled" : "";
  const combinedClasses =
    `${baseClass} ${variantClass} ${disabledClass} ${className}`.trim();

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;

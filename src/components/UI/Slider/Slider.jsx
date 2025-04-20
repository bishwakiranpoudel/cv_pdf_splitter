"use client";
import "./Slider.css";

function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  className = "",
  ...rest
}) {
  const combinedClasses = `slider ${className}`.trim();

  const handleChange = (e) => {
    onChange(Number.parseInt(e.target.value));
  };

  // Calculate the percentage for styling the slider track
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider-container">
      <div className="slider-track">
        <div className="slider-fill" style={{ width: `${percentage}%` }}></div>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        className={combinedClasses}
        {...rest}
      />
    </div>
  );
}

export default Slider;

import { useId, type InputHTMLAttributes } from "react";
import "./Input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = "",
  ...rest
}: InputProps) {
  // Si no nos pasan id ni name, generamos uno estable con useId(). Sin esto,
  // el <label htmlFor> quedaba apuntando a "undefined" y no se asociaba con
  // el <input> — se veía bien pero un lector de pantalla no los conectaba,
  // y getByLabelText en los tests tampoco los encontraba.
  const generatedId = useId();
  const inputId = id ?? rest.name ?? generatedId;

  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className={`input ${className}`.trim()} {...rest} />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

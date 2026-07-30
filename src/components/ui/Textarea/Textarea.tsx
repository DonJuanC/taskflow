import { useId, type TextareaHTMLAttributes } from "react";
import "../Input/Input.css";
import "./Textarea.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

// Mismo contrato que Input (mismas clases .field/.field-label/.input, mismo
// criterio de id estable con useId para no romper la asociación label↔control),
// pero sobre un <textarea>: un <input> nunca hace wrap de texto largo, solo
// scrollea horizontal — para Descripción, donde el texto puede ser largo,
// hace falta un control que efectivamente permita múltiples líneas.
export function Textarea({
  label,
  error,
  id,
  className = "",
  rows = 2,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? rest.name ?? generatedId;

  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`input textarea ${className}`.trim()}
        rows={rows}
        {...rest}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

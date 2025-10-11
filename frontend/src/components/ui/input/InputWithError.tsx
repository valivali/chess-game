import "./InputWithError.scss"

import * as React from "react"

import { Input, type InputProps } from "./input"

export interface InputWithErrorProps extends InputProps {
  error?: string
  label?: string
  id?: string
}

const InputWithError = React.forwardRef<HTMLInputElement, InputWithErrorProps>(({ error, label, id, className, ...props }, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="input-with-error">
      {label && (
        <label htmlFor={inputId} className="input-with-error__label">
          {label}
        </label>
      )}
      <div className="input-with-error__input-container">
        <Input
          id={inputId}
          ref={ref}
          className={`input-with-error__input ${error ? "input-with-error__input--error" : ""} ${className || ""}`}
          {...props}
        />
        <div className="input-with-error__error-container">{error && <p className="input-with-error__error">{error}</p>}</div>
      </div>
    </div>
  )
})

InputWithError.displayName = "InputWithError"

export { InputWithError }

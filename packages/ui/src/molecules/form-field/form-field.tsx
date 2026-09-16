"use client";

import type * as React from "react";
import { useId } from "react";
import { cn } from "../../shared/cn";
import { FieldContext, type FieldControl } from "../../shared/field-context";
import { useFormError } from "../../shared/form-context";

export interface FormFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  name: string;
  label?: React.ReactNode;
  labelAction?: React.ReactNode;
  visuallyHiddenLabel?: boolean;
  required?: boolean;
  help?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
}

const FormField = ({
  name,
  label,
  labelAction,
  visuallyHiddenLabel = false,
  required = false,
  help,
  error: errorProp,
  children,
  className,
  ...props
}: FormFieldProps) => {
  const generatedId = useId();
  const inputId = `${name}-${generatedId}`;
  const formError = useFormError(name);
  const error = errorProp ?? formError;
  const labelId = label ? `${inputId}-label` : undefined;
  const helpId = help && !error ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const control: FieldControl = {
    inputId,
    labelId,
    describedBy: [errorId, helpId].filter(Boolean).join(" ") || undefined,
    invalid: Boolean(error),
    required,
  };

  const labelElement = label ? (
    <label
      id={labelId}
      htmlFor={inputId}
      className={cn(
        "text-cg-label-lg text-cg-ink",
        visuallyHiddenLabel && "sr-only",
        Boolean(error) && "text-cg-danger",
      )}
    >
      {label}
      {required ? <span className="ml-0.5 text-cg-danger" aria-hidden="true">*</span> : null}
    </label>
  ) : null;

  return (
    <div {...props} className={cn("flex w-full flex-col gap-1.5", className)}>
      {labelAction ? (
        <div className={cn("flex items-center justify-between gap-3", visuallyHiddenLabel && "sr-only")}>
          {labelElement}
          <span className="shrink-0">{labelAction}</span>
        </div>
      ) : (
        labelElement
      )}
      <FieldContext.Provider value={control}>{children}</FieldContext.Provider>
      {helpId ? <p id={helpId} className="px-1 text-cg-caption-sm text-cg-caption">{help}</p> : null}
      {errorId ? (
        <p id={errorId} aria-live="polite" className="px-1 text-cg-caption-sm text-cg-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;

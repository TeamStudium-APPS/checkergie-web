"use client";

import type * as React from "react";
import { cn } from "../../shared/cn";
import { FormContext, type FormErrors } from "../../shared/form-context";
import { FormActions } from "../../molecules/form-actions";
import { FormField } from "../../molecules/form-field";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  errors?: FormErrors;
}

const FormRoot = ({ errors, className, ...props }: FormProps) => {
  return (
    <FormContext.Provider value={errors}>
      <form {...props} className={cn("flex w-full flex-col gap-5", className)} />
    </FormContext.Provider>
  );
};

const Form = Object.assign(FormRoot, {
  Field: FormField,
  Actions: FormActions,
});

export default Form;

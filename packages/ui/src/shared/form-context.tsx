"use client";

import type * as React from "react";
import { createContext, useContext } from "react";

export type FormErrors = Record<string, React.ReactNode>;

export const FormContext = createContext<FormErrors | undefined>(undefined);

export const useFormError = (name: string): React.ReactNode | undefined => {
  return useContext(FormContext)?.[name];
};

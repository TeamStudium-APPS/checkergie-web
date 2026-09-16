"use client";

import { createContext, useContext } from "react";

export interface FieldControl {
  inputId: string;
  labelId?: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

export const FieldContext = createContext<FieldControl | undefined>(undefined);

export const useFieldControl = (): FieldControl | undefined => {
  return useContext(FieldContext);
};

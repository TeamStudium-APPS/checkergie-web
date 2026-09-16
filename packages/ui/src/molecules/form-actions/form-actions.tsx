import type * as React from "react";
import { cn } from "../../shared/cn";

export type FormActionsAlign = "start" | "center" | "end" | "between";

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: FormActionsAlign;
}

const alignClasses: Record<FormActionsAlign, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

const FormActions = ({ align = "end", className, ...props }: FormActionsProps) => {
  return (
    <div
      {...props}
      className={cn("mt-1 flex w-full items-center gap-2", alignClasses[align], className)}
    />
  );
};

export default FormActions;

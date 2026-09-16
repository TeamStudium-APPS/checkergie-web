import type * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "../../shared/cn";

export type ChipVariant = "choice" | "static" | "removable";
export type ChipSize = "sm" | "md";
export type ChipTone = "neutral" | "brand" | "success" | "danger";

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  tone?: ChipTone;
  selected?: boolean;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  onPress?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onRemove?: () => void;
  removeLabel?: string;
}

const sizeClasses: Record<ChipSize, string> = {
  sm: "h-9 px-3 text-cg-label-sm",
  md: "h-12 px-4 text-cg-label-lg",
};

const toneClasses: Record<ChipTone, string> = {
  neutral: "border-cg-border bg-cg-surface text-cg-text",
  brand: "border-cg-brand bg-cg-brand-soft text-cg-brand",
  success: "border-cg-success/25 bg-cg-success/10 text-cg-success",
  danger: "border-cg-danger/25 bg-cg-danger/10 text-cg-danger",
};

const Chip = ({
  label,
  variant = "choice",
  size = "md",
  tone = "neutral",
  selected = false,
  disabled = false,
  leadingIcon,
  onPress,
  onRemove,
  removeLabel,
  className,
  ...props
}: ChipProps) => {
  const baseClass = cn(
    "inline-flex items-center justify-center rounded-full border transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-out outline-none focus-visible:ring-3 focus-visible:ring-cg-brand/20 motion-reduce:transition-none",
    sizeClasses[size],
    selected
      ? "border-cg-brand bg-cg-brand text-white hover:bg-cg-brand-hover active:bg-cg-brand-hover"
      : variant === "static"
        ? toneClasses[tone]
        : "border-cg-border bg-cg-surface text-cg-text hover:border-cg-brand hover:text-cg-brand active:bg-cg-brand-soft",
    disabled && "cursor-not-allowed opacity-45",
    className,
  );

  if (variant === "static") {
    return (
      <span {...props} className={cn(baseClass, "gap-1.5")}>
        {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
        {label}
      </span>
    );
  }

  if (variant === "removable") {
    return (
      <span {...props} className={cn(baseClass, "gap-1.5 pr-1.5")}>
        {label}
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          aria-label={removeLabel ?? `${label} 제거`}
          className="inline-flex size-8 cursor-pointer touch-manipulation items-center justify-center rounded-full text-lg leading-none transition-colors duration-150 hover:bg-black/5 active:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cg-brand/25 disabled:cursor-not-allowed motion-reduce:transition-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </span>
    );
  }

  return (
    <button
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onPress}
      className={cn(
        baseClass,
        disabled ? "cursor-not-allowed" : "cursor-pointer touch-manipulation",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden transition-[width,opacity,transform] duration-150 ease-out motion-reduce:transition-none",
          selected ? "w-3.5 scale-100 opacity-100" : "w-0 scale-75 opacity-0",
        )}
      >
        <Check className="size-3.5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "transition-[margin] duration-150 ease-out motion-reduce:transition-none",
          selected && "ml-1.5",
        )}
      >
        {label}
      </span>
    </button>
  );
};

export default Chip;

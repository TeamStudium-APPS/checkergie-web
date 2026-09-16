"use client";

import type * as React from "react";
import { useCallback, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../shared/cn";
import { useFieldControl } from "../../shared/field-context";

export type TextFieldSize = "sm" | "md" | "lg";
export type TextFieldVariant = "outline" | "filled";
export type ImeStrategy = "delayed" | "immediate";

export interface TextFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "onChange" | "value" | "defaultValue"
  > {
  size?: TextFieldSize;
  variant?: TextFieldVariant;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  imeStrategy?: ImeStrategy;
  transformValue?: (value: string) => string;
  /** 입력 왼쪽의 장식 아이콘. 접근성 트리에서는 숨겨집니다. */
  leadingIcon?: React.ReactNode;
  /** 입력 왼쪽의 조작 요소. 버튼처럼 접근 가능한 요소를 사용합니다. */
  leadingAction?: React.ReactNode;
  /** 입력 오른쪽의 장식 아이콘. 접근성 트리에서는 숨겨집니다. */
  trailingIcon?: React.ReactNode;
  /** 입력 오른쪽의 조작 요소. clearable보다 우선순위가 낮습니다. */
  trailingAction?: React.ReactNode;
  clearable?: boolean;
  clearLabel?: string;
  error?: boolean;
  success?: boolean;
  wrapperClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const sizeClasses: Record<TextFieldSize, string> = {
  sm: "h-10 text-cg-body-sm",
  md: "h-12 text-cg-body-sm",
  lg: "h-[52px] text-cg-body-lg",
};

const assignRef = <T,>(ref: React.Ref<T> | undefined, value: T | null): void => {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
};

const TextField = ({
  id,
  size = "md",
  variant = "outline",
  value,
  defaultValue,
  onValueChange,
  imeStrategy = "delayed",
  transformValue,
  leadingIcon,
  leadingAction,
  trailingIcon,
  trailingAction,
  clearable = false,
  clearLabel = "입력 지우기",
  error = false,
  success = false,
  wrapperClassName,
  className,
  disabled,
  ref,
  onCompositionStart,
  onCompositionEnd,
  ...inputProps
}: TextFieldProps) => {
  const generatedId = useId();
  const field = useFieldControl();
  const inputId = field?.inputId ?? id ?? generatedId;
  const isControlled = value !== undefined;
  const applyTransform = useCallback(
    (nextValue: string) => (transformValue ? transformValue(nextValue) : nextValue),
    [transformValue],
  );
  const [innerValue, setInnerValue] = useState(() => applyTransform(value ?? defaultValue ?? ""));
  const [isComposing, setIsComposing] = useState(false);
  const lastEmittedRef = useRef(innerValue);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const controlledValue = applyTransform(value ?? "");
  const displayedValue = isControlled && !isComposing ? controlledValue : innerValue;

  const emit = useCallback(
    (nextValue: string) => {
      setInnerValue(nextValue);
      if (lastEmittedRef.current === nextValue) return;
      lastEmittedRef.current = nextValue;
      onValueChange?.(nextValue);
    },
    [onValueChange],
  );

  const invalid = field?.invalid || error;
  const valid = success && !invalid;
  const describedBy =
    [field?.describedBy, inputProps["aria-describedby"]].filter(Boolean).join(" ") || undefined;

  return (
    <div
      className={cn(
        "flex w-full items-center rounded-full transition-[border-color,background-color,box-shadow] duration-150",
        sizeClasses[size],
        variant === "outline" ? "border bg-cg-surface" : "border border-transparent bg-cg-subtle",
        invalid
          ? "border-cg-danger focus-within:ring-3 focus-within:ring-cg-danger/15"
          : valid
            ? "border-cg-success focus-within:ring-3 focus-within:ring-cg-success/15"
            : "border-cg-border focus-within:border-cg-brand focus-within:ring-3 focus-within:ring-cg-brand/12",
        disabled && "cursor-not-allowed bg-cg-subtle opacity-55",
        wrapperClassName,
      )}
    >
      {leadingAction ? (
        <span className="shrink-0 pl-1.5">{leadingAction}</span>
      ) : leadingIcon ? (
        <span className="ml-4 inline-flex shrink-0 items-center justify-center text-cg-caption" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <input
        {...inputProps}
        id={inputId}
        ref={(node) => {
          inputRef.current = node;
          assignRef(ref, node);
        }}
        disabled={disabled}
        value={displayedValue}
        aria-invalid={field ? invalid : (inputProps["aria-invalid"] ?? invalid)}
        aria-required={field ? field.required || undefined : inputProps["aria-required"]}
        aria-describedby={describedBy}
        className={cn(
          "min-w-0 flex-1 cursor-text bg-transparent px-4 text-cg-ink outline-none placeholder:text-cg-caption disabled:cursor-not-allowed",
          Boolean(leadingIcon || leadingAction) && "pl-3",
          Boolean(clearable || trailingIcon || trailingAction) && "pr-2",
          className,
        )}
        onCompositionStart={(event) => {
          setInnerValue(event.currentTarget.value);
          setIsComposing(true);
          onCompositionStart?.(event);
        }}
        onCompositionEnd={(event) => {
          setIsComposing(false);
          emit(applyTransform(event.currentTarget.value));
          onCompositionEnd?.(event);
        }}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          if (isComposing) {
            setInnerValue(nextValue);
            if (imeStrategy === "immediate" && lastEmittedRef.current !== nextValue) {
              lastEmittedRef.current = nextValue;
              onValueChange?.(nextValue);
            }
            return;
          }
          emit(applyTransform(nextValue));
        }}
      />
      {clearable && displayedValue ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={clearLabel}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            emit("");
            inputRef.current?.focus();
          }}
          className="mr-1 inline-flex size-9 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full text-xl text-cg-caption transition-colors duration-150 hover:bg-cg-subtle hover:text-cg-text active:bg-cg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cg-brand/20 disabled:cursor-not-allowed motion-reduce:transition-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : trailingAction ? (
        <span className="shrink-0 pr-1.5">{trailingAction}</span>
      ) : trailingIcon ? (
        <span className="mr-4 inline-flex shrink-0 items-center justify-center text-cg-caption" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </div>
  );
};

export default TextField;

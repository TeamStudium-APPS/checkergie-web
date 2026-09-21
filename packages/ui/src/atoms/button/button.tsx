import type * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../shared/cn";
import type { PolymorphicProps } from "../../shared/polymorphic";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export type ButtonProps<T extends React.ElementType = "button"> = PolymorphicProps<
  T,
  ButtonOwnProps
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-cg-action text-cg-ink hover:bg-cg-action-hover active:bg-cg-action-hover",
  secondary:
    "bg-cg-brand text-white hover:bg-cg-brand-hover active:bg-cg-brand-hover",
  outline:
    "border border-cg-border bg-cg-surface text-cg-text hover:border-cg-brand hover:text-cg-brand active:bg-cg-brand-soft",
  ghost: "bg-transparent text-cg-muted hover:bg-cg-subtle hover:text-cg-ink active:bg-cg-border",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 gap-1.5 px-4 text-cg-label-lg",
  md: "h-11 gap-2 px-5 text-cg-label-lg",
  lg: "h-12 gap-2 px-6 text-cg-title-md",
};

const Button = <T extends React.ElementType = "button",>({
  as,
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  loading = false,
  disabled = false,
  className,
  children,
  ref,
  ...rest
}: ButtonProps<T>) => {
  const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
  const Tag = (as ?? (anchorProps.href ? "a" : "button")) as React.ElementType;
  const unavailable = disabled || loading;
  const cursorClass = loading
    ? "cursor-wait"
    : disabled
      ? "cursor-not-allowed"
      : "cursor-pointer";
  const classes = cn(
    "cg-button-press relative inline-flex shrink-0 touch-manipulation items-center justify-center overflow-hidden rounded-full whitespace-nowrap no-underline outline-none focus-visible:ring-3 focus-visible:ring-cg-brand/25 disabled:opacity-45",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    cursorClass,
    unavailable && "opacity-45",
    className,
  );

  const content = (
    <>
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : leadingIcon ? (
        <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span>{children}</span>
      {!loading && trailingIcon ? (
        <span className="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );

  if (Tag === "button") {
    const { type = "button", ...buttonProps } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        {...buttonProps}
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={unavailable}
        aria-busy={loading || undefined}
        className={classes}
      >
        {content}
      </button>
    );
  }

  const { onClick, tabIndex, ...tagProps } = rest as React.HTMLAttributes<HTMLElement>;
  return (
    <Tag
      {...tagProps}
      ref={ref}
      className={classes}
      aria-disabled={unavailable || undefined}
      aria-busy={loading || undefined}
      tabIndex={unavailable ? -1 : tabIndex}
      onClick={
        unavailable
          ? (event: React.MouseEvent) => {
              event.preventDefault();
              event.stopPropagation();
            }
          : onClick
      }
    >
      {content}
    </Tag>
  );
};

export default Button;

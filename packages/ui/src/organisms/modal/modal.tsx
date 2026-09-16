"use client";

import type * as React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../shared/cn";
import { lockBodyScroll, unlockBodyScroll } from "../../shared/scroll-lock";
import { useFocusTrap } from "../../shared/use-focus-trap";
import { useMounted } from "../../shared/use-mounted";
import { useOverlayEscape } from "../../shared/use-overlay-escape";

export type ModalFooterAlign = "start" | "center" | "end" | "stretch";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  dismissible?: boolean;
  showCloseIcon?: boolean;
  closeLabel?: string;
  footerAlign?: ModalFooterAlign;
  ariaLabel?: string;
  className?: string;
  bodyClassName?: string;
  onExited?: () => void;
}

const footerAlignment: Record<ModalFooterAlign, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  stretch: "[&>*]:flex-1 [&>*]:justify-center",
};

const exitFallbackDuration = 200;

interface ModalPresence {
  open: boolean;
  present: boolean;
  exiting: boolean;
}

const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = 560,
  dismissible = true,
  showCloseIcon = true,
  closeLabel = "모달 닫기",
  footerAlign = "end",
  ariaLabel,
  className,
  bodyClassName,
  onExited,
}: ModalProps) => {
  const mounted = useMounted();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [presence, setPresence] = useState<ModalPresence>({
    open,
    present: open,
    exiting: false,
  });
  const wasPresentRef = useRef(presence.present);

  if (open !== presence.open) {
    setPresence({ open, present: true, exiting: !open });
  }

  const { present, exiting } = presence;
  const requestClose = useCallback(() => {
    if (dismissible) onOpenChange(false);
  }, [dismissible, onOpenChange]);

  const finishExit = useCallback(() => {
    setPresence((current) => (
      current.exiting
        ? { open: false, present: false, exiting: false }
        : current
    ));
  }, []);

  useOverlayEscape(open && dismissible, requestClose);
  useFocusTrap(panelRef, open, bodyRef);

  useEffect(() => {
    if (present) {
      lockBodyScroll();
      return unlockBodyScroll;
    }
  }, [present]);

  useEffect(() => {
    if (!exiting) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fallbackTimer = window.setTimeout(
      finishExit,
      reduceMotion ? 0 : exitFallbackDuration,
    );
    return () => window.clearTimeout(fallbackTimer);
  }, [exiting, finishExit]);

  useEffect(() => {
    if (wasPresentRef.current && !present) onExited?.();
    wasPresentRef.current = present;
  }, [onExited, present]);

  if (!mounted || !present) return null;

  const modalWidth = typeof width === "number" ? `${width}px` : width;

  return createPortal(
    <div
      data-state={exiting ? "closed" : "open"}
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-cg-overlay p-3 motion-reduce:animate-none sm:items-center sm:p-6",
        exiting ? "pointer-events-none animate-cg-backdrop-out" : "animate-cg-backdrop-in",
      )}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && exiting) finishExit();
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={!title ? ariaLabel : undefined}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        data-state={exiting ? "closed" : "open"}
        className={cn(
          "relative flex max-h-[calc(100dvh-24px)] w-full flex-col overflow-hidden rounded-cg-lg bg-cg-surface shadow-cg-modal outline-none motion-reduce:animate-none sm:max-h-[calc(100dvh-48px)]",
          exiting ? "animate-cg-modal-out" : "animate-cg-modal-in",
          className,
        )}
        style={{ maxWidth: modalWidth }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {(title || description || showCloseIcon) && (
          <header className="relative shrink-0 px-6 pb-3 pt-6 sm:px-7 sm:pt-7">
            {title ? (
              <h2 id={titleId} className="pr-10 text-cg-heading-sm text-cg-ink">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={descriptionId} className="mt-2 pr-8 text-cg-body-sm text-cg-muted">
                {description}
              </p>
            ) : null}
            {showCloseIcon ? (
              <button
                type="button"
                disabled={!dismissible}
                aria-label={closeLabel}
                onClick={requestClose}
                className="absolute right-4 top-4 inline-flex size-[34px] cursor-pointer touch-manipulation items-center justify-center rounded-full text-2xl font-light text-cg-muted transition-colors duration-150 hover:bg-cg-subtle hover:text-cg-ink active:bg-cg-border focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cg-brand/20 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none sm:right-5 sm:top-5"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            ) : null}
          </header>
        )}
        <div ref={bodyRef} className={cn("min-h-0 flex-1 overscroll-contain overflow-y-auto px-6 py-3 sm:px-7", bodyClassName)}>
          {children}
        </div>
        {footer ? (
          <footer
            className={cn(
              "flex shrink-0 flex-wrap items-center gap-2.5 border-t border-cg-border px-6 py-5 sm:px-7",
              footerAlignment[footerAlign],
            )}
          >
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;

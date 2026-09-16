"use client";

import { useEffect, useId } from "react";

const stack: string[] = [];

export const useOverlayEscape = (active: boolean, onEscape: () => void): void => {
  const id = useId();

  useEffect(() => {
    if (!active) return;

    stack.push(id);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || stack.at(-1) !== id) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      onEscape();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      const index = stack.lastIndexOf(id);
      if (index >= 0) stack.splice(index, 1);
    };
  }, [active, id, onEscape]);
};

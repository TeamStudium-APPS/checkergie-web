let lockCount = 0;
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";
let previousHtmlOverflow = "";

export const lockBodyScroll = (): void => {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  if (lockCount === 0) {
    const body = document.body;
    const html = document.documentElement;
    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);

    previousBodyOverflow = body.style.overflow;
    previousBodyPaddingRight = body.style.paddingRight;
    previousHtmlOverflow = html.style.overflow;

    const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
      html.style.setProperty("--cg-scrollbar-width", `${scrollbarWidth}px`);
    }
  }

  lockCount += 1;
};

export const unlockBodyScroll = (): void => {
  if (typeof document === "undefined" || lockCount === 0) return;

  lockCount -= 1;
  if (lockCount > 0) return;

  document.body.style.overflow = previousBodyOverflow;
  document.body.style.paddingRight = previousBodyPaddingRight;
  document.documentElement.style.overflow = previousHtmlOverflow;
  document.documentElement.style.removeProperty("--cg-scrollbar-width");
};

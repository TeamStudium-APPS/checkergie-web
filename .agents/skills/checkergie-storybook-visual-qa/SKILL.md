---
name: checkergie-storybook-visual-qa
description: Visually verify Checkergie packages/ui foundations and components in Storybook after UI, state, or motion changes. Use to inspect rendered styles, interactions, accessibility states, responsive layout, console errors, and stale Storybook output; do not use for landing-page QA.
---

# Checkergie Storybook Visual QA

Verify the rendered component, not only the source code. Read `docs/design-system.md` for the expected component contracts.

## Prepare a trustworthy preview

1. Run `pnpm lint:ui` and `pnpm typecheck:ui` before browser inspection.
2. Start Storybook on a known free port. Prefer a fresh server after adding, removing, or renaming stories.
3. Open the exact story route or iframe route instead of relying on the last selected sidebar item.
4. If the browser shows an error overlay, missing styles, or stale modules, restart Storybook before changing component code.

## Inspect the relevant state matrix

- Foundation: compare real swatches, type samples, spacing, radii, shadows, layers, and motion. Ensure the page reads as a reference sheet.
- Button: default, hover, focus-visible, active press, loading, disabled, icons, and full width.
- Chip: selected and unselected transitions, static tone, removal, disabled, and stable label position.
- TextField: with and without labels, help and error messages, disabled, clearable, leading/trailing icons, and leading/trailing actions.
- Form: field error mapping, explicit field error override, required connection, action alignment, and submit behavior.
- Modal: open and close animation, backdrop click, close button, Escape, non-dismissible mode, focus trap, scroll lock, and final unmount.

Only inspect states relevant to the change, but do not skip unavailable or error states when the component supports them.

## Check rendering details

- Verify Pretendard is the computed font and Tailwind utilities produce non-zero, visible boxes.
- Confirm interactive elements use pointer, wait, or not-allowed cursors consistently with behavior.
- Confirm focus rings are visible and icon-only controls expose accessible names.
- Inspect one normal desktop width and one compact width for components that wrap, stretch, or use overlays.
- For motion, observe the complete transition. Check that exit content stays mounted until the animation completes and that reduced motion remains usable.
- Check browser console and Storybook overlay for runtime, hydration, CSS, or asset errors.

## Finish

Run `pnpm build:storybook`. Report the stories and states inspected, any remaining limitations, and the exact validation commands that passed. Do not commit or push unless the user explicitly asks.

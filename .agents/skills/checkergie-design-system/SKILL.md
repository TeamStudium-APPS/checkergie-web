---
name: checkergie-design-system
description: Implement or revise Checkergie shared UI in packages/ui using Tailwind CSS 4, Pretendard, Atomic Design, semantic tokens, Storybook, accessibility, and product motion. Use for Checkergie foundations, Button, Chip, TextField, Form, Modal, or new design-system components; do not use for landing-page sections.
---

# Checkergie Design System

Build the product UI library in `packages/ui`. Read `AGENTS.md` and `docs/design-system.md` before editing.

## Keep these invariants

- Work in `packages/ui` unless the user explicitly requests app integration.
- Keep the Atomic Design boundaries: `foundations`, `atoms`, `molecules`, `organisms`.
- Compose lower layers instead of copying their behavior into higher layers.
- Use Tailwind CSS 4 and existing `cg` semantic tokens from `src/styles/theme.css` before adding raw values.
- Use Pretendard and semantic `text-cg-*` typography utilities.
- Use `lucide-react` for shared icons instead of handwritten SVG markup.
- Prefer `const` declarations and default exports for component modules; re-export the public named API from barrel files.
- Treat Figma as the visual reference and the package implementation as the behavioral source of truth.
- Use `bigtablet-design-system` only as a logic or interaction reference when the task makes it relevant. Adapt its API and styling to Checkergie.
- Keep Storybook pages utilitarian. Do not turn component or foundation stories into landing pages.

## Implement in this order

1. Inspect existing tokens, the nearest component, its stories, and its exports.
2. Choose the lowest correct Atomic Design layer.
3. Define the behavior and accessibility contract before adding variants.
4. Prefer composition slots such as `leadingIcon`, `trailingAction`, `footer`, or `children` over product-specific props.
5. Implement pointer, keyboard, focus-visible, loading, disabled, error, and reduced-motion behavior where applicable.
6. Add or update focused stories for every meaningful state and interaction.
7. Run the `checkergie-storybook-visual-qa` skill after visual or motion changes.
8. Run `pnpm check:ui` from the repository root.

## Component expectations

- Interactive text or controls use a pointer cursor when available. Loading uses wait; disabled uses not-allowed and must also block interaction.
- Icon-only controls need an accessible name. Decorative icons stay out of the accessibility tree.
- Form labels, descriptions, errors, required state, and controls must be connected through IDs and aria attributes.
- Motion should communicate state, not decorate it. Keep press feedback short, make entry and exit feel related, and remove nonessential transforms for reduced motion.
- Keep controlled and uncontrolled behavior explicit. Do not hide important state transitions inside Storybook-only code.

## Scope control

- Preserve unrelated work and user-owned documents.
- Do not modify `apps/landing` as part of design-system work.
- Do not add a test runner until the user asks. When tests are introduced, start from `packages/ui/templates/component.test.tsx.template` and test behavior rather than implementation details.
- Do not commit or push unless the user explicitly asks.

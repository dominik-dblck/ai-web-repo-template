# Material UI Guide (MUI 7)

## Purpose

Define safe and consistent UI patterns using Material UI.

## Core Styling Rules

- Use MUI components first; avoid custom primitives when MUI already covers the case.
- Use theme-based values (`palette`, `typography`, `spacing`, `shape`) via `sx`.
- Keep styles colocated with component intent; avoid global overrides for local concerns.
- Project-wide component overrides go in `app/styles/customizations/`.

## Token Safety

- Do not import raw design-token values into feature components.
- Use theme mappings as single source of truth.
- Keep semantic usage stable (`text.secondary`, `background.paper`, etc.).
- Colors: always reference `palette` via `sx` — never hardcode hex/hsl values.

## Accessibility

- Preserve semantic hierarchy (`Typography` variants, form labels, ARIA where needed).
- Keep visible focus states.
- Ensure contrast and disabled states are readable.

## Component Patterns

- Prefer composition over deep prop drilling.
- Keep shared variants in reusable wrappers when repeated across features.
- Do not create one-off style systems parallel to MUI theme.
- Use global Drawer/Dialog via `useDrawer()`/`useDialog()` hooks — never render your own overlay instances.

## Performance

- Avoid generating large dynamic style objects each render.
- Memoize expensive derived style values where needed.
- Split heavy UI into lazy boundaries when not needed at first paint.

## Testing Checklist

- Critical components render with expected semantic roles.
- Theme-based colors and states remain consistent in key flows.
- No raw token imports introduced in feature files.

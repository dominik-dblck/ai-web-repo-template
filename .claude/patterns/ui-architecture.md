# UI Architecture Guide (Atomic Design + Folder Boundaries)

## Purpose

Define a scalable UI architecture based on Atomic Design and clear responsibility boundaries.

## Atomic Design Layers

- **Atoms**: smallest reusable UI primitives (buttons, labels, wrappers, small visual blocks).
- **Molecules**: compositions of atoms with limited local logic (Drawer, Dialog, search fields).
- **Organisms**: feature-level modules orchestrating business behavior, hooks, services, and providers.

## Folder Strategy

- Global shared primitives:
  - `app/components/atoms/*`
  - `app/components/molecules/*`
- Feature modules:
  - `app/components/organisms/<Feature>/*`
- Cross-feature runtime layers:
  - `app/hooks/*`, `app/services/*`, `app/providers/*`, `app/utils/*`, `app/types/*`

## Feature Module Blueprint

For medium/large organisms, keep internal structure explicit:

- `components/state-views/` — all screens/steps of the flow (each screen = one step in state machine)
- `components/` — other UI subcomponents (not flow steps)
- `hooks/` — feature-specific hooks
- `services/` — API orchestration for this feature
- `providers/` — feature-scoped context providers (includes state machine provider)
- `utils/` — feature helper functions
- `types/` — feature-specific contracts (includes step enums for state machine)
- `constants/` — feature constants/config

### State Views Pattern

Each organism manages its own isolated state machine flow. All screens/steps live in `components/state-views/`:

```
components/organisms/FeatureName/
├── FeatureName.tsx                    # Main orchestrator (switches between state views)
├── providers/
│   └── FeatureNameProvider.tsx        # State machine + feature context
├── components/
│   └── state-views/                   # All flow screens (one per step)
│       ├── FeatureNameInitialView.tsx
│       ├── FeatureNameReviewView.tsx
│       ├── FeatureNameSuccessView.tsx
│       └── FeatureNameErrorView.tsx
```

The main component switches between state views based on `currentState` from the provider. Each screen is a separate component representing one step in the flow.

## Ownership Rules

- UI rendering logic stays in `components/*`.
- Reusable behavioral logic goes to `hooks/*`.
- Transport/network concerns stay in `services/*`.
- Shared state orchestration belongs in `providers/*`.
- Pure deterministic helpers belong in `utils/*`.
- Domain/DTO contracts live in `types/*`.

Avoid moving business API logic into components.

## Placement Heuristics

- If used by one organism only → keep inside that organism folder.
- If used by multiple organisms in one domain → move to domain-level shared folder.
- If used app-wide → move to global `app/hooks`, `app/services`, `app/utils`, or `app/types`.
- Promote code only when reuse is real (rule of three).

## Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `use{Feature}{Action}.ts(x)`
- Services: `{verb}{Noun}Service.ts`
- Providers: `{Feature}Provider.tsx`
- Utils: `{feature}{Purpose}Utils.ts`
- Types: `{feature}Types.ts`

### Avoid Generic Names

**Never use generic names** that don't indicate purpose:

- No: `index.ts`, `constants.ts`, `utils.ts`, `helpers.ts`, `common.ts`, `shared.ts`
- Yes: `authConstants.ts`, `formatCurrency.ts`, `userTypes.ts`

**Exception**: `index.ts` is acceptable only for re-export barrels when the folder name provides context.

## Anti-Patterns

- Deep shared folders with mixed responsibilities (`helpers/` dumping ground).
- Components directly calling `fetch` with auth logic.
- Feature logic spread across unrelated directories without ownership.
- Duplicated `types` and `constants` with conflicting names.
- Cross-organism imports (organisms should be self-contained).

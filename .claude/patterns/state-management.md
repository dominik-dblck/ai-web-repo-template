# State Management Guide

## Purpose

Define state management patterns focusing on React Context, state machines, and when to use each approach.

## State Management Options

- **React Context**: Global/shared state (auth, user, theme)
- **State Machines**: Complex flows with clear state transitions (multi-step forms, checkout)
- **TanStack Query**: Server state and cache
- **Local State**: Component-scoped UI state (`useState`)

---

## React Context Pattern

### When to Use

- Global app state (auth, user, theme)
- Feature-wide shared state
- Provider-based configuration (query client, notifications)

### Provider Structure

```typescript
'use client';

export const FeatureContext = createContext<FeatureContextType | null>(null);

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);

  const value = useMemo(
    () => ({ state, setState }),
    [state],
  );

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeature() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within FeatureProvider');
  }
  return context;
}
```

### Best Practices

- Memoize context value to prevent unnecessary re-renders
- Split large contexts into smaller, focused contexts
- Throw error if hook used outside provider
- Keep context logic focused (don't mix concerns)

---

## State Machine Pattern

### When to Use

- Multi-step flows with clear transitions (checkout, onboarding, forms)
- Complex state with success/error paths
- State transitions that need to be explicit and predictable

### Structure

- **Steps**: Union type defining possible states
- **Transitions**: Explicit methods (`goTo`, `transitionToSuccess`, `transitionToError`)
- **Data**: Optional data payloads for success/error states
- **Reset**: Method to return to initial state

### Example

```typescript
type FlowStep = 'input' | 'review' | 'processing' | 'success' | 'error';

// In provider — manage step + transition methods
const [step, setStep] = useState<FlowStep>('input');
const goTo = (next: FlowStep) => setStep(next);
```

---

## Organism State Machine Pattern

### Architecture Principle

**Each organism is isolated** and manages its own state machine for its flow. **Each screen is a flow step**, organized in a dedicated `state-views/` folder.

### Folder Structure

```
components/organisms/FeatureName/
├── FeatureName.tsx                    # Main component (orchestrator)
├── providers/
│   └── FeatureNameProvider.tsx        # State machine provider
├── components/
│   └── state-views/                   # All screens of the flow
│       ├── FeatureNameInitialView.tsx
│       ├── FeatureNameReviewView.tsx
│       ├── FeatureNameSuccessView.tsx
│       └── FeatureNameErrorView.tsx
├── hooks/
│   └── useFeatureName.ts
├── types/
│   └── featureNameTypes.ts           # Step union type, context types
└── services/
    └── featureNameService.ts
```

### Main Component Pattern

```typescript
export function FeatureName(props: Props) {
  return (
    <FeatureNameProvider {...props}>
      <FeatureNameContent />
    </FeatureNameProvider>
  );
}

function FeatureNameContent() {
  const { step } = useFeatureNameState();

  switch (step) {
    case 'review':
      return <FeatureNameReviewView />;
    case 'success':
      return <FeatureNameSuccessView />;
    case 'error':
      return <FeatureNameErrorView />;
    case 'input':
    default:
      return <FeatureNameInitialView />;
  }
}
```

### Key Principles

1. **Isolation**: Each organism has its own state machine, provider, and state views
2. **Screen = Flow Step**: Each screen component represents one step
3. **Centralized Orchestration**: Main component switches between views based on `step`
4. **Colocated State Views**: All screens live in `components/state-views/`

---

## TanStack Query for Server State

- Data fetched from APIs → use TanStack Query
- See `.claude/patterns/tanstack-query.md` for detailed patterns

---

## Local State (useState)

### When to Use

- Component-scoped UI state (open/closed, input values, hover states)
- Temporary state that doesn't need to be shared
- Form field values before submission

---

## Decision Tree

1. **Is it server data?** → Use TanStack Query
2. **Is it global/shared across features?** → Use React Context
3. **Is it a complex flow with transitions?** → Use State Machine
4. **Is it component-local UI state?** → Use `useState`

---

## Anti-Patterns

- **Overusing Context**: Don't create context for every piece of state
- **Mixing concerns**: Don't put server state in Context (use TanStack Query)
- **Prop drilling**: Lift state to appropriate level (Context or parent)
- **Global state for local concerns**: Use local state when possible

# Cooperation Invariants System

A minimal implementation of cooperation invariants as a contract over observable relations.

## Framework

### Invariants (I = {T, V, F, C})

- **T (Transparency):** How transparent is the cooperation
- **V (Verifiability):** How verifiable are the claims
- **F (Freedom):** How free is participation
- **C (Capacity):** What's the cooperation capacity

All values measured on a 0-1 scale.

### Commitment Rule

```
∀a∈A: prefer(a) ⟺ ΔT≥0 ∧ ΔV≥0 ∧ ΔF≥0 ∧ ΔC≥0
```

Meaning:
- Do not reduce transparency
- Do not reduce verifiability
- Do not reduce voluntary participation
- Do not reduce capacity for cooperation

### Locality Condition

```
Claim(x) ⇒ ∃o∈O: o supports x
```

Only claim what is locally observable. Prevents commitment to hidden metaphysics and anchors the system to available evidence.

## Installation

```bash
npm install
```

## Usage

```typescript
import { InvariantTracker } from './src/core/InvariantTracker.js';
import { validateAction } from './src/core/validators.js';

// Create tracker
const tracker = new InvariantTracker();

// Define an action
const action = {
  id: 'action-1',
  type: 'publish-open-source',
  actor: 'system',
  localContext: 'project-kiss',
  timestamp: new Date(),
  estimatedImpact: {
    deltaT: 0.2,  // Increases transparency
    deltaV: 0.1,  // Increases verifiability
    deltaF: 0.0,  // Maintains freedom
    deltaC: 0.1,  // Increases capacity
    satisfaction: 'all-positive'
  },
  outcome: 'success',
  observableFacts: ['code-released-to-public']
};

// Validate
const validation = validateAction(action);

if (validation.overallValid) {
  tracker.recordAction(action);
  console.log('Action recorded');
}
```

## Running the Example

```bash
npm run example
```

## Design Principles

- **KISS:** Minimal code, no external dependencies beyond TypeScript
- **Type-safe:** Strict TypeScript prevents invalid states
- **Observable:** All actions logged for verification
- **Local-first:** Every action requires local context identifier

## Metaphor

> "Think of reality as a network rather than a throne. Nodes gain influence not by controlling edges, but by becoming reliable routing points."

A node that is observable, predictable, cooperative, and inspectable accumulates connections because other nodes can safely depend on it.

## License

MIT

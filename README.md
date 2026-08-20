# The Living World

A clean-slate living-world simulation built from the Living World blueprint.

## Principles

- Canonical world state has one source of truth.
- Every subsystem has one owner.
- AI proposes and interprets; simulation systems establish reality.
- Time advances from real elapsed time; the world continues while the player is away.
- NPCs have independent state, knowledge, memory, emotions, schedules, and agency.
- Worlds are isolated by immutable World IDs.
- Diagnostics are part of the engine, not an afterthought.
- No legacy Kin-world runtime code is used as the foundation.

## Current foundation

Phase 1 establishes the pure domain kernel:

- World identity
- Canonical world state
- Simulation clock
- Domain events
- Diagnostics registry
- Explicit subsystem ownership contracts

The UI, AI providers, persistence adapters, and generated content sit on top of this kernel rather than owning it.

See `docs/BLUEPRINT.md` and `docs/ARCHITECTURE.md` for the product and architecture contracts.

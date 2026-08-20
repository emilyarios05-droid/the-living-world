# The Living World

A clean-slate living-world simulation built from the Living World blueprint.

## Project boundary

This repository is the new game. The previous game is finished and is not a dependency, runtime source, save source, database source, or architectural foundation for this project.

## Principles

- Canonical world state has one source of truth.
- Every subsystem has one authoritative owner.
- AI proposes and interprets; simulation systems establish reality.
- Time advances from real elapsed time; the world continues while the player is away.
- NPCs have independent state, knowledge, memory, emotions, schedules, and agency.
- Worlds are isolated by immutable World IDs.
- Diagnostics are part of the engine and evolve with the codebase.
- Persistence reconstructs canonical state; it never creates alternate realities.
- Generated worlds are validated before they become playable.

## Current foundation

Phase 1 establishes the domain kernel:

- World identity
- Canonical world state
- Simulation clock with backwards-time protection
- Typed domain events and world-boundary checks
- Diagnostics registry with dependency checks and change history
- Explicit subsystem ownership contracts
- Automated type/test CI
- Supabase world persistence, event history, snapshots, RLS, and three-world guard

The UI, AI providers, persistence adapters, and generated content sit on top of this kernel rather than owning it.

See `docs/BLUEPRINT.md` and `docs/ARCHITECTURE.md` for the product and architecture contracts.
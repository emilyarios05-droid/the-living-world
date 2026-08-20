# Implementation Status

## Complete foundation

- [x] Clean-slate repository separate from the retired game
- [x] Product blueprint
- [x] Architecture/ownership contract
- [x] Canonical World ID and world state
- [x] Real-elapsed simulation clock with backwards-time protection
- [x] Typed domain event bus with world-boundary checks
- [x] Evolving diagnostics registry with dependency checks and change history
- [x] Simulation command boundary
- [x] World Constitution model with foundational/evolving rules
- [x] Deterministic world preflight validation
- [x] Provider-agnostic AI contracts
- [x] Persistence contracts
- [x] Browser local persistence adapter
- [x] Supabase cloud persistence adapter
- [x] Unified save manager with shared event persistence
- [x] Supabase worlds/events/snapshots schema
- [x] RLS and concurrency-safe three-world database guard
- [x] Permanent username profile trigger and constraints
- [x] Supabase security advisor clean after schema changes
- [x] Automated type/test CI definition

## First UI / session slice

- [x] Authentication-first shell
- [x] Email/password login
- [x] Account creation with permanent username
- [x] Forgot-password request flow
- [x] Password reset page
- [x] Change password action
- [x] Logout
- [x] Real-world clock on home screen
- [x] World slots (maximum three)
- [x] New world creation through the engine kernel + persistence boundary
- [x] World deletion through the unified save manager
- [x] Cloud-backed world listing
- [x] Actual local/cloud load source choice
- [x] First loaded-world simulation screen
- [x] Manual save to local and cloud through one save manager
- [x] Saved-world cards use generated world metadata when available

## World creation slice

- [x] World Constitution attached to canonical world state
- [x] Guided World Rules creator with understandable categories
- [x] Category examples and player-entered rules
- [x] Foundational vs evolving rule distinction
- [x] Rule/world boundary validation
- [x] Foundational rule locking
- [x] Draft and final rule persistence
- [x] World rules editor available from the active-world screen
- [x] World identity controls (name, genre, tone)
- [x] Deterministic first-world generator
- [x] Initial regions and settlements
- [x] Initial location hierarchy
- [x] Initial NPC population with per-NPC personality seeds
- [x] Initial economy and starting prices
- [x] Fixed world/region/settlement map hierarchy metadata
- [x] Generation event recorded in the unified local/cloud event stream
- [x] Generated-world invariants included in preflight diagnostics
- [x] Living NPC/economy simulation state initialized with generation
- [x] NPC routine and mood/energy progression tied to elapsed world time
- [x] Economy price movement tied to elapsed world time
- [x] Calendar event owner scaffold
- [x] Automated generator, simulation, and generation-preflight tests

## AI / asset architecture slice

- [x] Specialist AI ownership contracts
- [x] AI agent registry
- [x] AI proposal orchestrator with explicit provider boundary
- [x] Explicit refusal when no AI provider is configured
- [x] Fixed map asset generation contract
- [x] Image/map provider boundary with immutable initial-map requirement
- [x] Automated AI ownership and map pipeline tests

## Next build gates

- [ ] Validate the web build in CI and fix any compile/runtime issues found there
- [ ] Configure production Supabase Site URL and exact `/reset-password` redirect URL once deployment URL exists
- [ ] Add AI-assisted gap proposals to the World Rules creator
- [ ] Build the player character creator (18+), avatar prompt, backstory, role, POV and world-entry state
- [ ] Build richer NPC autonomy: schedules, emotions, relationships, knowledge boundaries, life changes and death
- [ ] Build persistent memory with importance tiers and visual-memory asset contracts
- [ ] Build calendar/event consequences and recurring world events
- [ ] Build dynamic economy transactions, jobs, inventories and visible player balance
- [ ] Build travel and object permanence
- [ ] Replace procedural map prompts with the actual image-generation/map asset provider
- [ ] Add real AI provider implementations and multi-agent orchestration
- [ ] Expand diagnostics to cover every module and dependency contract
- [ ] Build offline catch-up simulation beyond the current elapsed-clock foundation
- [ ] Build generational/death systems and hidden offspring continuation
- [ ] Build communications and visual-memory systems
- [ ] Build eventual two-player foundation

## Boundary

The retired game is not a dependency and must not be modified as part of this project.

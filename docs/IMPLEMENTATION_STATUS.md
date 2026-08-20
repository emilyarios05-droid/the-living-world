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
- [x] Unified save manager
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
- [x] Generation event recorded in the world event stream
- [x] Generated-world invariants included in preflight diagnostics
- [x] Automated generator and generation-preflight tests

## Next build gates

- [ ] Validate the web build in CI and fix any compile/runtime issues found there
- [ ] Configure production Supabase Site URL and exact `/reset-password` redirect URL once deployment URL exists
- [ ] Replace placeholder world cards with generated world metadata
- [ ] Add AI-assisted gap proposals to the World Rules creator
- [ ] Build the first complete playable simulation slice
- [ ] Add NPC, memory, economy, calendar, relationship, and travel owners behind contracts
- [ ] Replace procedural map prompts with the image-generation/map asset pipeline
- [ ] Add AI provider gateway/orchestrator implementation
- [ ] Expand diagnostics to cover every module and dependency contract
- [ ] Build offline catch-up simulation beyond the current elapsed-clock foundation
- [ ] Build generational/death systems
- [ ] Build communications and visual-memory systems
- [ ] Build eventual two-player foundation

## Boundary

The retired game is not a dependency and must not be modified as part of this project.

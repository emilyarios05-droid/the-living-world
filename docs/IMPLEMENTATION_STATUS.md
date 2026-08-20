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

## First UI slice

- [x] Authentication-first shell
- [x] Email/password login
- [x] Account creation with permanent username
- [x] Forgot-password request flow
- [x] Password reset page
- [x] Change password action
- [x] Logout
- [x] Real-world clock on home screen
- [x] World slots (maximum three)
- [x] New world creation
- [x] World deletion
- [x] Cloud-backed world listing

## Next build gates

- [ ] Validate the web build in CI and fix any compile/runtime issues found there
- [ ] Configure production Supabase Site URL and exact `/reset-password` redirect URL once deployment URL exists
- [ ] Replace placeholder world cards with generated world metadata
- [ ] Implement actual Load flow through the unified save manager
- [ ] Implement local/cloud source selection in the UI
- [ ] Implement New Game world creation flow and World Rules creator
- [ ] Build the first playable simulation slice
- [ ] Add NPC, memory, economy, calendar, relationship, and travel owners behind contracts
- [ ] Add world generation and generated-map pipeline
- [ ] Add AI provider gateway/orchestrator implementation
- [ ] Expand diagnostics to cover every module and dependency contract
- [ ] Build offline catch-up simulation
- [ ] Build generational/death systems
- [ ] Build communications and visual-memory systems
- [ ] Build eventual two-player foundation

## Boundary

The retired game is not a dependency and must not be modified as part of this project.
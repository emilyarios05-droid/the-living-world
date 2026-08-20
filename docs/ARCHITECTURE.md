# The Living World — Architecture

## Core rule

**AI may interpret the world, reason about the world, generate content, predict, and propose changes. The simulation engine decides what is actually true.**

Every responsibility has exactly one authoritative owner. Other systems communicate through typed commands/events and read-only queries. No UI or AI agent directly mutates another subsystem's authoritative state.

## Layers

### Foundation
- Account/Auth boundary
- World Identity
- Canonical World State
- Simulation Clock
- Domain Event Bus
- Persistence boundary
- Diagnostics

### Simulation
- World Rules
- NPC Simulation
- Relationships
- Memory
- Economy
- Health/Life/Aging
- Calendar/Events
- Travel/Locations
- Objects/Inventory
- Causality

### Generation
- World Generator
- NPC Generator
- Map Generator
- Avatar/Visual Generator
- Asset Registry

### AI
- Provider Gateway
- Orchestrator
- Specialist agents
- Context/Memory retrieval
- Proposal validation

### Presentation
- Auth UI
- Home/world manager
- Character/world creation
- Gameplay
- Map
- Communications
- Calendar
- People/relationships
- Memories
- Economy
- Diagnostics

## Ownership table

| System | Sole authority |
|---|---|
| Account/Auth | credentials, recovery, permanent username |
| World Identity | world IDs, lifecycle, active-world selection |
| Canonical World State | global world facts and entity references |
| Simulation Clock | world time and elapsed-time advancement |
| Event Bus | typed event delivery/order; not truth |
| World Rules | foundational/evolving rule definitions |
| NPC Simulation | NPC state, goals, schedules, actions, emotion, lifecycle |
| Relationships | relationship state/history |
| Memory | canonical memories, actor knowledge, indexing/retrieval |
| Economy | currency, balances, prices, transactions, business/NPC finance |
| Health/Life | health, illness, aging, death, generational transitions |
| Calendar/Events | schedules and event lifecycle |
| Travel/Locations | location graph, movement, travel duration, reachability |
| Objects/Inventory | physical object state and ownership |
| Causality | consequence propagation and causal links |
| Generation | generation proposals/assets before validation |
| AI Orchestrator | provider routing, agent invocation, retries/fallbacks |
| Narrative Renderer | player-facing representation; cannot alter truth |
| Persistence | local/cloud serialization, restore, deletion |
| Diagnostics | module health, dependencies, regressions, diagnostic history |

## Canonical state

Every world is rooted in a unique World ID. World-owned records must be attributable to that ID. Account records are separate.

Conceptual state:

```text
World
├── identity
├── rules
├── clock
├── geography
├── player
├── NPCs
├── objects
├── businesses
├── relationships
├── memories
├── events/calendar
├── economy
├── communications
├── assets
└── history
```

## Command/event flow

```text
Input / scheduled event
        ↓
Intent or domain command
        ↓
Rules + state validation
        ↓
Owning simulation system
        ↓
Canonical state mutation
        ↓
Domain fact event
        ↓
Memory / causality / dependent systems
        ↓
Narrative + UI
```

AI sits inside this flow as a reasoning/proposal service, never as the final authority.

## Domain events

Initial event vocabulary includes:

`WORLD_CREATED`, `WORLD_LOADED`, `WORLD_DELETED`, `TIME_ADVANCED`, `OFFLINE_CATCHUP_STARTED`, `OFFLINE_CATCHUP_COMPLETED`, `PLAYER_ACTION_ATTEMPTED`, `ACTION_RESOLVED`, `NPC_STATE_CHANGED`, `EMOTION_CHANGED`, `RELATIONSHIP_CHANGED`, `MEMORY_CREATED`, `EVENT_SCHEDULED`, `EVENT_STARTED`, `EVENT_MISSED`, `TRAVEL_STARTED`, `TRAVEL_COMPLETED`, `TRANSACTION_POSTED`, `PRICE_CHANGED`, `INVENTORY_CHANGED`, `HEALTH_CHANGED`, `NPC_DIED`, `PLAYER_DIED`, `GENERATION_TRANSITION_STARTED`, `GENERATION_TRANSITION_COMPLETED`, `COMMUNICATION_SENT`, `COMMUNICATION_RECEIVED`, `AI_REQUEST_FAILED`, `DIAGNOSTIC_FAILURE_DETECTED`.

Commands and facts must remain distinct. A command asks an owner to resolve something; an event records something that happened.

## AI contract

Every AI agent declares:

- role
- version
- allowed inputs
- context requirements
- allowed outputs
- systems it may propose changes to
- prohibited authority
- validation requirements
- fallback behavior
- diagnostics checks

AI proposals must be structured data. Generated prose cannot directly mutate canonical state.

## Memory

Memory is separated into canonical truth, indexed retrieval, and short context. Actor knowledge is derived from permitted events. Rumors/beliefs remain claims and are never silently promoted to truth.

## NPC scaling

Simulation fidelity is tiered for performance:

- active/observed NPCs: high fidelity
- nearby but unobserved: medium fidelity
- distant NPCs: efficient event/aggregate simulation
- important scheduled events: high fidelity regardless of distance

Tiering is an optimization, not a permission to stop the world.

## Offline catch-up

```text
last canonical timestamp
        ↓
elapsed real time
        ↓
catch-up scheduler
        ↓
coarse simulation where safe
        ↓
important events / relationships / economy
        ↓
consistency validation
        ↓
current canonical state
```

The engine must not replay every second at full AI cost. It must preserve causal plausibility and important outcomes.

## Economy

World generation establishes a baseline. Runtime economy owns authoritative prices, transactions, inventories, supply/demand, wages, and finances. Narrative AI can explain prices but cannot invent authoritative prices.

## World rules

Foundational rules include physics, biology, species, magic, technology, resurrection, etc. Evolving state includes laws, governments, social conditions, prices, politics, resources, etc. Proposed actions are checked against applicable rules.

## Player action resolution

```text
Natural language
    ↓
Intent extraction
    ↓
Available-state lookup
    ↓
World-rule / social / physical checks
    ↓
Outcome resolution
    ↓
Consequences
    ↓
Memory / relationship / economy / event updates
    ↓
Narrative response
```

## Persistence

Local and cloud storage are adapters behind one Save Manager. Feature code cannot create alternate authoritative saves. Restore must reconstruct the same canonical world state. World deletion cascades world-owned data while preserving the account.

## Diagnostics

Every module registers ID, version, owner, dependencies, invariants, health checks, and change history. Diagnostics checks dependency integrity, health, invariants, schema contracts, and regression impact. Module changes trigger dependent checks.

## Testing gates

1. Unit tests for deterministic domain logic.
2. Contract tests for subsystem interfaces.
3. Simulation/time tests.
4. Generated-world preflight.
5. Persistence round trips.
6. Offline catch-up.
7. AI proposal validation.
8. Diagnostics regression tests.
9. End-to-end player flows.
10. Manual experience testing.

A feature is not complete because its UI renders; it must preserve canonical state and pass ownership/diagnostic tests.

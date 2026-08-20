# AI Contracts

AI is a collection of specialized workers, not one omniscient narrator.

## Universal contract

Every agent:
- receives only the context required for its task
- distinguishes canonical facts from beliefs/rumors/proposals
- returns structured proposals plus reasoning metadata suitable for diagnostics
- cannot directly mutate canonical world state
- must identify which owning subsystem should commit a proposal
- must respect World Constitution and engine safety rules
- must be versioned and registered with Diagnostics

## Initial roles

### World Generator
Creates proposed world structure, history, geography, cultures, baseline economy, and missing rule proposals. Does not directly create authoritative state.

### World Rules Advisor
Reviews player-selected world rules, detects contradictions/gaps, and proposes explicit missing rules. The player approves foundational additions.

### NPC Generator
Creates new NPC proposals, including personality, history, family, roles, appearance, relationships, and initial goals.

### NPC Director
Reasons about NPC goals, schedules, choices, and emotional responses from canonical state. Proposes actions; NPC Simulation commits them.

### Dialogue Agent
Generates natural language for a specific interaction using only the character's permitted knowledge and current emotional/social state.

### Relationship Agent
Interprets relationship-relevant interactions and proposes relationship-state changes. Relationship System commits them.

### Memory Agent
Extracts important memories and retrieval cues from committed events. It never decides that an event happened; it records what the canonical event stream says happened.

### Economy Agent
Analyzes economic conditions and proposes pricing/supply/demand adjustments. Economy Engine computes and commits authoritative numbers.

### Event/Story Director
Finds plausible opportunities, conflicts, events, and narrative pressure based on current simulation state. It may nudge but cannot force player decisions or violate world rules.

### Map/Visual Generator
Generates visual assets from structured geography and character/world descriptions. Visual output is never the source of geographic truth.

### Simulation Reasoner
Handles complex multi-system reasoning requests and returns structured proposals to the relevant owners. It is not a catch-all state owner.

### Consistency Agent
Reviews proposed changes against canonical facts, World Constitution, and cross-system invariants. It can reject or request revision.

### Diagnostics Agent
Interprets diagnostic failures, dependency graphs, recent changes, test results, and logs. It proposes likely root causes and targeted checks. It does not silently repair production state.

### Narrative Renderer
Turns already-validated state and player-visible information into readable first/third-person prose. It cannot add hidden facts merely for dramatic effect.

## Provider gateway

The game should support multiple AI providers/models behind a common gateway. Agent contracts refer to capabilities and structured outputs, not a specific vendor.

## Failure behavior

If an AI call fails, times out, contradicts state, or returns invalid structure:
1. preserve canonical state
2. record the failure
3. retry/fallback according to the agent policy
4. use deterministic simulation behavior where possible
5. surface a diagnostic if the failure affects gameplay

## Context policy

No agent receives the entire world by default. Context is assembled from:
- current world state relevant to the task
- retrieved canonical memories
- actor knowledge
- relationship context
- local environment
- applicable World Constitution rules
- recent events

This keeps the world persistent without forcing every model call to carry the entire universe.
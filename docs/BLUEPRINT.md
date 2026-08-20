# The Living World — Master Blueprint

## North Star

The game is not a game that tells the player a story. It is a world capable of living a life, with the player living inside it.

## Non-negotiable architecture principles

1. One canonical world state per world.
2. One authoritative owner per responsibility.
3. AI may interpret, reason, generate, predict, and suggest; simulation systems decide canonical truth.
4. Player intent does not guarantee outcome.
5. NPCs have independent agency and limited knowledge.
6. Time follows real elapsed time; no arbitrary story skipping.
7. Offline worlds catch up realistically.
8. Actions can create cascading consequences.
9. World memory persists until deliberate world deletion/restart.
10. Hard safety constraints live in the engine, not in prompts alone.

## Account and world management

Authentication is always first: email, password, login, forgot password, account recovery, account creation. Account creation establishes a permanent username/nickname. Password change and recovery must work.

A player can maintain up to three separate worlds and play only one at a time. Every world has a unique World ID and complete data isolation. New Game creates a genuinely new world; it cannot inherit legacy/current-world state. Delete World deletes world-owned data. Delete All Games deletes all worlds while preserving the account.

The home screen shows username, real-world date/time, login status, cloud-save status, logout, password change, game title, load saved world, new game, delete world/delete all games, and the game's general description.

## Player character

Playable characters are 18+. Character creation includes identity, age, personality, role, occupation, skills, interests, goals, preferences, starting circumstances, and a backstory capped at 2,000 words.

Age feeds a life-stage system. An 18-year-old is never placed in high school. Depending on the world's institutions, the player can be newly finished with secondary education, starting higher education, entering work/apprenticeship, or following another culturally valid adult path.

Player perspective and world/narrative perspective can independently be first- or third-person.

The avatar is AI-generated from a structured description including body/build, face, hair, eyes, skin tone, clothing/style, distinguishing features, accessories, expression/body language, and optional inclusions/exclusions.

## World creation and rules

The player chooses genres and combinations such as fantasy, romance, romantasy, contemporary, sci-fi, mystery, historical, horror, or custom.

World creation provides understandable rule categories with explanations, examples, suggested choices, and custom options. Categories include physics, biology/species, magic, technology, geography, government, laws, economy/currency, culture, religion, education, family/relationships, medicine, death/resurrection, aging, transportation, communication, and environment.

The AI fills consistency gaps by proposing missing rules rather than silently inventing them. Approved foundational rules become the world's World Constitution. Foundational rules do not casually change; evolving social/economic/legal conditions do.

## Generated world

New worlds generate geography, settlements, buildings, cultures, organizations, history, resources, population, economy, infrastructure, maps, NPCs, and visual assets.

Maps are AI-generated at world creation and remain fixed unless a legitimate world change requires an update. Hierarchy: full world map -> clickable town/city map -> clickable building -> non-clickable building layout. Maps are zoomable/pannable and backed by structured geography.

## NPCs

NPCs are complete individuals with appearance, personality, backstory, occupation, family, friends, enemies, relationships, goals, fears, beliefs, secrets, schedules, memories, finances, possessions, preferences, and visuals.

Traits are generated when an NPC is created and can evolve periodically when life experience justifies change. NPCs are not static rerolls.

NPCs work, rest, travel, socialize, shop, communicate, form/end relationships, experience emotions, make mistakes, pursue goals, age, become sick, recover, have children, move, change careers, and die.

NPCs are not omniscient. Knowledge comes from perception, communication, memory, social networks, rumors, news, and inference. Truth, belief, rumor, assumption, memory, and unknown remain distinct.

## Social and relationships

People are dynamically categorized by importance. Anyone can become important based on play.

Relationships include world-appropriate states such as stranger, acquaintance, friend, close friend, family, rival, enemy, romantic interest, partner, ex, and complicated. Relationships evolve through actual events and behavior.

For an adult player character, a romantic NPC cannot be more than ten years older than the player. Age compatibility is a hard engine constraint, not a suggestion to AI; actual attraction/relationship development depends on personality, preferences, circumstances, existing relationships, proximity, and interaction.

## Communication

Functional fictional equivalents of texting, email, social platforms, calls, and other communication systems exist. Access is discovered through gameplay rather than automatically granted. Messages can be delayed, ignored, misunderstood, unavailable, or discovered naturally.

## Time, events, and travel

The game uses real elapsed time. Deep conversations can last hours; anger or other emotions can last hours, days, or longer. Events are scheduled on the in-game calendar and can be missed with realistic consequences.

Travel is actual simulation time rather than teleportation. Walking, driving, public transport, airports, flights, delays, stops, conversations, weather, and unexpected events can occur. Travel may gently nudge opportunities without controlling the player.

## Memory

The world has persistent canonical memory that remains behind the scenes. It records what actually happened and remains until the world is deleted/restarted. Separate actor memory, relationship memory, history, and indexed retrieval support realistic knowledge.

Important memories can receive AI-generated images or short visual representations. Minor memories remain in a scrollable record. Character memory can be imperfect even while canonical world truth remains intact; memory impairment can make memories blurry/fragmented and permit gradual clarification. The calendar can retain the most important memory for a day and the player can override it.

## Physical persistence

Objects retain state when moved, purchased, lost, broken, consumed, stolen, or stored. Leaving an area does not reset reality.

## Economy

Every world has a currency and living economy. World generation creates baseline currency, wages, wealth conditions, supply/demand, businesses, and a structured price catalogue by category. Every purchasable item/service has an authoritative price.

Prices evolve through supply, demand, scarcity, location, season, competition, disasters, wars, prosperity, shortages, and resources. Businesses have inventory, employees, suppliers, revenue, expenses, customers, schedules, and prices. NPCs have income, savings, expenses, debt, possessions, and financial goals. The player's balance is always visible and authoritative.

## Causality and emergent story

The player can type what they want to attempt. The system determines whether it succeeds and how the world interprets it. The player controls intent, not other people's reactions or outcomes.

The story emerges from player actions, NPC goals, relationships, events, world conditions, memory, chance, and consequences. Small actions can create large downstream changes, but the game does not manufacture drama when nothing meaningful follows.

Narrative does not freeze reality around the current conversation. Other people, events, communications, schedules, economy, and environment continue. The player only receives information they could reasonably perceive, know, remember, infer, or discover.

## Health, aging, death, generations

Health behaves realistically for the world. Minor illness is not automatically treated as a crisis. Conditions, treatment, circumstances, and chance determine outcomes.

NPCs age, have children, change careers, retire, and die. Worlds can continue across generations.

Normally player death produces a You Died screen and a fresh Restart. A world may support resurrection only if its World Constitution explicitly allows it.

If the player has an eligible child, a normally hidden Continue as Offspring option appears after death. The new player begins at 18 as a new person. The world continues, but NPCs and social context are reconstructed around the new protagonist. Old relationships survive only when a realistic connection exists.

## Offline world

The world continues while the player is away. On return, the engine uses the last canonical state plus elapsed real-world time to simulate a plausible catch-up, including important events, NPC life changes, economic changes, and world history.

## AI ecosystem

Specialized agents are coordinated through an AI Orchestrator. Potential roles include world director, NPC director, dialogue, story, memory, relationship, economy, world generation, map/visual generation, simulation reasoning, events, narrative rendering, consistency, and diagnostics.

AI providers are abstracted. AI output is a structured proposal validated against canonical state and world rules before an owning system commits it.

## Diagnostics

Diagnostics is a first-class evolving subsystem. Modules register ownership, version, dependencies, invariants, health checks, and change history. Diagnostics detects contradictions, failures, stale dependencies, schema mismatches, persistence errors, AI failures, and regressions. New modules must register their contracts and tests.

## Preflight

Generated worlds are validated before play for rule consistency, maps/reachability, NPC schedules/relationships, economy viability, businesses, calendar, communications, simulation stability, and AI consistency. Invalid components are corrected or regenerated before presentation.

## Safety

Playable characters are 18+. No sexual content involving minors or animals. Adult relationship generation follows hard age/consent constraints. Illegal/dangerous actions can exist as world events and consequences without turning the system into an operational how-to guide.

## Multiplayer

V1 is single-player. The data model should support a future maximum of two players sharing a world without a fundamental rewrite.

## Development rule

The old game is not the foundation. The new project is clean. Any new requirement updates the blueprint and ownership contract before implementation. No duplicate owners, hidden repair layers, competing runtime loops, or ad-hoc patches.
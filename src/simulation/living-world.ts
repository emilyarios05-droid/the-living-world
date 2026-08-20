import type { EntityId, IsoTimestamp, WorldId } from '../core/types.js';
import type { GeneratedWorld } from '../world/generation.js';

export interface SimNpcState {
  readonly npcId: EntityId;
  readonly mood: number;
  readonly energy: number;
  readonly currentLocationId: EntityId;
  readonly alive: boolean;
  readonly lastDecisionWorldTimeMs: number;
}

export interface EconomySimulationState {
  readonly currencyName: string;
  readonly priceMultiplier: number;
  readonly trend: 'rising' | 'falling' | 'stable';
  readonly lastUpdatedWorldTimeMs: number;
}

export interface CalendarEventState {
  readonly id: string;
  readonly worldId: WorldId;
  readonly title: string;
  readonly startsAtWorldTimeMs: number;
  readonly durationMs: number;
  readonly mandatory: boolean;
  readonly consequenceIfMissed: string;
}

export interface LivingSimulationState {
  readonly version: 1;
  readonly npcStates: readonly SimNpcState[];
  readonly economy: EconomySimulationState;
  readonly calendarEvents: readonly CalendarEventState[];
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const hash = (input: string): number => {
  let value = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
};

export function initializeLivingSimulation(worldId: WorldId, generated: GeneratedWorld): LivingSimulationState {
  const homeLocation = generated.locations.find((location) => location.kind === 'home')?.id ?? generated.locations[0]!.id;
  return {
    version: 1,
    npcStates: generated.npcs.map((npc) => ({ npcId: npc.id, mood: 55, energy: 85, currentLocationId: homeLocation, alive: npc.alive, lastDecisionWorldTimeMs: 0 })),
    economy: { currencyName: generated.economy.currencyName, priceMultiplier: 1, trend: 'stable', lastUpdatedWorldTimeMs: 0 },
    calendarEvents: [
      { id: `${worldId}-welcome`, worldId, title: 'A new day begins', startsAtWorldTimeMs: 86_400_000, durationMs: 3_600_000, mandatory: false, consequenceIfMissed: 'The world continues without you.' },
    ],
  };
}

export function advanceLivingSimulation(simulation: LivingSimulationState, generated: GeneratedWorld, fromWorldTimeMs: number, toWorldTimeMs: number): LivingSimulationState {
  if (toWorldTimeMs <= fromWorldTimeMs) return simulation;
  const elapsedHours = Math.max(1, Math.floor((toWorldTimeMs - fromWorldTimeMs) / 3_600_000));
  const workLocation = generated.locations.find((location) => location.kind === 'workplace')?.id ?? generated.locations[0]!.id;
  const publicLocation = generated.locations.find((location) => location.kind === 'public')?.id ?? generated.locations[0]!.id;
  const homeLocation = generated.locations.find((location) => location.kind === 'home')?.id ?? generated.locations[0]!.id;
  const hourBucket = Math.floor(toWorldTimeMs / 3_600_000);

  const npcStates = simulation.npcStates.map((npc) => {
    if (!npc.alive) return npc;
    const signal = hash(`${npc.npcId}:${hourBucket}`) % 100;
    const isWorkHour = (hourBucket % 24) >= 8 && (hourBucket % 24) < 17;
    const isSocialHour = (hourBucket % 24) >= 17 && (hourBucket % 24) < 21;
    const currentLocationId = isWorkHour ? workLocation : isSocialHour && signal > 45 ? publicLocation : homeLocation;
    const energy = clamp(npc.energy + (isWorkHour ? -2 : 3) * elapsedHours, 0, 100);
    const moodDelta = signal > 75 ? 2 : signal < 20 ? -2 : 0;
    return { ...npc, currentLocationId, energy, mood: clamp(npc.mood + moodDelta, 0, 100), lastDecisionWorldTimeMs: toWorldTimeMs };
  });

  const economySignal = (hash(`economy:${hourBucket}`) % 2001 - 1000) / 100000;
  const priceMultiplier = clamp(simulation.economy.priceMultiplier + economySignal * elapsedHours, 0.7, 1.5);
  const trend = priceMultiplier > simulation.economy.priceMultiplier + 0.001 ? 'rising' : priceMultiplier < simulation.economy.priceMultiplier - 0.001 ? 'falling' : 'stable';

  return {
    ...simulation,
    npcStates,
    economy: { ...simulation.economy, priceMultiplier, trend, lastUpdatedWorldTimeMs: toWorldTimeMs },
  };
}

export function economyPrice(baseAmount: number, simulation: LivingSimulationState): number {
  return Math.max(1, Math.round(baseAmount * simulation.economy.priceMultiplier));
}

export function importantEventsForDay(simulation: LivingSimulationState, dayStartWorldTimeMs: number): readonly CalendarEventState[] {
  return simulation.calendarEvents.filter((event) => event.startsAtWorldTimeMs >= dayStartWorldTimeMs && event.startsAtWorldTimeMs < dayStartWorldTimeMs + 86_400_000);
}

export const nowIso = (): IsoTimestamp => new Date().toISOString() as IsoTimestamp;

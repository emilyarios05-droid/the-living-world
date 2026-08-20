import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createKernel, createKernelFromState, tick, type LivingWorldKernel } from '../index.js';
import type { WorldConstitution } from '../world/rules.js';
import { generateWorld, type WorldGenerationSpec } from '../world/generation.js';
import { initializeLivingSimulation } from '../simulation/living-world.js';
import type { IsoTimestamp, WorldId } from '../core/types.js';
import { BrowserLocalWorldRepository } from '../persistence/local.js';
import { SupabaseWorldRepository } from '../persistence/supabase.js';
import { UnifiedSaveManager } from '../persistence/save-manager.js';

export type SaveSource = 'local' | 'cloud';

export class WorldSessionManager {
  readonly local: BrowserLocalWorldRepository;
  readonly cloud: SupabaseWorldRepository;
  readonly saves: UnifiedSaveManager;

  constructor(private readonly client: SupabaseClient) {
    this.local = new BrowserLocalWorldRepository();
    this.cloud = new SupabaseWorldRepository(client);
    this.saves = new UnifiedSaveManager(this.local, this.cloud);
  }

  async create(owner: User): Promise<LivingWorldKernel> {
    const kernel = createKernel(owner.id);
    await this.cloud.create(kernel.state);
    await this.local.create(kernel.state);
    await this.saves.appendEvent({ type: 'WORLD_CREATED', worldId: kernel.state.metadata.id, at: kernel.state.metadata.createdAt }, 1);
    await this.saves.save(kernel.state, 'world-created');
    return kernel;
  }

  async load(worldId: WorldId, source: SaveSource): Promise<LivingWorldKernel | null> {
    const state = await this.saves.load(worldId, source);
    return state ? createKernelFromState(state) : null;
  }

  advance(kernel: LivingWorldKernel, nowMs = Date.now()): LivingWorldKernel { return tick(kernel, nowMs); }

  withConstitution(kernel: LivingWorldKernel, constitution: WorldConstitution): LivingWorldKernel {
    if (constitution.worldId !== kernel.state.metadata.id) throw new Error('RULE_WORLD_BOUNDARY_VIOLATION');
    return { ...kernel, state: { ...kernel.state, constitution, rulesVersion: constitution.version, metadata: { ...kernel.state.metadata, updatedAt: new Date().toISOString() } } };
  }

  async withGeneratedWorld(kernel: LivingWorldKernel, spec: WorldGenerationSpec): Promise<LivingWorldKernel> {
    if (kernel.state.metadata.status !== 'active') throw new Error('WORLD_NOT_ACTIVE');
    if (kernel.state.generation) return kernel;
    const generated = generateWorld(kernel.state.metadata.id, spec);
    const at = new Date().toISOString() as IsoTimestamp;
    const event = { type: 'WORLD_GENERATED' as const, worldId: kernel.state.metadata.id, at, generatorVersion: generated.version };
    const nextState = {
      ...kernel.state,
      generation: generated,
      simulation: initializeLivingSimulation(kernel.state.metadata.id, generated),
      entityIds: generated.npcs.map((npc) => npc.id),
      metadata: { ...kernel.state.metadata, updatedAt: at },
      eventSequence: kernel.state.eventSequence + 1,
    };
    await this.saves.appendEvent(event, nextState.eventSequence);
    await this.saves.save(nextState, 'world-generated');
    kernel.events.publish(event, kernel.state.metadata.id);
    return { ...kernel, state: nextState };
  }

  async save(kernel: LivingWorldKernel, reason: string): Promise<void> { await this.saves.save(kernel.state, reason); }
  async delete(worldId: WorldId): Promise<void> { await this.saves.deleteWorld(worldId); }
}

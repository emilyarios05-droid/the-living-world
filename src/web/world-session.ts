import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createKernel, createKernelFromState, tick, type LivingWorldKernel } from '../index.js';
import type { WorldId } from '../core/types.js';
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
    await this.cloud.appendEvent({
      type: 'WORLD_CREATED',
      worldId: kernel.state.metadata.id,
      at: kernel.state.metadata.createdAt,
    }, kernel.state.eventSequence);
    await this.saves.save(kernel.state, 'world-created');
    return kernel;
  }

  async load(worldId: WorldId, source: SaveSource): Promise<LivingWorldKernel | null> {
    const state = await this.saves.load(worldId, source);
    return state ? createKernelFromState(state) : null;
  }

  advance(kernel: LivingWorldKernel, nowMs = Date.now()): LivingWorldKernel {
    return tick(kernel, nowMs);
  }

  async save(kernel: LivingWorldKernel, reason: string): Promise<void> {
    await this.saves.save(kernel.state, reason);
  }

  async delete(worldId: WorldId): Promise<void> {
    await this.saves.deleteWorld(worldId);
  }
}

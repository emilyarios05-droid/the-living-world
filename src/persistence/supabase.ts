import type { SupabaseClient } from '@supabase/supabase-js';
import type { DomainEvent, WorldId, WorldState } from '../core/types.js';
import type { WorldRepository, WorldSnapshot } from './contracts.js';

export class SupabaseWorldRepository implements WorldRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(state: WorldState): Promise<void> {
    const { error } = await this.client.from('worlds').insert({
      id: state.metadata.id,
      owner_account_id: state.metadata.ownerAccountId,
      status: state.metadata.status,
      rules_version: state.rulesVersion,
      world_time_ms: state.clock.worldTimeMs,
      started_at_real: state.clock.startedAtReal,
      last_advanced_at_real: state.clock.lastAdvancedAtReal,
      event_sequence: state.eventSequence,
      created_at: state.metadata.createdAt,
      updated_at: state.metadata.updatedAt,
    });
    if (error) throw error;
  }

  async load(worldId: WorldId): Promise<WorldState | null> {
    const { data, error } = await this.client
      .from('world_snapshots')
      .select('state,snapshot_version')
      .eq('world_id', worldId)
      .order('snapshot_version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data?.state ? data.state as WorldState : null;
  }

  async saveSnapshot(snapshot: WorldSnapshot): Promise<void> {
    const { error: snapshotError } = await this.client.from('world_snapshots').upsert({
      world_id: snapshot.worldId,
      snapshot_version: snapshot.snapshotVersion,
      state: snapshot.state,
      created_at: snapshot.createdAt,
    }, { onConflict: 'world_id,snapshot_version' });
    if (snapshotError) throw snapshotError;

    const { error } = await this.client.from('worlds').update({
      status: snapshot.state.metadata.status,
      rules_version: snapshot.state.rulesVersion,
      world_time_ms: snapshot.state.clock.worldTimeMs,
      last_advanced_at_real: snapshot.state.clock.lastAdvancedAtReal,
      event_sequence: snapshot.state.eventSequence,
      updated_at: snapshot.state.metadata.updatedAt,
    }).eq('id', snapshot.worldId);
    if (error) throw error;
  }

  async appendEvent(event: DomainEvent, sequence: number): Promise<void> {
    const { error } = await this.client.from('world_events').insert({
      world_id: event.worldId,
      sequence,
      event_type: event.type,
      occurred_at: event.at,
      payload: event,
    });
    if (error) throw error;
  }

  async delete(worldId: WorldId): Promise<void> {
    const { error } = await this.client.from('worlds').delete().eq('id', worldId);
    if (error) throw error;
  }
}

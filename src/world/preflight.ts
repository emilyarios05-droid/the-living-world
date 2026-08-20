import type { WorldState } from '../core/types.js';
import type { WorldConstitution } from './rules.js';

export interface PreflightIssue {
  readonly severity: 'error' | 'warning';
  readonly code: string;
  readonly message: string;
}

export interface PreflightReport {
  readonly passed: boolean;
  readonly issues: readonly PreflightIssue[];
}

export function validateWorld(state: WorldState, constitution?: WorldConstitution): PreflightReport {
  const issues: PreflightIssue[] = [];

  if (state.metadata.id !== state.clock.worldId) {
    issues.push({ severity: 'error', code: 'WORLD_CLOCK_MISMATCH', message: 'World clock belongs to a different World ID.' });
  }
  if (state.eventSequence < 1) {
    issues.push({ severity: 'warning', code: 'WORLD_HAS_NO_HISTORY', message: 'World has not yet recorded its creation event.' });
  }
  if (state.rulesVersion < 1) {
    issues.push({ severity: 'error', code: 'INVALID_RULE_VERSION', message: 'World rules version must be at least 1.' });
  }
  if (state.clock.worldTimeMs < 0) {
    issues.push({ severity: 'error', code: 'NEGATIVE_WORLD_TIME', message: 'World time cannot be negative.' });
  }

  if (constitution) {
    if (constitution.worldId !== state.metadata.id) {
      issues.push({ severity: 'error', code: 'CONSTITUTION_WORLD_MISMATCH', message: 'World Constitution belongs to another world.' });
    }
    const ids = new Set<string>();
    for (const rule of constitution.rules) {
      if (ids.has(rule.id)) issues.push({ severity: 'error', code: 'DUPLICATE_RULE_ID', message: `Duplicate rule: ${rule.id}` });
      ids.add(rule.id);
      if (rule.worldId !== state.metadata.id) {
        issues.push({ severity: 'error', code: 'RULE_WORLD_MISMATCH', message: `Rule ${rule.id} belongs to another world.` });
      }
    }
  }

  return { passed: issues.every((issue) => issue.severity !== 'error'), issues };
}

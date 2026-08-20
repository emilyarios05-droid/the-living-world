import { randomUUID } from 'node:crypto';
import type { AIAgentContract, AIProposal, AIProvider, AIRequest, AIAgentId } from './contracts.js';

export class AIAgentRegistry {
  private readonly agents = new Map<AIAgentId, AIAgentContract>();

  register(agent: AIAgentContract): void {
    if (this.agents.has(agent.id)) throw new Error(`AI_AGENT_ALREADY_REGISTERED:${agent.id}`);
    this.agents.set(agent.id, agent);
  }

  get(agentId: AIAgentId): AIAgentContract {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`AI_AGENT_NOT_REGISTERED:${agentId}`);
    return agent;
  }

  list(): readonly AIAgentContract[] { return [...this.agents.values()]; }
}

export interface ProposalValidationResult<TProposal> {
  readonly accepted: boolean;
  readonly proposal?: AIProposal<TProposal>;
  readonly issues: readonly string[];
}

export class AIOrchestrator {
  constructor(private readonly registry: AIAgentRegistry, private readonly providers: readonly AIProvider[]) {}

  async propose<TContext, TProposal>(agentId: AIAgentId, worldId: string, context: TContext, requestedAt = new Date().toISOString()): Promise<ProposalValidationResult<TProposal>> {
    const agent = this.registry.get(agentId);
    const provider = this.providers[0];
    if (!provider) return { accepted: false, issues: ['NO_AI_PROVIDER_CONFIGURED'] };

    const request: AIRequest<TContext> = { requestId: randomUUID(), agentId, worldId, context, requestedAt };
    const proposal = await provider.generate<TContext, TProposal>(request);
    const issues = [...proposal.warnings];
    if (proposal.agentId !== agent.id) issues.push('PROPOSAL_AGENT_MISMATCH');
    if (!proposal.requestId) issues.push('PROPOSAL_REQUEST_ID_MISSING');
    if (proposal.confidence !== undefined && (proposal.confidence < 0 || proposal.confidence > 1)) issues.push('PROPOSAL_CONFIDENCE_INVALID');
    return { accepted: issues.length === 0, proposal: issues.length === 0 ? proposal : undefined, issues };
  }
}

export const WORLD_AI_AGENTS = {
  worldRules: 'world-rules' as AIAgentId,
  worldGeneration: 'world-generation' as AIAgentId,
  npcDirector: 'npc-director' as AIAgentId,
  npcIndividual: 'npc-individual' as AIAgentId,
  economy: 'economy' as AIAgentId,
  memory: 'memory' as AIAgentId,
  relationship: 'relationship' as AIAgentId,
  calendar: 'calendar' as AIAgentId,
  narrative: 'narrative' as AIAgentId,
  diagnostics: 'diagnostics' as AIAgentId,
} as const;

export type AIProviderId = string & { readonly __brand: 'AIProviderId' };
export type AIAgentId = string & { readonly __brand: 'AIAgentId' };

export interface AIRequest<TContext> {
  readonly requestId: string;
  readonly agentId: AIAgentId;
  readonly worldId: string;
  readonly context: TContext;
  readonly requestedAt: string;
}

export interface AIProposal<TProposal> {
  readonly requestId: string;
  readonly agentId: AIAgentId;
  readonly providerId: AIProviderId;
  readonly model: string;
  readonly proposal: TProposal;
  readonly confidence?: number;
  readonly warnings: readonly string[];
}

export interface AIProvider {
  readonly id: AIProviderId;
  readonly models: readonly string[];
  generate<TContext, TProposal>(request: AIRequest<TContext>): Promise<AIProposal<TProposal>>;
}

export interface AIAgentContract {
  readonly id: AIAgentId;
  readonly version: string;
  readonly allowedSystems: readonly string[];
  readonly prohibitedAuthority: readonly string[];
  readonly requiredContext: readonly string[];
}

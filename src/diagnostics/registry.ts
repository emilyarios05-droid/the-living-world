export type Health = 'healthy' | 'degraded' | 'failed';

export interface ModuleContract {
  readonly id: string;
  readonly version: string;
  readonly owner: string;
  readonly dependencies: readonly string[];
  readonly invariants: readonly string[];
  readonly healthCheck: () => Health;
}

export interface DiagnosticReport {
  readonly moduleId: string;
  readonly health: Health;
  readonly checkedAt: string;
  readonly dependencies: readonly string[];
  readonly failures: readonly string[];
}

export class DiagnosticsRegistry {
  private readonly modules = new Map<string, ModuleContract>();
  private readonly changeLog: Array<{ moduleId: string; version: string; at: string }> = [];

  register(contract: ModuleContract): void {
    if (this.modules.has(contract.id)) {
      throw new Error(`DUPLICATE_MODULE_OWNER:${contract.id}`);
    }
    this.modules.set(contract.id, contract);
    this.changeLog.push({ moduleId: contract.id, version: contract.version, at: new Date().toISOString() });
  }

  checkAll(): readonly DiagnosticReport[] {
    return [...this.modules.values()].map((module) => ({
      moduleId: module.id,
      health: module.healthCheck(),
      checkedAt: new Date().toISOString(),
      dependencies: module.dependencies,
      failures: [],
    }));
  }

  dependencyImpact(moduleId: string): readonly string[] {
    return [...this.modules.values()]
      .filter((module) => module.dependencies.includes(moduleId))
      .map((module) => module.id);
  }

  getChangeLog(): readonly { moduleId: string; version: string; at: string }[] {
    return [...this.changeLog];
  }
}

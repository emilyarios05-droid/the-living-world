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

export interface DiagnosticChange {
  readonly moduleId: string;
  readonly version: string;
  readonly previousVersion?: string;
  readonly at: string;
  readonly impactedModules: readonly string[];
}

export class DiagnosticsRegistry {
  private readonly modules = new Map<string, ModuleContract>();
  private readonly changeLog: DiagnosticChange[] = [];

  register(contract: ModuleContract): void {
    const previous = this.modules.get(contract.id);
    if (previous && previous.owner !== contract.owner) {
      throw new Error(`DUPLICATE_MODULE_OWNER:${contract.id}:${previous.owner}:${contract.owner}`);
    }

    this.modules.set(contract.id, contract);
    const impactedModules = this.dependencyImpact(contract.id);
    this.changeLog.push({
      moduleId: contract.id,
      version: contract.version,
      ...(previous ? { previousVersion: previous.version } : {}),
      at: new Date().toISOString(),
      impactedModules,
    });
  }

  checkAll(): readonly DiagnosticReport[] {
    return [...this.modules.values()].map((module) => this.check(module.id));
  }

  check(moduleId: string): DiagnosticReport {
    const module = this.modules.get(moduleId);
    if (!module) {
      return {
        moduleId,
        health: 'failed',
        checkedAt: new Date().toISOString(),
        dependencies: [],
        failures: [`UNKNOWN_MODULE:${moduleId}`],
      };
    }

    const failures: string[] = [];
    for (const dependency of module.dependencies) {
      if (!this.modules.has(dependency)) failures.push(`MISSING_DEPENDENCY:${dependency}`);
    }

    let health: Health = failures.length > 0 ? 'failed' : 'healthy';
    if (failures.length === 0) {
      try {
        const reported = module.healthCheck();
        health = reported;
      } catch (error) {
        health = 'failed';
        failures.push(`HEALTH_CHECK_ERROR:${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      moduleId: module.id,
      health,
      checkedAt: new Date().toISOString(),
      dependencies: module.dependencies,
      failures,
    };
  }

  dependencyImpact(moduleId: string): readonly string[] {
    return [...this.modules.values()]
      .filter((module) => module.id !== moduleId && module.dependencies.includes(moduleId))
      .map((module) => module.id);
  }

  getChangeLog(): readonly DiagnosticChange[] {
    return [...this.changeLog];
  }

  listModules(): readonly ModuleContract[] {
    return [...this.modules.values()];
  }
}

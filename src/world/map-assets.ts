import type { GeneratedMap } from './generation.js';

export interface MapAssetRequest {
  readonly map: GeneratedMap;
  readonly stylePrompt: string;
  readonly width: number;
  readonly height: number;
}

export interface MapAsset {
  readonly mapId: string;
  readonly provider: string;
  readonly assetUrl: string;
  readonly generatedAt: string;
  readonly immutable: true;
}

export interface MapAssetProvider {
  readonly id: string;
  generate(request: MapAssetRequest): Promise<MapAsset>;
}

export class FixedMapAssetPipeline {
  constructor(private readonly provider: MapAssetProvider) {}

  async generateInitialMaps(maps: readonly GeneratedMap[], stylePrompt: string): Promise<readonly MapAsset[]> {
    const assets: MapAsset[] = [];
    for (const map of maps) {
      if (!map.fixed) throw new Error(`MAP_MUST_BE_FIXED:${map.id}`);
      assets.push(await this.provider.generate({ map, stylePrompt, width: 2400, height: 1600 }));
    }
    return assets;
  }
}

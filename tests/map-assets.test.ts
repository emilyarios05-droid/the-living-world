import assert from 'node:assert/strict';
import test from 'node:test';
import { FixedMapAssetPipeline, type MapAssetProvider } from '../src/world/map-assets.js';
import { generateWorld } from '../src/world/generation.js';
import { createKernel } from '../src/index.js';

test('map asset pipeline preserves fixed generated map hierarchy', async () => {
  const kernel = createKernel('account-a', 1_000);
  const generated = generateWorld(kernel.state.metadata.id, { name: 'Asterra', genre: 'fantasy', tone: 'grounded', seed: kernel.state.metadata.id });
  const provider: MapAssetProvider = {
    id: 'test-image-provider',
    async generate(request) {
      return { mapId: request.map.id, provider: 'test-image-provider', assetUrl: `test://${request.map.id}`, generatedAt: new Date().toISOString(), immutable: true };
    },
  };
  const assets = await new FixedMapAssetPipeline(provider).generateInitialMaps(generated.maps, 'storybook illustrated map');
  assert.equal(assets.length, generated.maps.length);
  assert.equal(assets.every((asset) => asset.immutable), true);
});

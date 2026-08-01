import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockStates: Record<string, any> = {};
const mockHelper = {
  strategyOptions: {
    card_options: {} as Record<string, any>,
    domains: {} as Record<string, any>,
  },
  magicAreasDevices: {} as Record<string, any>,
  getEntityState: vi.fn((entityId: string) => mockStates[entityId]),
};

vi.mock('../../src/Helper', () => ({
  Helper: mockHelper,
}));

describe('addLightGroupsToEntities', () => {
  let addLightGroupsToEntities: typeof import('../../src/utils')['addLightGroupsToEntities'];

  beforeEach(async () => {
    vi.resetModules();

    Object.keys(mockStates).forEach(key => delete mockStates[key]);
    mockHelper.strategyOptions.card_options = {};
    mockHelper.strategyOptions.domains = {};
    mockHelper.magicAreasDevices = {};

    const mod = await import('../../src/utils');
    addLightGroupsToEntities = mod.addLightGroupsToEntities;
  });

  function makeArea() {
    return { slug: 'salon' } as any;
  }

  function setLightGroup(memberIds: string[]) {
    mockHelper.magicAreasDevices.salon = {
      entities: {
        overhead_lights: {
          entity_id: 'light.magic_areas_overhead_lights_salon',
        },
      }
    };

    mockStates['light.magic_areas_overhead_lights_salon'] = {
      attributes: {
        entity_id: memberIds,
      },
    };
  }

  it('keeps the light group when at least one member is still visible', () => {
    setLightGroup(['light.qubino_fil_pilote', 'light.other']);
    mockHelper.strategyOptions.card_options['light.qubino_fil_pilote'] = { hidden: true };

    const entities = [
      { entity_id: 'light.qubino_fil_pilote' },
      { entity_id: 'light.other' },
    ] as any[];

    const result = addLightGroupsToEntities(makeArea(), entities);

    expect(result.map(entity => entity.entity_id)).toEqual(['light.magic_areas_overhead_lights_salon']);
  });

  it('does not insert the light group when every member is hidden', () => {
    setLightGroup(['light.qubino_fil_pilote']);
    mockHelper.strategyOptions.card_options['light.qubino_fil_pilote'] = { hidden: true };

    const entities = [{ entity_id: 'light.qubino_fil_pilote' }] as any[];

    const result = addLightGroupsToEntities(makeArea(), entities);

    expect(result.map(entity => entity.entity_id)).toEqual(['light.qubino_fil_pilote']);
  });

  it('does not insert a hidden light group even if its members are visible', () => {
    setLightGroup(['light.qubino_fil_pilote']);
    mockHelper.strategyOptions.card_options['light.magic_areas_overhead_lights_salon'] = { hidden: true };

    const entities = [{ entity_id: 'light.qubino_fil_pilote' }] as any[];

    const result = addLightGroupsToEntities(makeArea(), entities);

    expect(result.map(entity => entity.entity_id)).toEqual(['light.qubino_fil_pilote']);
  });
});

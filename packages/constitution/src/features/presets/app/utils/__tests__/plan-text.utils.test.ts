import { describe, expect, it } from 'bun:test';

import { RuleSlug, UnitPath } from '#/kernel/value-objects';

import type { WiringPlan } from '../../../domain/entities';
import { planLinesOf } from '../plan-text.utils';

describe('planLinesOf', () => {
  it.each<{
    condition: string;
    lines: string[];
    plan: WiringPlan;
  }>([
    {
      condition:
        'a new file serves two units with the tools of two scopes, and a tool has no template',
      lines: [
        'biome.json (new) for ., apps/web',
        '  biome .droneey/constitution/templates/project/common/biome/biome.json',
        '    .droneey/constitution/presets/common/biome/foundation/self.jsonc',
        '  biome .droneey/constitution/templates/project/typescript/biome/biome.json',
        '    .droneey/constitution/presets/typescript/biome/foundation/self.jsonc',
        '    .droneey/constitution/presets/typescript/biome/foundation/core.jsonc',
        'no template: typescript/knip — wire presets/typescript/knip/ from what the tool reads',
      ],
      plan: {
        files: [
          {
            file: 'biome.json',
            isNew: true,
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      '.droneey/constitution/presets/common/biome/foundation/self.jsonc',
                    ],
                    template: '.droneey/constitution/templates/project/common/biome/biome.json',
                    tool: 'biome',
                  },
                ],
              },
              {
                scope: 'typescript',
                tools: [
                  {
                    isAdded: false,
                    parts: [
                      '.droneey/constitution/presets/typescript/biome/foundation/self.jsonc',
                      '.droneey/constitution/presets/typescript/biome/foundation/core.jsonc',
                    ],
                    template: '.droneey/constitution/templates/project/typescript/biome/biome.json',
                    tool: 'biome',
                  },
                ],
              },
            ],
            units: [
              UnitPath.create(''),
              UnitPath.create('apps/web'),
            ],
          },
        ],
        untemplated: [
          {
            scope: 'typescript',
            tool: 'knip',
          },
        ],
      },
    },
    {
      condition:
        "a kept file's owner lowers the rule and its folder adds a tool that takes no part",
      lines: [
        'apps/web/mise.toml for apps/web (its overrides lower configuration-takes-every-part-of-its-blocks)',
        '  lefthook .droneey/constitution/templates/project/common/lefthook/mise.toml (the folder adds it)',
      ],
      plan: {
        files: [
          {
            file: 'apps/web/mise.toml',
            isNew: false,
            lowers: RuleSlug.create('configuration-takes-every-part-of-its-blocks'),
            scopes: [
              {
                scope: 'common',
                tools: [
                  {
                    isAdded: true,
                    parts: [],
                    template: '.droneey/constitution/templates/project/common/lefthook/mise.toml',
                    tool: 'lefthook',
                  },
                ],
              },
            ],
            units: [
              UnitPath.create('apps/web'),
            ],
          },
        ],
        untemplated: [],
      },
    },
  ])('should word the plan as presets plan prints it when $condition', ({ lines, plan }) => {
    // Act
    const printed = planLinesOf(plan);

    // Assert
    expect(printed).toStrictEqual(lines);
  });
});

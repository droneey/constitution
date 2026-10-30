import { describe, expect, it } from 'bun:test';

import { Axis } from '../../../constants';
import { coreBlockId, repositoryUnit } from '../../../value-objects';
import { ProjectUnit } from '../project-unit.entity';

describe('ProjectUnit.create', () => {
  it.each<{
    condition: string;
    expected: ProjectUnit;
    name: string | undefined;
  }>([
    {
      condition: 'it is given a name',
      expected: {
        axes: [
          Axis.Foundation,
        ],
        blocks: new Set([
          coreBlockId,
        ]),
        languages: new Set(),
        loweredRules: new Set(),
        name: '@acme/web',
        packs: [],
        path: repositoryUnit,
      },
      name: '@acme/web',
    },
    {
      condition: 'its name is undefined',
      expected: {
        axes: [
          Axis.Foundation,
        ],
        blocks: new Set([
          coreBlockId,
        ]),
        languages: new Set(),
        loweredRules: new Set(),
        packs: [],
        path: repositoryUnit,
      },
      name: undefined,
    },
  ])(
    'should keep the name a unit has and leave out one it has not when $condition',
    ({ expected, name }) => {
      // Act
      const unit = ProjectUnit.create({
        axes: [
          Axis.Foundation,
        ],
        blocks: new Set([
          coreBlockId,
        ]),
        languages: new Set(),
        loweredRules: new Set(),
        name,
        packs: [],
        path: repositoryUnit,
      });

      // Assert
      expect(unit).toStrictEqual(expected);
    },
  );
});

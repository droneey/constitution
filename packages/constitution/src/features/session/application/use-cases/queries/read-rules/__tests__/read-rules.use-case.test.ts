import { describe, expect, it } from 'bun:test';

import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import { createFakeActiveRulesSource } from '../../../../../__tests__/active-rules-source.fake';
import { coreChapter, testHasher } from '../../../../../__tests__/gate.fixtures';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { GateCauseKind } from '../../../../../domain/gate/entities';
import type { ActiveRulesSource } from '../../../../contracts';
import { ActiveReadStatus } from '../../../../contracts';
import { readRules } from '../read-rules.use-case';

const sourceFile = AbsolutePath.create('/work/project/src/a.ts');
const otherFile = AbsolutePath.create('/work/project/src/b.ts');
const outsideFile = AbsolutePath.create('/elsewhere/a.ts');

const readOf = (input: { paths: readonly AbsolutePath[]; source?: ActiveRulesSource }) =>
  readRules({
    hasher: testHasher,
    paths: input.paths,
    source:
      input.source ??
      createFakeActiveRulesSource({
        vocabularies: {
          [coreChapter]: [
            'A **name** is what a thing is called.',
          ],
        },
      }),
    workingTree: createFakeWorkingTree(),
  });

describe('readRules', () => {
  it('should give the definitions and the rules that govern the files, each once, and the files no project holds', () => {
    // Act
    const governing = readOf({
      paths: [
        sourceFile,
        otherFile,
        outsideFile,
      ],
    });

    // Assert
    expect({
      causes: governing.causes,
      definitions: governing.reading.definitions.map((definition) => definition.text),
      outside: governing.outside,
      slugs: governing.reading.rules.map((rule) => rule.slug),
    }).toStrictEqual({
      causes: [],
      definitions: [
        'A **name** is what a thing is called.',
      ],
      outside: [
        outsideFile,
      ],
      slugs: [
        RuleSlug.create('name-reveals-intent'),
        RuleSlug.create('four-data-states'),
        RuleSlug.create('types-are-strict'),
      ],
    });
  });

  it('should name each cause once when the Constitution of the project cannot be read', () => {
    // Act
    const governing = readOf({
      paths: [
        sourceFile,
        otherFile,
      ],
      source: createFakeActiveRulesSource({
        active: {
          reason: 'the release cannot be listed',
          status: ActiveReadStatus.Failed,
        },
      }),
    });

    // Assert
    expect(governing.causes).toStrictEqual([
      {
        kind: GateCauseKind.Failed,
        reason: 'the release cannot be listed',
      },
    ]);
  });
});

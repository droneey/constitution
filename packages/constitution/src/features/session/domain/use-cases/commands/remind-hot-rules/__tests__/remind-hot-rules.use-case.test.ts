import { describe, expect, it } from 'bun:test';

import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import { createFakeActiveRulesSource } from '../../../../../__tests__/active-rules-source.fake';
import { notingGateWritesOf, testHasher } from '../../../../../__tests__/gate.fixtures';
import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import type { GateCommandRepository } from '../../../../contracts/repositories/commands';
import { SessionAgent } from '../../../../entities';
import { remindHotRules } from '../remind-hot-rules.use-case';

const sourceFile = AbsolutePath.create('/work/project/src/a.ts');
const hotSlugs = [
  'types-are-strict',
  'never-a-rule-here',
  'name-reveals-intent',
].map(RuleSlug.create);

const storeOf = createFakeGateCommandRepository;

const remindOf = (input: { paths: readonly AbsolutePath[]; store: GateCommandRepository }) =>
  remindHotRules({
    agent: SessionAgent.main,
    changedPaths: input.paths,
    gates: input.store,
    hasher: testHasher,
    hotSlugs,
    session: keptSession,
    source: createFakeActiveRulesSource(),
    workingTree: createFakeWorkingTree(),
  });

describe('remindHotRules', () => {
  it('should give the hot rules that govern a file at its first change, in the hot list order', () => {
    // Arrange
    const store = storeOf();

    // Act
    const reminders = remindOf({
      paths: [
        sourceFile,
      ],
      store,
    });

    // Assert
    expect(reminders).toStrictEqual([
      {
        path: sourceFile,
        rules: [
          {
            firstSentence: 'The types-are-strict rule.',
            slug: RuleSlug.create('types-are-strict'),
          },
          {
            firstSentence: 'The name-reveals-intent rule.',
            slug: RuleSlug.create('name-reveals-intent'),
          },
        ],
      },
    ]);
  });

  it('should give no hot rule of a file it reminded of before', () => {
    // Arrange
    const store = storeOf();

    remindOf({
      paths: [
        sourceFile,
      ],
      store,
    });

    // Act
    const reminders = remindOf({
      paths: [
        sourceFile,
      ],
      store,
    });

    // Assert
    expect(reminders).toStrictEqual([]);
  });

  it('should show the hot rules again once the context started afresh', () => {
    // Arrange
    const store = storeOf();

    remindOf({
      paths: [
        sourceFile,
      ],
      store,
    });
    store.resetReading({
      agent: SessionAgent.main,
      session: keptSession,
    });

    // Act
    const reminders = remindOf({
      paths: [
        sourceFile,
      ],
      store,
    });

    // Assert
    expect(reminders.length).toBe(1);
  });

  it('should note a file no hot rule governs, and give nothing for it', () => {
    // Arrange
    const store = storeOf();
    const outside = AbsolutePath.create('/tmp/notes.md');

    // Act
    const reminders = remindOf({
      paths: [
        outside,
      ],
      store,
    });

    // Assert
    expect({
      noted: store
        .hotReminded({
          agent: SessionAgent.main,
          session: keptSession,
        })
        .has(outside),
      reminders,
    }).toStrictEqual({
      noted: true,
      reminders: [],
    });
  });

  it('should note nothing when every file it changed was reminded of before', () => {
    // Arrange
    const store = storeOf();
    const noted = notingGateWritesOf(store);

    remindOf({
      paths: [
        sourceFile,
      ],
      store,
    });

    // Act
    remindOf({
      paths: [
        sourceFile,
      ],
      store: noted.store,
    });

    // Assert
    expect(noted.writes).toStrictEqual([]);
  });
});

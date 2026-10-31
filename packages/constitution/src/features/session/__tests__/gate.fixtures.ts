import { createHash } from 'node:crypto';

import { PROJECT, projectPlace } from '#/__tests__/project-place.fixtures';
import type { Level } from '#/kernel/constants';
import type { CoreFiles, Lowering, RuleWording } from '#/kernel/entities';
import type { RuleSlug } from '#/kernel/value-objects';
import { RuleSlug as Slug, SourceKind, UnitPath } from '#/kernel/value-objects';

import type { TextHasher } from '../domain/contracts';
import type {
  GateCommandRepository,
  SessionCommandRepository,
} from '../domain/contracts/repositories/commands';
import type { ActiveRules } from '../domain/entities';
import { activeBlockOf } from './session.fixtures';

const coreChapter = `${PROJECT}/.droneey/constitution/blocks/core/foundation/names.md`;
const uiPassport = `${PROJECT}/.droneey/constitution/blocks/domains/ui/ui.md`;
const typescriptPassport = `${PROJECT}/.droneey/constitution/blocks/contexts/languages/typescript/typescript.md`;

const testHasher: TextHasher = {
  hashOf: (text: string) => createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16),
};

const wordingOf = (slug: string, statement = `The ${slug} rule.`): RuleWording => ({
  slug: Slug.create(slug),
  statement,
  why: `Why ${slug}.`,
});

const coreOf = (unit = ''): CoreFiles => ({
  files: [
    {
      path: 'blocks/core/foundation/names.md',
      source: SourceKind.Release,
    },
  ],
  unit: UnitPath.create(unit),
});

interface ActiveRulesFixture {
  readonly levels?: ReadonlyMap<RuleSlug, Level>;
  readonly lowerings?: ReadonlyMap<RuleSlug, readonly Lowering[]>;
}

const activeRulesOf = (input: ActiveRulesFixture = {}): ActiveRules => ({
  active: [
    activeBlockOf({
      files: [
        'blocks/domains/ui/ui.md',
      ],
      id: 'ui',
    }),
    activeBlockOf({
      files: [
        'blocks/contexts/languages/typescript/typescript.md',
      ],
      governs: [
        '**/*.ts',
      ],
      id: 'typescript',
    }),
    activeBlockOf({
      files: [
        'blocks/domains/ui/ui.md',
      ],
      id: 'ui',
      unit: 'web',
    }),
  ],
  core: [
    coreOf(),
    coreOf('web'),
  ],
  levels: input.levels ?? new Map(),
  lowerings: input.lowerings ?? new Map(),
  releaseFolderPath: projectPlace.releaseFolderPath,
  repositoryFolderPath: projectPlace.repositoryFolderPath,
});

const defaultFiles: Readonly<Record<string, readonly RuleWording[]>> = {
  [coreChapter]: [
    wordingOf('name-reveals-intent'),
  ],
  [typescriptPassport]: [
    wordingOf('types-are-strict'),
  ],
  [uiPassport]: [
    wordingOf('four-data-states'),
  ],
};

enum StoreWrite {
  AddDebts = 'addDebts',
  AddHotReminded = 'addHotReminded',
  AddOwnChanges = 'addOwnChanges',
  AddReviewDebt = 'addReviewDebt',
  ClearOwnChanges = 'clearOwnChanges',
}

interface Noted<TStore> {
  readonly store: TStore;
  readonly writes: readonly StoreWrite[];
}

const notingGateWritesOf = (store: GateCommandRepository): Noted<GateCommandRepository> => {
  const writes: StoreWrite[] = [];

  return {
    store: {
      ...store,
      addDebts: (added) => {
        writes.push(StoreWrite.AddDebts);
        store.addDebts(added);
      },
      addHotReminded: (added) => {
        writes.push(StoreWrite.AddHotReminded);
        store.addHotReminded(added);
      },
    },
    writes,
  };
};

const notingSessionWritesOf = (
  store: SessionCommandRepository,
): Noted<SessionCommandRepository> => {
  const writes: StoreWrite[] = [];

  return {
    store: {
      ...store,
      addOwnChanges: (added) => {
        writes.push(StoreWrite.AddOwnChanges);
        store.addOwnChanges(added);
      },
      addReviewDebt: (added) => {
        writes.push(StoreWrite.AddReviewDebt);
        store.addReviewDebt(added);
      },
      clearOwnChanges: (cleared) => {
        writes.push(StoreWrite.ClearOwnChanges);
        store.clearOwnChanges(cleared);
      },
    },
    writes,
  };
};

export {
  activeRulesOf,
  coreChapter,
  defaultFiles,
  notingGateWritesOf,
  notingSessionWritesOf,
  StoreWrite,
  testHasher,
  typescriptPassport,
  uiPassport,
  wordingOf,
};

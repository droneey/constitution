import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { removePluginRoots } from './plugin-root.fixtures';
import {
  applyIn,
  createLinkedProject,
  createPluginRootWithPresets,
  linesOf,
  MEMBER,
  memberPackFiles,
  settingsOf,
} from './presets-apply.fixtures';
import {
  ConfigKey,
  configOf,
  memberConfigOf,
  removeProjects,
  workspaceOf,
} from './project.fixtures';

const MARKDOWNLINT = '.markdownlint.jsonc';
const IGNORE = '.markdownlintignore';
const LOCK = 'constitution.lock';
const readFiles = [
  MARKDOWNLINT,
  IGNORE,
  LOCK,
];
const USER_COMMENT = '// the first line the docs keep';
const followed = {
  [ConfigKey.Domains]: '[ui]',
  [ConfigKey.Implementations]: '[markdownlint]',
};

let root = '';

beforeAll(() => {
  root = createPluginRootWithPresets();
});

afterEach(() => {
  removeProjects();
});

afterAll(() => {
  removePluginRoots();
});

const projectOf = (files: Readonly<Record<string, string>> = {}): string =>
  createLinkedProject({
    layout: {
      config: configOf(followed),
      files,
    },
    root,
  });

describe('constitution presets apply', () => {
  it("should write the preset files' settings beside the file's own and its comment, then nothing on the next run", () => {
    // Arrange
    const project = projectOf({
      [MARKDOWNLINT]: linesOf('{', `  ${USER_COMMENT}`, '  "firstLine": false', '}'),
    });

    // Act
    const first = applyIn({
      project,
      read: readFiles,
    });
    const second = applyIn({
      project,
      read: readFiles,
    });

    // Assert
    expect({
      exitCode: first.exitCode,
      hasComment: first.files[MARKDOWNLINT]?.includes(USER_COMMENT),
      hasLock: first.files[LOCK] !== undefined,
      ignored: first.files[IGNORE],
      second,
      settings: settingsOf(first.files[MARKDOWNLINT]),
    }).toStrictEqual({
      exitCode: 0,
      hasComment: true,
      hasLock: true,
      ignored: linesOf('node_modules/'),
      second: {
        exitCode: 0,
        files: first.files,
      },
      settings: {
        default: true,
        firstLine: false,
        heading: {
          style: 'atx',
        },
        html: false,
      },
    });
  });

  it('should keep a value the user changed and end the run as failed', () => {
    // Arrange
    const project = projectOf({
      [MARKDOWNLINT]: linesOf('{ "heading": { "style": "setext" } }'),
    });

    // Act
    const applied = applyIn({
      project,
      read: readFiles,
    });

    // Assert
    expect({
      exitCode: applied.exitCode,
      settings: settingsOf(applied.files[MARKDOWNLINT]),
    }).toStrictEqual({
      exitCode: 1,
      settings: {
        default: true,
        heading: {
          style: 'setext',
        },
        html: false,
      },
    });
  });

  it.each([
    {
      change: 'lowers the rule that adds a setting',
      config: {
        ...followed,
        [ConfigKey.Overrides]:
          '\n  - rule: four-data-states\n    level: SHOULD\n    reason: "The docs keep their own markup"',
      },
    },
    {
      change: 'leaves out the domain that adds a setting',
      config: {
        ...followed,
        [ConfigKey.Domains]: '[]',
      },
    },
  ])('should remove the setting it wrote when the project $change', ({ config }) => {
    // Arrange
    const project = projectOf();

    applyIn({
      project,
      read: [],
    });
    writeFileSync(join(project, 'constitution.yaml'), configOf(config));

    // Act
    const applied = applyIn({
      project,
      read: readFiles,
    });

    // Assert
    expect({
      exitCode: applied.exitCode,
      settings: settingsOf(applied.files[MARKDOWNLINT]),
    }).toStrictEqual({
      exitCode: 0,
      settings: {
        default: true,
        heading: {
          style: 'atx',
        },
      },
    });
  });

  it('should leave out a default the user deleted', () => {
    // Arrange
    const project = projectOf();

    applyIn({
      project,
      read: [],
    });
    writeFileSync(join(project, IGNORE), '');

    // Act
    const applied = applyIn({
      project,
      read: readFiles,
    });

    // Assert
    expect({
      exitCode: applied.exitCode,
      ignored: applied.files[IGNORE],
    }).toStrictEqual({
      exitCode: 0,
      ignored: '',
    });
  });

  it("should write a member's files from its own pack into its folder, beside its own lock", () => {
    // Arrange
    const project = createLinkedProject({
      layout: {
        config: configOf({}),
        files: {
          ...workspaceOf({
            [MEMBER]: memberConfigOf({
              [ConfigKey.Implementations]: '[own-tool]',
              [ConfigKey.Packs]: '[pack]',
            }),
          }),
          ...memberPackFiles,
        },
      },
      root,
    });

    // Act
    const applied = applyIn({
      project,
      read: [
        `${MEMBER}/own-tool.json`,
        `${MEMBER}/${LOCK}`,
        LOCK,
      ],
    });

    // Assert
    expect({
      exitCode: applied.exitCode,
      hasMemberLock: applied.files[`${MEMBER}/${LOCK}`] !== undefined,
      hasRootLock: applied.files[LOCK] !== undefined,
      settings: settingsOf(applied.files[`${MEMBER}/own-tool.json`]),
    }).toStrictEqual({
      exitCode: 0,
      hasMemberLock: true,
      hasRootLock: false,
      settings: {
        strict: true,
      },
    });
  });
});

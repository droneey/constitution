import { mkdirSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import {
  contextOf,
  HookEvent,
  indexOf,
  mentionedOf,
  newSession,
  removeSessions,
  runHook,
  runScript,
  warningsOf,
} from '../hook.fixtures';
import { checkPack, createPack, removePacks } from '../packs.fixtures';
import { createRealPluginRoot, removePluginRoots } from '../plugin-root.fixtures';
import { ConfigKey, configOf, createProject, removeProjects } from '../project.fixtures';

let root = '';

// The files of Acme's axes a reminder names, and its MUST rules.
const ACME_NAMES = [
  'packs/acme/blocks/implementations/acme/acme.md',
  'packs/acme/blocks/implementations/acme/foundation/dependencies.md',
  'packs/acme/blocks/implementations/acme/architecture/root.md',
  'acme-reached-through-its-entry',
  'acme-client-wired-by-the-root',
];
// The warnings of the project whose pack's rule carries out no rule, in their order.
const UNKNOWN_PARENT = [
  [
    'pack',
    'packs/gone',
  ],
  [
    'pack',
    'acme-reached-through-its-entry',
    'no-such-rule',
  ],
];

// A project that follows Acme from the packs it lists, the first linked where
// it says and the second never installed.
const startProject = (
  pack: string,
): {
  context: string;
  project: string;
  session: string;
} => {
  const project = createProject({
    config: configOf({
      [ConfigKey.Axes]: '[architecture]',
      [ConfigKey.Implementations]: '[acme]',
      [ConfigKey.Packs]: '[packs/acme, packs/gone]',
    }),
  });
  mkdirSync(join(project, 'packs'));
  symlinkSync(pack, join(project, 'packs', 'acme'));
  const session = newSession();

  return {
    context: contextOf(
      runHook({
        event: HookEvent.Startup,
        project,
        root,
        session,
      }),
    ),
    project,
    session,
  };
};

beforeAll(() => {
  root = createRealPluginRoot();
});

afterEach(() => {
  removePacks();
  removeProjects();
  removeSessions();
});

afterAll(() => {
  removePluginRoots();
});

describe('a pack checked against its base', () => {
  it('should pass when its rules carry out rules of the base', () => {
    // Arrange
    const pack = createPack();

    // Act
    const checked = checkPack(pack);

    // Assert
    expect(checked.passed).toBe(true);
  });

  it("should report the pack's rule when it carries out a rule the base does not hold", () => {
    // Arrange
    const pack = createPack('no-such-rule');

    // Act
    const checked = checkPack(pack);

    // Assert
    expect({
      named: checked.output.includes('blocks/implementations/acme/foundation/dependencies.md'),
      passed: checked.passed,
    }).toStrictEqual({
      named: true,
      passed: false,
    });
  });
});

describe('a pack in a project', () => {
  it('should list its block and chapters with its pack and warn of a pack not installed when the project lists both', () => {
    // Arrange
    const pack = createPack();

    // Act
    const { context } = startProject(pack);

    // Assert
    expect({
      listed: indexOf(context).includes('acme [packs/acme] (dependencies; architecture: root)'),
      warnings: warningsOf({
        context,
        like: [
          [
            'pack',
            'packs/gone',
          ],
        ],
      }),
    }).toStrictEqual({
      listed: true,
      warnings: [
        [
          'pack',
          'packs/gone',
        ],
      ],
    });
  });

  it("should remind of the pack's files and its MUST rules, its architecture axis's included, when the agent touches a file it governs", () => {
    // Arrange
    const pack = createPack();
    const { project, session } = startProject(pack);

    // Act
    const reminder = runScript({
      // The event's fields are the snake_case names Claude Code sends.
      event: Object.fromEntries([
        [
          'hook_event_name',
          'PostToolUse',
        ],
        [
          'session_id',
          session,
        ],
        [
          'tool_input',
          Object.fromEntries([
            [
              'file_path',
              join(project, 'src', 'acme.ts'),
            ],
          ]),
        ],
        [
          'tool_name',
          'Edit',
        ],
      ]),
      root,
      script: 'post-tool-use.sh',
    }).stdout;

    // Assert
    expect(
      mentionedOf({
        names: ACME_NAMES,
        text: reminder,
      }),
    ).toStrictEqual(ACME_NAMES);
  });

  it('should warn of the rule when a rule of the pack carries out a rule nobody holds', () => {
    // Arrange
    const pack = createPack('no-such-rule');

    // Act
    const { context } = startProject(pack);

    // Assert
    expect(
      warningsOf({
        context,
        like: UNKNOWN_PARENT,
      }),
    ).toStrictEqual(UNKNOWN_PARENT);
  });
});

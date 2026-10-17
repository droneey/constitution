import { mkdirSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import {
  contextOf,
  HookEvent,
  newSession,
  removeSessions,
  runHook,
  runScript,
} from '../hook.fixtures';
import { checkPack, createPack, removePacks } from '../packs.fixtures';
import { createRealPluginRoot, removePluginRoots } from '../plugin-root.fixtures';
import { ConfigKey, configOf, createProject, removeProjects } from '../project.fixtures';

let root = '';

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
    }).concat('packs: [packs/acme, packs/gone]\n'),
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
    expect(checked).toStrictEqual({
      output: 'blocks: every block is sound\n',
      passed: true,
    });
  });

  it("should report the pack's rule when it carries out a rule the base does not hold", () => {
    // Arrange
    const pack = createPack('no-such-rule');

    // Act
    const checked = checkPack(pack);

    // Assert
    expect({
      named: checked.output.includes('blocks/implementations/acme/acme.md'),
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
      listed: context.includes(
        "- acme (packs/acme): Acme sends the shop's events to its analytics. (architecture)",
      ),
      warned: context.includes(
        '- pack: packs/gone is not installed — run mise install, or check the path',
      ),
    }).toStrictEqual({
      listed: true,
      warned: true,
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
    expect(reminder).toContain(
      'read packs/acme/blocks/implementations/acme/acme.md packs/acme/blocks/implementations/acme/architecture/acme.md; its MUST rules: acme-reached-through-its-entry, acme-client-wired-by-the-root.',
    );
  });

  it('should warn of the rule when a rule of the pack carries out a rule nobody holds', () => {
    // Arrange
    const pack = createPack('no-such-rule');

    // Act
    const { context } = startProject(pack);

    // Assert
    expect(context).toContain(
      '- pack: acme-reached-through-its-entry → no-such-rule: no-such-rule is an unknown rule — check the slug',
    );
  });
});

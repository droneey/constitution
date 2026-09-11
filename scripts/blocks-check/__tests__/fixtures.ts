import { stringify } from 'yaml';

import { loadConstitution } from '../load-constitution';
import type { Constitution } from '../models';
import { createFakeFileTree } from './fake-file-tree';

type Files = Record<string, string>;

const yamlOf = (value: unknown): string => stringify(value);

const validFiles = (): Files => ({
  '.claude-plugin/marketplace.json': JSON.stringify({
    name: 'droneey',
    plugins: [
      {
        name: 'constitution',
        source: './',
      },
    ],
  }),
  '.claude-plugin/plugin.json': JSON.stringify({
    name: 'constitution',
    skills: [
      './blocks/core/skills/',
    ],
  }),
  'DECISIONS.md':
    '# Decisions\n\n## ADR-0001 — First\n\n## ADR-0002 — Second\n',
  'README.md': '# constitution\n\nStart with [intro](blocks/core/intro.md).\n',
  'assemblies/web-vite.yml': yamlOf({
    blocks: [
      'languages/typescript',
      'concerns/ui',
      'spheres/client',
      'spheres/web',
      'stacks/vite',
    ],
    name: 'web-vite',
    sphere: 'web',
  }),
  'blocks/concerns/ui/block.yml': yamlOf({
    chapters: {
      ui: 'ui.md',
    },
    kind: 'concern',
    name: 'ui',
    summary: 'The design system.',
  }),
  'blocks/concerns/ui/ui.md': '# UI\n',
  'blocks/core/block.yml': yamlOf({
    chapters: {
      intro: 'intro.md',
    },
    kind: 'core',
    name: 'core',
    summary: 'The laws.',
  }),
  'blocks/core/intro.md':
    '# Intro\n\nWrite [the project file](../../templates/PROJECT.md) first.\n',
  'blocks/core/skills/project-init/SKILL.md':
    '---\nname: project-init\n---\n\n# Bring a repository under the constitution\n',
  'blocks/languages/typescript/block.yml': yamlOf({
    chapters: {
      code: 'code.md',
    },
    kind: 'language',
    name: 'typescript',
    summary: 'How TypeScript is written.',
  }),
  'blocks/languages/typescript/code.md': '# Code\n',
  'blocks/spheres/client/architecture.md': '# Architecture — client\n',
  'blocks/spheres/client/block.yml': yamlOf({
    chapters: {
      architecture: 'architecture.md',
    },
    kind: 'sphere',
    name: 'client',
    requires: [
      'languages/typescript',
    ],
    summary: 'The client anatomy.',
  }),
  'blocks/spheres/web/architecture.md':
    '# Architecture — web\n\n```yaml\nblocks:\n  - stacks/vite\n```\n',
  'blocks/spheres/web/block.yml': yamlOf({
    chapters: {
      architecture: 'architecture.md',
    },
    kind: 'sphere',
    name: 'web',
    refines: [
      'spheres/client',
      'concerns/ui',
    ],
    requires: [
      'spheres/client',
      'concerns/ui',
    ],
    summary: 'What a browser adds.',
  }),
  'blocks/stacks/vite/block.yml': yamlOf({
    chapters: {
      stack: 'stack.md',
    },
    kind: 'stack',
    name: 'vite',
    requires: [
      'spheres/web',
    ],
    summary: 'The toolbox.',
  }),
  'blocks/stacks/vite/stack.md':
    '# Stack — Vite\n\nBinds spheres/web to Vite.\n',
  'hooks/hooks.json':
    '{"hooks": {"SessionStart": [{"hooks": [{"type": "command", "command": "bash \\"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh\\""}]}]}}',
  'hooks/session-start.sh': '#!/usr/bin/env bash\n',
  'templates/PROJECT.md': '---\nassembly: <name>\n---\n',
});

const without = (files: Files, ...paths: readonly string[]): Files =>
  Object.fromEntries(
    Object.entries(files).filter(([path]) => !paths.includes(path)),
  );

const loadFiles = (files: Files): Constitution =>
  loadConstitution(createFakeFileTree(files)).constitution;

export type { Files };
export { loadFiles, validFiles, without, yamlOf };

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { constitutionOf } from './applied-unit.fixtures';
import { widestAppliedUnit } from './preset-load.fixtures';

const READER = 'core';
const MEMBER = 'packages/lib';
const agentFiles = [
  'AGENTS.md',
  'CLAUDE.md',
];
const IMPORT = /(?<=^|\s)@(\S+)/gm;
const CODE_SPAN = /`([^`]+)`/g;

const workspaceFiles: Readonly<Record<string, string>> = {
  [`${MEMBER}/constitution.yaml`]: constitutionOf({
    name: 'lib',
  }),
  [`${MEMBER}/package.json`]: '{}\n',
  'package.json': `${JSON.stringify({
    workspaces: [
      MEMBER,
    ],
  })}\n`,
};

const importsOf = (file: string): readonly string[] =>
  [
    ...readFileSync(join(widestAppliedUnit(READER), file), 'utf8').matchAll(IMPORT),
  ].map(([, path]) => String(path));

const pointersOf = (file: string): Readonly<Record<string, boolean>> => {
  const folder = widestAppliedUnit(READER);

  return Object.fromEntries(
    [
      ...readFileSync(join(folder, file), 'utf8').matchAll(CODE_SPAN),
    ].map(([, path]) => [
      String(path),
      existsSync(join(folder, String(path))),
    ]),
  );
};

const agentFilesOfMember = (): readonly string[] => {
  const folder = widestAppliedUnit(READER, {
    files: workspaceFiles,
  });

  return agentFiles.filter((file) => existsSync(join(folder, MEMBER, file)));
};

export { agentFilesOfMember, importsOf, pointersOf };

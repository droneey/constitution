import { UnitPath } from '#/kernel/value-objects';

import type { PlannedFile, PlannedTool, UntemplatedTool, WiringPlan } from '../../domain/entities';

const SCOPE_INDENT = '  ';
const PART_INDENT = '    ';
const REPOSITORY_NAME = '.';

const unitText = (unit: UnitPath): string => (UnitPath.isRepository(unit) ? REPOSITORY_NAME : unit);

const toolLines = (tool: PlannedTool): readonly string[] => [
  `${SCOPE_INDENT}${tool.tool} ${tool.template}${tool.isAdded ? ' (the folder adds it)' : ''}`,
  ...tool.parts.map((part) => `${PART_INDENT}${part}`),
];

const fileLines = (file: PlannedFile): readonly string[] => [
  `${file.file}${file.isNew ? ' (new)' : ''} for ${file.units.map(unitText).join(', ')}${
    file.lowers === undefined ? '' : ` (its overrides lower ${file.lowers})`
  }`,
  ...file.scopes.flatMap((scope) => scope.tools.flatMap(toolLines)),
];

const untemplatedLine = ({ scope, tool }: UntemplatedTool): string =>
  `no template: ${scope}/${tool} — wire presets/${scope}/${tool}/ from what the tool reads`;

/** The lines presets plan prints: each file under its heading, then the tools without a template. */
const planLinesOf = (plan: WiringPlan): readonly string[] => [
  ...plan.files.flatMap(fileLines),
  ...plan.untemplated.map(untemplatedLine),
];

export { planLinesOf };

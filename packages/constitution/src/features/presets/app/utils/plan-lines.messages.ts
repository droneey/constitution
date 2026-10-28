import type { UnitPath } from '#/kernel/value-objects';

interface UnitRunInput {
  readonly entryPoint: string;
  readonly unitPath: UnitPath;
}

const INDENT = '  ';

const indentedMessage = (line: string): string => `${INDENT}${line}`;

const runMessage = (entryPoint: string): string => `run ${entryPoint}`;

const unitRunMessage = ({ entryPoint, unitPath }: UnitRunInput): string =>
  `${unitPath}: ${runMessage(entryPoint)}`;

export { indentedMessage, runMessage, unitRunMessage };

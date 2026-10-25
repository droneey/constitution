import { TEMPLATES_FOLDER } from '../constants';
import type { Brand } from '../types';
import { fieldsOf, isPathSegment } from '../utils';

/** A template: templates/project/<scope>/<tool>/<writes>, the path it writes from the folder it serves. */
type TemplatePath = Brand<
  {
    readonly scope: string;
    readonly tool: string;
    readonly writes: string;
  },
  'TemplatePath'
>;

const SEPARATOR = '/';
const templatesPrefix = `${TEMPLATES_FOLDER}${SEPARATOR}`;

/** Whether a value is a template: a scope and a tool that are each one path segment, and a path it writes. */
const is = (candidate: unknown): candidate is TemplatePath => {
  const fields = fieldsOf(candidate);
  const writes = fields.get('writes');

  return (
    isPathSegment(fields.get('scope')) &&
    isPathSegment(fields.get('tool')) &&
    typeof writes === 'string' &&
    writes !== ''
  );
};

/** The template a path under the templates folder is, or undefined when it writes no path. */
const parse = (path: string): TemplatePath | undefined => {
  if (!path.startsWith(templatesPrefix)) {
    return undefined;
  }

  // Stryker disable next-line StringLiteral: a template that writes a path has its scope and its tool
  const [scope = '', tool = '', ...rest] = path.slice(templatesPrefix.length).split(SEPARATOR);
  const template = {
    scope,
    tool,
    writes: rest.join(SEPARATOR),
  };

  return is(template) ? template : undefined;
};

const equals = (left: TemplatePath, right: TemplatePath): boolean =>
  left.scope === right.scope && left.tool === right.tool && left.writes === right.writes;

const TemplatePath = {
  equals,
  is,
  parse,
} as const;

export { TemplatePath };

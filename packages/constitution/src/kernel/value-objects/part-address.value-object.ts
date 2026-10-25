import type { Axis } from '../constants';
import { AXES } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import { fieldsOf, isPathSegment } from '../utils';

/** A part of a preset: presets/<scope>/<tool>/<axis>/<name>.<extension>. */
interface PartAddress {
  readonly axis: Axis;
  readonly name: string;
  readonly scope: string;
  readonly tool: string;
}

/** Whether a value is an address: an axis, and a scope, a tool and a name that are each one path segment. */
const is = (candidate: unknown): candidate is PartAddress => {
  const fields = fieldsOf(candidate);

  return (
    AXES.some((axis) => axis === fields.get('axis')) &&
    isPathSegment(fields.get('name')) &&
    isPathSegment(fields.get('scope')) &&
    isPathSegment(fields.get('tool'))
  );
};

/** @throws {@link InvalidValueError} when the scope, the tool or the name is empty or holds a "/" */
const create = (input: PartAddress): PartAddress => {
  const text = `${input.scope}/${input.tool}/${input.axis}/${input.name}`;

  if (!is(input)) {
    throw new InvalidValueError({
      code: ValueFailure.PartAddress,
      details: {
        text,
      },
    });
  }

  return {
    axis: input.axis,
    name: input.name,
    scope: input.scope,
    tool: input.tool,
  };
};

const equals = (left: PartAddress, right: PartAddress): boolean =>
  left.axis === right.axis &&
  left.name === right.name &&
  left.scope === right.scope &&
  left.tool === right.tool;

/** The part as a configuration names it: <scope>/<axis>/<name>. */
const shortOf = (address: PartAddress): string =>
  `${address.scope}/${address.axis}/${address.name}`;

const PartAddress = {
  create,
  equals,
  is,
  shortOf,
} as const;

export { PartAddress };

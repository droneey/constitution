import { ACCENT_TOKEN_PATH } from '../constants';
import { MalformedAccentError } from '../errors';

declare const brand: unique symbol;

type Oklch = readonly [
  lightness: number,
  chroma: number,
  hueDegrees: number,
];

/** keyed by the step names of the brand file's group, past its `$` properties */
type AccentScale = Readonly<Record<string, Oklch>> & {
  readonly [brand]: 'AccentScale';
};

const PATH_SEPARATOR = '.';

/** what sets a group's own property apart from its tokens */
const GROUP_PROPERTY_PREFIX = '$';

const OKLCH_SPACE = 'oklch';
const OKLCH_COMPONENTS = 3;

const isRecord = (candidate: unknown): candidate is Readonly<Record<string, unknown>> =>
  typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);

const isOklch = (candidate: unknown): candidate is Oklch =>
  Array.isArray(candidate) &&
  candidate.length === OKLCH_COMPONENTS &&
  candidate.every((component) => typeof component === 'number');

/** a step's name as the build writes a token's, so it stays one property name in the stylesheet */
const STEP_NAME = /^[\da-z]+(?:-[\da-z]+)*$/u;

const isStep = ([name, colour]: readonly [
  string,
  unknown,
]): boolean => STEP_NAME.test(name) && isOklch(colour);

const is = (candidate: unknown): candidate is AccentScale =>
  isRecord(candidate) &&
  Object.keys(candidate).length > 0 &&
  Object.entries(candidate).every(isStep);

const pathOf = (stepNames: readonly string[]): string =>
  [
    ...ACCENT_TOKEN_PATH,
    ...stepNames,
  ].join(PATH_SEPARATOR);

const stepsOf = (brandFile: unknown): unknown =>
  ACCENT_TOKEN_PATH.reduce<unknown>(
    (node, key) => (isRecord(node) ? node[key] : undefined),
    brandFile,
  );

const componentsOf = (token: unknown): unknown => {
  const colour = isRecord(token) ? token['$value'] : undefined;

  return isRecord(colour) && colour['colorSpace'] === OKLCH_SPACE
    ? colour['components']
    : undefined;
};

/**
 * The scale of an app's brand file, as the W3C Design Tokens format writes it.
 *
 * @throws {@link MalformedAccentError} when the file holds no step, or a step is named otherwise
 * than a token or holds no colour in OKLCH
 */
const create = (brandFile: unknown): AccentScale => {
  const steps = stepsOf(brandFile);
  const colours = isRecord(steps)
    ? Object.fromEntries(
        Object.entries(steps)
          .filter(([name]) => !name.startsWith(GROUP_PROPERTY_PREFIX))
          .map(([name, token]) => [
            name,
            componentsOf(token),
          ]),
      )
    : {};

  if (is(colours)) {
    return colours;
  }

  const malformedPaths = Object.entries(colours)
    .filter((step) => !isStep(step))
    .map(([name]) =>
      pathOf([
        name,
      ]),
    );

  throw new MalformedAccentError(
    malformedPaths.length > 0
      ? malformedPaths
      : [
          pathOf([]),
        ],
  );
};

const AccentScale = {
  create,
  is,
} as const;

export { AccentScale };

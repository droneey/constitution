import type { Brand } from '../../types';
import { MalformedAccentError } from '../errors';

/** an sRGB colour, `#rrggbb` */
type HexColour = Brand<string, 'HexColour'>;

/** an app's accent: each step of its scale by its sRGB colour */
type AccentScale = Brand<Readonly<Record<string, HexColour>>, 'AccentScale'>;

/** the keys of a brand file that lead to the steps of its scale */
const SCALE_KEYS = [
  'color',
  'brand',
] as const;

const stepsPath = SCALE_KEYS.join('.');

/** what sets a group's own property apart from its tokens */
const GROUP_PROPERTY_PREFIX = '$';

const HEX_COLOUR = /^#[\da-f]{6}$/iu;

type Step = readonly [
  name: string,
  token: unknown,
];

type ColourStep = readonly [
  name: string,
  token: {
    readonly $value: {
      readonly hex?: HexColour;
    };
  },
];

const isRecord = (candidate: unknown): candidate is Readonly<Record<string, unknown>> =>
  typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);

const isHexColour = (candidate: unknown): candidate is HexColour =>
  typeof candidate === 'string' && HEX_COLOUR.test(candidate);

const stepsOf = (brandFile: unknown): readonly Step[] | undefined => {
  const steps = SCALE_KEYS.reduce<unknown>(
    (group, key) => (isRecord(group) ? group[key] : undefined),
    brandFile,
  );

  return isRecord(steps)
    ? Object.entries(steps).filter(([name]) => !name.startsWith(GROUP_PROPERTY_PREFIX))
    : undefined;
};

const isColourStep = (step: Step): step is ColourStep => {
  const [, token] = step;
  const colour = isRecord(token) ? token['$value'] : undefined;

  return isRecord(colour) && (colour['hex'] === undefined || isHexColour(colour['hex']));
};

// No prototype, since the step names are the file's own.
const scaleOf = (steps: readonly ColourStep[]): Readonly<Record<string, HexColour>> => {
  const scale: Record<string, HexColour> = Object.create(null);

  for (const [name, token] of steps) {
    if (token.$value.hex !== undefined) {
      scale[name] = token.$value.hex;
    }
  }

  return scale;
};

const is = (candidate: unknown): candidate is AccentScale =>
  isRecord(candidate) && Object.values(candidate).every(isHexColour);

/**
 * The scale of an app's brand file, as the W3C Design Tokens format writes it; a step whose colour
 * gives no sRGB colour is left out, so the default's step stands in for it.
 *
 * @throws {@link MalformedAccentError} when the file holds no scale, or a step holds no colour or one
 * whose sRGB colour is no `#rrggbb`
 */
const create = (brandFile: unknown): AccentScale => {
  const steps = stepsOf(brandFile);

  if (steps === undefined) {
    throw new MalformedAccentError([
      stepsPath,
    ]);
  }

  const malformedPaths = steps
    .filter((step) => !isColourStep(step))
    .map(([name]) => `${stepsPath}.${name}`);
  const scale = scaleOf(steps.filter(isColourStep));

  // Stryker disable next-line ConditionalExpression: a scale of checked colours always passes is, which only brands it here
  if (malformedPaths.length > 0 || !is(scale)) {
    throw new MalformedAccentError(malformedPaths);
  }

  return scale;
};

const AccentScale = {
  create,
  is,
} as const;

export { AccentScale };

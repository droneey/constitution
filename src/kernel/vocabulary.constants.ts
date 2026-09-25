const KINDS = [
  'core',
  'domain',
  'context',
  'implementation',
] as const;

type Kind = (typeof KINDS)[number];

const LAYERS = [
  'core',
  'domain',
  'platform',
  'language',
  'implementation',
] as const;

type Layer = (typeof LAYERS)[number];

const LAYER_RANK: Readonly<Record<Layer, number>> = {
  core: 0,
  domain: 1,
  implementation: 3,
  language: 2,
  platform: 2,
};

const KIND_OF_LAYER: Readonly<Record<Layer, Kind>> = {
  core: 'core',
  domain: 'domain',
  implementation: 'implementation',
  language: 'context',
  platform: 'context',
};

const LEVELS = [
  'MUST',
  'SHOULD',
  'MAY',
] as const;

type Level = (typeof LEVELS)[number];

const ROLES = [
  'format',
  'lint',
  'types',
  'architecture',
  'names',
  'unused',
  'versions',
  'tests',
  'coverage',
  'mutation',
  'secrets',
  'audit',
] as const;

type Role = (typeof ROLES)[number];

const LANGUAGE_FREE_ROLES: readonly Role[] = [
  'names',
  'secrets',
];

const TAGS = [
  'a11y',
  'architecture',
  'data',
  'errors',
  'naming',
  'performance',
  'security',
  'testing',
  'types',
  'ux',
  'workflow',
] as const;

type Tag = (typeof TAGS)[number];

const STATUSES = [
  'stable',
  'draft',
] as const;

type Status = (typeof STATUSES)[number];

export type { Kind, Layer, Level, Role, Status, Tag };
export {
  KIND_OF_LAYER,
  KINDS,
  LANGUAGE_FREE_ROLES,
  LAYER_RANK,
  LAYERS,
  LEVELS,
  ROLES,
  STATUSES,
  TAGS,
};

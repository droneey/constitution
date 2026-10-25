import { VersionError } from '../errors';

declare const versionBrand: unique symbol;

type Version = string & {
  readonly [versionBrand]: true;
};

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

const isVersion = (text: string): text is Version => VERSION_PATTERN.test(text);

const createVersion = (text: string): Version => {
  if (!isVersion(text)) {
    throw new VersionError(text);
  }

  return text;
};

export type { Version };
export { createVersion };

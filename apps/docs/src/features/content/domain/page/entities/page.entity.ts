import { Block } from '../../block/entities';
import { MARKDOWN_EXTENSION, PATH_SEPARATOR } from '../../shared/constants';
import type { BlockPath } from '../../shared/value-objects';
import { withoutMarkdownExtension } from '../utils';
import { PageSlugs } from '../value-objects';

interface PageLocation {
  readonly collection: string;
  readonly path: string;
}

interface Page extends PageLocation {
  readonly description: string;
  readonly title: string;
}

type PageCatalog = Readonly<Record<string, Page>>;

const catalogKeyOf = (slugs: readonly string[]): string => slugs.join(PATH_SEPARATOR);

// Why: two collections hold the README under one path.
const keyOf = ({ collection, path }: PageLocation): string => `${collection}:${path}`;

const isPassportPath = (blockPath: BlockPath): boolean => {
  const [fileName, folderName] = blockPath.split(PATH_SEPARATOR).toReversed();

  return (
    Block.axisOfFolder(folderName) === undefined &&
    fileName === `${folderName}${MARKDOWN_EXTENSION}`
  );
};

// Why: an axis keeps the address the legacy format gave its folder, so the version menu, which
// opens a page at the same address in another release, still finds it.
const sitePathOf = (blocksPath: string): string =>
  blocksPath
    .split(PATH_SEPARATOR)
    .map((segment) => Block.axisOfFolder(segment) ?? segment)
    .join(PATH_SEPARATOR);

/** @throws {InvalidValueError} when no page can have the block's address */
const slugsOf = (blockPath: BlockPath): PageSlugs => {
  const segments = sitePathOf(withoutMarkdownExtension(blockPath)).split(PATH_SEPARATOR);

  return PageSlugs.create(isPassportPath(blockPath) ? segments.slice(0, -1) : segments);
};

const addressOf = (baseUrl: string, blockPath: BlockPath): string =>
  [
    baseUrl,
    ...slugsOf(blockPath),
  ].join(PATH_SEPARATOR);

const Page = {
  addressOf,
  catalogKeyOf,
  isPassportPath,
  keyOf,
  sitePathOf,
  slugsOf,
} as const;

export type { PageCatalog, PageLocation };
export { Page };

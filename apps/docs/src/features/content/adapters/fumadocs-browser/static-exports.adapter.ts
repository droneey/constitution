import type { SerializedPageTree } from 'fumadocs-core/source/client';

import type { NavigationQueryRepository, PageLookup } from '../../domain/contracts';
import type { Page, PageCatalog } from '../../domain/entities';
import { catalogKeyOf } from '../../domain/entities';
import { ExportError } from '../../domain/errors';
import { pageCatalogModel } from './models';

type Transport = (address: string) => Promise<Response>;

interface StaticExportsInput {
  /** where the site serves the list of its pages its server exported */
  readonly catalogAddress: string;
  /** where the site serves the tree of its pages its server exported */
  readonly navigationAddress: string;
  readonly transport?: Transport;
}

/** the mark Fumadocs' loader gives a tree it serialized, which `useFumadocsLoader` turns back */
const isSerializedPageTree = (file: unknown): file is SerializedPageTree =>
  typeof file === 'object' &&
  file !== null &&
  '$fumadocs_loader' in file &&
  file.$fumadocs_loader === 'page-tree' &&
  'data' in file &&
  typeof file.data === 'object' &&
  file.data !== null;

/**
 * Reads what the site's server exported as plain files, which any static host serves: the tree of
 * the pages, and the list of the pages, read once and kept for the page's life
 */
export const createStaticExports = ({
  catalogAddress,
  navigationAddress,
  transport = fetch,
}: StaticExportsInput): NavigationQueryRepository<SerializedPageTree> & PageLookup => {
  /** undefined when the site answers no file, or one that holds no JSON */
  const readFile = async (address: string): Promise<unknown> => {
    const response = await transport(address).catch((error: unknown) => {
      throw new ExportError(
        {
          address,
        },
        {
          cause: error,
        },
      );
    });

    return response.ok ? await response.json().catch(() => undefined) : undefined;
  };

  const readCatalog = async (): Promise<PageCatalog> => {
    const file = pageCatalogModel.safeParse(await readFile(catalogAddress));

    if (!file.success) {
      throw new ExportError({
        address: catalogAddress,
      });
    }

    return file.data;
  };

  const kept: {
    catalog?: Promise<PageCatalog> | undefined;
  } = {};

  return {
    find: async (slugs): Promise<Page | undefined> => {
      // a read that failed is forgotten, so the next page the reader opens reads the list again
      kept.catalog ??= readCatalog().catch((error: unknown) => {
        kept.catalog = undefined;

        throw error;
      });

      const catalog = await kept.catalog;
      const key = catalogKeyOf(slugs);

      return Object.hasOwn(catalog, key) ? catalog[key] : undefined;
    },
    readNavigation: async (): Promise<SerializedPageTree> => {
      const file = await readFile(navigationAddress);

      if (!isSerializedPageTree(file)) {
        throw new ExportError({
          address: navigationAddress,
        });
      }

      return file;
    },
  };
};

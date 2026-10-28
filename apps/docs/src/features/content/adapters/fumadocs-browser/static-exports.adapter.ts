import type { SerializedPageTree } from 'fumadocs-core/source/client';
import type { z } from 'zod';

import { once } from '#/libs/once';
import { isNoJson, isUnreachable, problemPathsOf, WHOLE_FILE_PATH } from '#/libs/served-json';

import type { NavigationQueryRepository, PageLookup } from '../../domain/contracts';
import type { PageCatalog } from '../../domain/entities';
import { Page } from '../../domain/entities';
import { ExportError, ExportFailure } from '../../domain/errors';
import { pageCatalogModel, pageTreeModel } from './models';

type Transport = (
  address: string,
  init: {
    signal: AbortSignal;
  },
) => Promise<Response>;

interface StaticExportsInput {
  readonly catalogAddress: string;
  readonly navigationAddress: string;
  readonly transport?: Transport;
}

const READ_TIMEOUT_MS = 10_000;

const rethrownAs =
  (isRecognised: (error: unknown) => boolean, errorOf: (cause: unknown) => Error) =>
  (error: unknown): never => {
    throw isRecognised(error) ? errorOf(error) : error;
  };

/**
 * Reads what the site's server exported as plain files, which any static host serves: the tree of
 * the pages, and the list of the pages, read once and kept for the page's life
 */
export const createStaticExports = ({
  catalogAddress,
  navigationAddress,
  transport = fetch,
}: StaticExportsInput): NavigationQueryRepository<SerializedPageTree> & PageLookup => {
  /**
   * @throws {@link ExportError} when the site gives no answer in time, answers no file, or a file
   * that holds no JSON or no value the model takes
   */
  const readFile = async <TValue>(address: string, model: z.ZodType<TValue>): Promise<TValue> => {
    const response = await transport(address, {
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    }).catch(
      rethrownAs(
        isUnreachable,
        (cause) =>
          new ExportError(
            {
              code: ExportFailure.Unreachable,
              details: {
                address,
              },
            },
            {
              cause,
            },
          ),
      ),
    );

    if (!response.ok) {
      throw new ExportError({
        code: ExportFailure.NoFile,
        details: {
          address,
          status: response.status,
        },
      });
    }

    const file: unknown = await response.json().catch(
      rethrownAs(
        isNoJson,
        (cause) =>
          new ExportError(
            {
              code: ExportFailure.Malformed,
              details: {
                address,
                problems: [
                  WHOLE_FILE_PATH,
                ],
              },
            },
            {
              cause,
            },
          ),
      ),
    );
    const parsedFile = model.safeParse(file);

    if (!parsedFile.success) {
      throw new ExportError(
        {
          code: ExportFailure.Malformed,
          details: {
            address,
            problems: problemPathsOf(parsedFile.error.issues),
          },
        },
        {
          cause: parsedFile.error,
        },
      );
    }

    return parsedFile.data;
  };

  // a read that failed is forgotten, so the next page the reader opens reads the list again
  const keptCatalog = once((): Promise<PageCatalog> => readFile(catalogAddress, pageCatalogModel));

  return {
    find: async (slugs): Promise<Page | undefined> => {
      const catalog = await keptCatalog();
      const key = Page.catalogKeyOf(slugs);

      return Object.hasOwn(catalog, key) ? catalog[key] : undefined;
    },
    readNavigation: (): Promise<SerializedPageTree> => readFile(navigationAddress, pageTreeModel),
  };
};

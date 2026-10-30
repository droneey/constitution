import type { SerializedPageTree } from 'fumadocs-core/source/client';
import type { z } from 'zod';

import { onceSucceeded } from '#/libs/once-succeeded';
import { isNoJson, isUnreachable, problemPathsOf, WHOLE_FILE_PATH } from '#/libs/served-json';

import type { NavigationQueryRepository, PageLookup } from '../../application/contracts';
import type { PageCatalog } from '../../domain/page/entities';
import { Page } from '../../domain/page/entities';
import { ExportError, ExportFailure } from '../../domain/page/errors';
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

export const createStaticExports = ({
  catalogAddress,
  navigationAddress,
  transport = fetch,
}: StaticExportsInput): NavigationQueryRepository<SerializedPageTree> & PageLookup => {
  /**
   * @throws {ExportError} when the site gives no answer in time, answers no file, or a file
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

  // Why: a failed catalog read is forgotten, so the next page the reader opens reads it again.
  const keptCatalog = onceSucceeded(
    (): Promise<PageCatalog> => readFile(catalogAddress, pageCatalogModel),
  );

  return {
    /**
     * @throws {ExportError} when the site gives no answer in time, answers no file, or a file
     * that holds no JSON or no value the model takes
     */
    find: async (slugs): Promise<Page | undefined> => {
      const catalog = await keptCatalog();
      const key = Page.catalogKeyOf(slugs);

      return Object.hasOwn(catalog, key) ? catalog[key] : undefined;
    },
    /**
     * @throws {ExportError} when the site gives no answer in time, answers no file, or a file
     * that holds no JSON or no value the model takes
     */
    readNavigation: (): Promise<SerializedPageTree> => readFile(navigationAddress, pageTreeModel),
  };
};

import { z } from 'zod';

import type { ShellTree } from '../../../domain/entities';
import { FileSignature } from '../../../domain/value-objects';
import { absolutePathModel } from './session-state.model';

const shellTreeModel: z.ZodType<ShellTree> = z
  .strictObject({
    fileSignatures: z.array(
      z.tuple([
        absolutePathModel,
        z.string().refine(FileSignature.is).transform(FileSignature.create),
      ]),
    ),
    repositoryFolderPath: absolutePathModel,
  })
  .transform(
    (held): ShellTree => ({
      fileSignatures: new Map(held.fileSignatures),
      repositoryFolderPath: held.repositoryFolderPath,
    }),
  );

const shellTreeText = (tree: ShellTree): string =>
  `${JSON.stringify({
    fileSignatures: [
      ...tree.fileSignatures,
    ],
    repositoryFolderPath: tree.repositoryFolderPath,
  })}\n`;

export { shellTreeModel, shellTreeText };

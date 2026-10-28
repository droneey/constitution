import { readFileSync } from 'node:fs';

import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

import { AbsolutePath } from '../../domain/value-objects';
import { summaryOf, titleOf } from './markdown';

interface MarkdownFields {
  description: z.ZodDefault<z.ZodString>;
  icon: z.ZodDefault<z.ZodString> | z.ZodOptional<z.ZodString>;
  title: z.ZodDefault<z.ZodString>;
}

type MarkdownSchema = ReturnType<typeof pageSchema.extend<MarkdownFields>>;

/** @throws {@link InvalidValueError} when the file's path is relative */
const markdownSchema =
  (iconOf: (filePath: AbsolutePath) => string | undefined) =>
  (context: { path: string }): MarkdownSchema => {
    const filePath = AbsolutePath.create(context.path);
    // Stryker disable next-line StringLiteral: Bun reads text whatever the encoding names
    const markdown = readFileSync(filePath, 'utf8');
    const icon = iconOf(filePath);

    return pageSchema.extend({
      description: z.string().default(summaryOf(markdown) ?? ''),
      icon: icon === undefined ? z.string().optional() : z.string().default(icon),
      title: z.string().default(titleOf(markdown) ?? filePath),
    });
  };

export { markdownSchema };

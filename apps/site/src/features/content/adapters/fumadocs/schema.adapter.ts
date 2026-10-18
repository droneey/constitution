import { readFileSync } from 'node:fs';

import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

import { summaryLineOf, titleOf } from '../../domain/utils';
import { plainTextOf } from './markdown';

/** the fields a page of the repository's Markdown adds to fumadocs' own */
interface MarkdownFields {
  description: z.ZodDefault<z.ZodString>;
  icon: z.ZodDefault<z.ZodString> | z.ZodOptional<z.ZodString>;
  title: z.ZodDefault<z.ZodString>;
}

/** the schema of a page of the repository's Markdown */
type MarkdownSchema = ReturnType<typeof pageSchema.extend<MarkdownFields>>;

/** a page of the repository's Markdown: its title and summary from its heading and quote */
const markdownSchema =
  (iconOf: (path: string) => string | undefined) =>
  (context: { path: string }): MarkdownSchema => {
    const text = readFileSync(context.path, 'utf8');
    const icon = iconOf(context.path);

    return pageSchema.extend({
      description: z.string().default(plainTextOf(summaryLineOf(text) ?? '')),
      icon: icon === undefined ? z.string().optional() : z.string().default(icon),
      title: z.string().default(titleOf(text) ?? context.path),
    });
  };

export { markdownSchema };

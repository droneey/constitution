import { z } from 'zod';

import { KINDS, ROLES, STATUSES } from '#/kernel';

const BLOCK_ID = /^_?[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHAPTER = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const SUMMARY_LENGTH = 70;

const FRONT_MATTER_FIELDS = [
  'id',
  'kind',
  'summary',
  'chapters',
  'requires',
  'extends',
  'abstract',
  'checks',
  'owns',
  'governs',
  'status',
] as const;

const frontMatterSchema = z.strictObject({
  abstract: z.boolean(),
  chapters: z.array(z.string().regex(CHAPTER)),
  checks: z.array(z.enum(ROLES)),
  extends: z.string().regex(BLOCK_ID).nullable(),
  governs: z.array(z.string().min(1)),
  id: z.string().regex(BLOCK_ID),
  kind: z.enum(KINDS),
  owns: z.array(z.string().min(1)),
  requires: z.array(z.string().regex(BLOCK_ID)),
  status: z.enum(STATUSES),
  summary: z.string().min(1).max(SUMMARY_LENGTH),
});

export { FRONT_MATTER_FIELDS, frontMatterSchema };

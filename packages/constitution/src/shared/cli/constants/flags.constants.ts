import { z } from 'zod';

import type { OptionDeclaration } from '#/libs/commander';

const BASE_FLAG = {
  // Stryker disable next-line StringLiteral: help text commander prints; no caller relies on it
  description: 'the installed Constitution a pack extends, such as .droneey/constitution',
  flags: '--base <folder>',
} as const satisfies OptionDeclaration;

const baseFlagsSchema = z.strictObject({
  base: z.string().optional(),
});

const OUTPUT_FLAGS = [
  {
    // Stryker disable next-line StringLiteral: help text commander prints; no caller relies on it
    description: 'print plain text, without colour or motion',
    flags: '--plain',
  },
  {
    // Stryker disable next-line StringLiteral: help text commander prints; no caller relies on it
    description: 'print in colour, even where NO_COLOR asks for none',
    flags: '--color',
  },
  {
    // Stryker disable next-line StringLiteral: help text commander prints; no caller relies on it
    description: 'print without colour',
    flags: '--no-color',
  },
  {
    // Stryker disable next-line StringLiteral: help text commander prints; no caller relies on it
    description: 'print without motion',
    flags: '--no-motion',
  },
] as const satisfies readonly OptionDeclaration[];

const outputFlagsSchema = z.strictObject({
  color: z.boolean().optional(),
  motion: z.boolean().optional(),
  plain: z.boolean().optional(),
});

export { BASE_FLAG, baseFlagsSchema, OUTPUT_FLAGS, outputFlagsSchema };

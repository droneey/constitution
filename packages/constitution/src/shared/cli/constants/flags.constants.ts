import { z } from 'zod';

interface FlagDeclaration {
  readonly description: string;
  readonly flags: string;
}

const BASE_FLAG: FlagDeclaration = {
  // Stryker disable next-line StringLiteral: help text commander prints; no caller relies on it
  description: 'the installed Constitution a pack extends, such as .droneey/constitution',
  flags: '--base <folder>',
} as const;

const baseFlagsSchema = z.object({
  base: z.string().optional(),
});

const OUTPUT_FLAGS: readonly FlagDeclaration[] = [
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
] as const;

const outputFlagsSchema = z.object({
  color: z.boolean().optional(),
  motion: z.boolean().optional(),
  plain: z.boolean().optional(),
});

export type { FlagDeclaration };
export { BASE_FLAG, baseFlagsSchema, OUTPUT_FLAGS, outputFlagsSchema };

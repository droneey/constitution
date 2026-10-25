enum CheckKind {
  Unparsed = 'unparsed',
  None = 'none',
  Named = 'named',
}

/** The project's check as a session knows it: unknown while constitution.yaml does not parse. */
type CheckState =
  | {
      readonly kind: CheckKind.Unparsed;
    }
  | {
      readonly kind: CheckKind.None;
    }
  | {
      readonly command: string;
      readonly kind: CheckKind.Named;
    };

const CheckState = {
  /** The check a parsed constitution.yaml names, or none. */
  create: (command?: string): CheckState =>
    command === undefined
      ? {
          kind: CheckKind.None,
        }
      : {
          command,
          kind: CheckKind.Named,
        },
  commandOf: (check: CheckState): string | undefined =>
    check.kind === CheckKind.Named ? check.command : undefined,
  unparsed: (): Extract<
    CheckState,
    {
      readonly kind: CheckKind.Unparsed;
    }
  > => ({
    kind: CheckKind.Unparsed,
  }),
} as const;

export { CheckKind, CheckState };

enum WiringProblemKind {
  Lacks = 'lacks',
  NamesBeyond = 'names-beyond',
  MarkerSaysMore = 'marker-says-more',
  CopyOfRemovedPart = 'copy-of-removed-part',
  CopyNotTaken = 'copy-not-taken',
  CopyWithoutEnd = 'copy-without-end',
  CopyEdited = 'copy-edited',
  MarkerOutOfOrder = 'marker-out-of-order',
  ExtendsShortOfEnd = 'extends-short-of-end',
}

interface PartsNamed {
  /** each as <scope>/<axis>/<name>, after its tool and a colon where several tools read the file */
  readonly parts: readonly string[];
}

interface PartCopied {
  readonly part: string;
}

interface ToolNamed {
  readonly tool: string;
}

interface WiringProblemDetails {
  readonly [WiringProblemKind.Lacks]: PartsNamed;
  readonly [WiringProblemKind.NamesBeyond]: PartsNamed;
  readonly [WiringProblemKind.MarkerSaysMore]: ToolNamed;
  readonly [WiringProblemKind.CopyOfRemovedPart]: PartCopied;
  readonly [WiringProblemKind.CopyNotTaken]: PartCopied;
  readonly [WiringProblemKind.CopyWithoutEnd]: PartCopied;
  readonly [WiringProblemKind.CopyEdited]: PartCopied;
  readonly [WiringProblemKind.MarkerOutOfOrder]: ToolNamed;
  readonly [WiringProblemKind.ExtendsShortOfEnd]: ToolNamed;
}

type WiringProblem<TKind extends WiringProblemKind = WiringProblemKind> = {
  readonly [TEach in TKind]: WiringProblemDetails[TEach] & {
    readonly kind: TEach;
  };
}[TKind];

const SHOWN = 3;

const listOf = (parts: readonly string[]): string =>
  `${parts.slice(0, SHOWN).join(', ')}${parts.length > SHOWN ? ` and ${parts.length - SHOWN} more` : ''}`;

const sayings: {
  readonly [TKind in WiringProblemKind]: (problem: WiringProblem<TKind>) => string;
} = {
  [WiringProblemKind.Lacks]: ({ parts }) => `lacks ${listOf(parts)}`,
  [WiringProblemKind.NamesBeyond]: ({ parts }) => `names ${listOf(parts)}, which it does not take`,
  [WiringProblemKind.MarkerSaysMore]: ({ tool }) => `a marker of ${tool} says more than its path`,
  [WiringProblemKind.CopyOfRemovedPart]: ({ part }) =>
    `holds a copy of ${part} the release no longer has`,
  [WiringProblemKind.CopyNotTaken]: ({ part }) => `copies ${part}, which it does not take`,
  [WiringProblemKind.CopyWithoutEnd]: ({ part }) => `the copy of ${part} has no end line`,
  [WiringProblemKind.CopyEdited]: ({ part }) => `the copy of ${part} is edited inside`,
  [WiringProblemKind.MarkerOutOfOrder]: ({ tool }) =>
    `its marker of ${tool} lists the links out of order`,
  [WiringProblemKind.ExtendsShortOfEnd]: ({ tool }) =>
    `it extends a link of ${tool} short of the chain's end`,
};

const textOf = <TKind extends WiringProblemKind>(problem: WiringProblem<TKind>): string =>
  sayings[problem.kind](problem);

const WiringProblem = {
  /** The problems of one file, as its warning says them. */
  textOf: (problems: readonly WiringProblem[]): string => problems.map(textOf).join('; '),
} as const;

export { WiringProblem, WiringProblemKind };

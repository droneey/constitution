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

export type { WiringProblem };
export { WiringProblemKind };

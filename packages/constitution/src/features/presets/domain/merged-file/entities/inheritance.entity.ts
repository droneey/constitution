import { Setting } from '../../setting/entities';
import type { MergeProblem, PlacedFlaw } from '../../shared/entities';
import { InheritanceFlaw, PathSide, PresetsCode } from '../../shared/entities';

enum StepKind {
  Key = 'key',
  AnyChild = 'any-child',
  Named = 'named',
}

type SourceStep =
  | {
      readonly key: string;
      readonly kind: StepKind.Key;
    }
  | {
      readonly kind: StepKind.Named;
      readonly name: string;
    };

type PathStep =
  | SourceStep
  | {
      readonly kind: StepKind.AnyChild;
    };

interface Inheritance {
  readonly inheriting: readonly PathStep[];
  readonly source: readonly SourceStep[];
}

interface InheritanceDeclared {
  readonly keyPath: readonly string[];
  readonly source: Setting;
}

type InheritanceParsed =
  | {
      readonly inheritance: Inheritance;
    }
  | {
      readonly problem: MergeProblem;
    };

interface Walk {
  readonly bindings: ReadonlyMap<string, string>;
  readonly held: Setting;
  readonly root: Setting;
  readonly source: readonly SourceStep[];
  readonly steps: readonly PathStep[];
}

const STEP_SEPARATOR = '.';
const ANY_CHILD = '*';
const NAMED = /^<([^<>]+)>$/;

const parseSourceStep = (text: string): SourceStep => {
  const named = NAMED.exec(text);

  return named === null
    ? {
        key: text,
        kind: StepKind.Key,
      }
    : {
        kind: StepKind.Named,
        name: String(named[1]),
      };
};

const parseStep = (text: string): PathStep =>
  text === ANY_CHILD
    ? {
        kind: StepKind.AnyChild,
      }
    : parseSourceStep(text);

const keyStep = (key: string): SourceStep => ({
  key,
  kind: StepKind.Key,
});

const boundNames = (steps: readonly PathStep[]): readonly string[] =>
  steps.flatMap((step) =>
    // Stryker disable next-line ConditionalExpression: a step that binds no name adds no name a step reads
    step.kind === StepKind.Named
      ? [
          step.name,
        ]
      : // Stryker disable next-line ArrayDeclaration: a step that binds no name adds no name a step reads
        [],
  );

const inheritingFlaw = (
  step: PathStep,
  earlier: readonly PathStep[],
): InheritanceFlaw | undefined => {
  switch (step.kind) {
    case StepKind.Key:
      return step.key === '' ? InheritanceFlaw.EmptyStep : undefined;
    case StepKind.Named:
      return boundNames(earlier).includes(step.name) ? InheritanceFlaw.NameBoundTwice : undefined;
    // Stryker disable next-line ConditionalExpression: the last case left without its return falls off the switch into the same absent value
    case StepKind.AnyChild:
      return;
  }
};

const sourceFlaw = (text: string, bound: readonly string[]): InheritanceFlaw | undefined => {
  if (text === ANY_CHILD) {
    return InheritanceFlaw.AnyChildInSource;
  }

  const step = parseSourceStep(text);

  switch (step.kind) {
    case StepKind.Key:
      return step.key === '' ? InheritanceFlaw.EmptyStep : undefined;
    case StepKind.Named:
      return bound.includes(step.name) ? undefined : InheritanceFlaw.UnboundName;
  }
};

const placedFlaws = (
  side: PathSide,
  flaws: readonly (InheritanceFlaw | undefined)[],
): readonly PlacedFlaw[] =>
  flaws.flatMap((flaw, step) =>
    flaw === undefined
      ? []
      : [
          {
            flaw,
            side,
            step,
          },
        ],
  );

const malformed = (
  keyPath: readonly string[],
  flaws: readonly PlacedFlaw[],
): InheritanceParsed => ({
  problem: {
    code: PresetsCode.InheritanceMalformed,
    details: {
      flaws,
      settingPath: Setting.pathTextOf(keyPath),
    },
  },
});

const parse = (declared: InheritanceDeclared): InheritanceParsed => {
  const { keyPath, source } = declared;
  const inheriting = (keyPath.at(-1) ?? '').split(STEP_SEPARATOR).map(parseStep);
  const inheritingFlaws = placedFlaws(
    PathSide.Inheriting,
    inheriting.map((step, at) => inheritingFlaw(step, inheriting.slice(0, at))),
  );

  if (typeof source !== 'string') {
    return malformed(keyPath, [
      ...inheritingFlaws,
      {
        flaw: InheritanceFlaw.SourceNotText,
        side: PathSide.Source,
        step: 0,
      },
    ]);
  }

  const sourceTexts = source.split(STEP_SEPARATOR);
  const bound = boundNames(inheriting);
  const flaws = [
    ...inheritingFlaws,
    ...placedFlaws(
      PathSide.Source,
      sourceTexts.map((text) => sourceFlaw(text, bound)),
    ),
  ];

  if (flaws.length > 0) {
    return malformed(keyPath, flaws);
  }

  const holder = keyPath.slice(0, -1).map(keyStep);

  return {
    inheritance: {
      inheriting: [
        ...holder,
        ...inheriting,
      ],
      source: [
        ...holder,
        ...sourceTexts.map(parseSourceStep),
      ],
    },
  };
};

const underlaid = (inherited: Setting | undefined, own: Setting): Setting => {
  if (Setting.isList(inherited) && Setting.isList(own)) {
    return Setting.withItemsNotYetHeld(inherited, own);
  }

  if (!(Setting.isMap(inherited) && Setting.isMap(own))) {
    return own;
  }

  return Object.fromEntries(
    Object.entries({
      ...inherited,
      ...own,
    }).map(([key, held]) => [
      key,
      underlaid(inherited[key], held),
    ]),
  );
};

const sourceKey = (step: SourceStep, bindings: ReadonlyMap<string, string>): string => {
  if (step.kind === StepKind.Key) {
    return step.key;
  }

  // Stryker disable next-line StringLiteral: the parse refuses a source that reads a name the inheriting path leaves unbound
  return bindings.get(step.name) ?? '';
};

const sourceSetting = (walk: Walk): Setting | undefined =>
  Setting.atKeysAsWritten(
    walk.root,
    walk.source.map((step) => sourceKey(step, walk.bindings)),
  );

const isStepTo = (step: PathStep, key: string): boolean =>
  step.kind !== StepKind.Key || step.key === key;

const withBinding = (
  bindings: ReadonlyMap<string, string>,
  input: {
    key: string;
    step: PathStep;
  },
): ReadonlyMap<string, string> =>
  // Stryker disable next-line ConditionalExpression: a step that binds no name binds no name a source step reads
  input.step.kind === StepKind.Named
    ? new Map([
        ...bindings,
        [
          input.step.name,
          input.key,
        ],
      ])
    : bindings;

const inheritedAt = (walk: Walk): Setting => {
  const [step, ...rest] = walk.steps;
  const { held } = walk;

  if (step === undefined) {
    return underlaid(sourceSetting(walk), held);
  }

  if (Setting.isList(held)) {
    return step.kind === StepKind.AnyChild
      ? held.map((listed) =>
          inheritedAt({
            ...walk,
            held: listed,
            steps: rest,
          }),
        )
      : held;
  }

  if (!Setting.isMap(held)) {
    return held;
  }

  return Object.fromEntries(
    Object.entries(held).map(([key, child]) => [
      key,
      isStepTo(step, key)
        ? inheritedAt({
            ...walk,
            bindings: withBinding(walk.bindings, {
              key,
              step,
            }),
            held: child,
            steps: rest,
          })
        : child,
    ]),
  );
};

const inheritedIn = (inheritance: Inheritance, setting: Setting): Setting =>
  inheritedAt({
    bindings: new Map(),
    held: setting,
    root: setting,
    source: inheritance.source,
    steps: inheritance.inheriting,
  });

const Inheritance = {
  inheritedIn,
  parse,
} as const;

export { Inheritance };

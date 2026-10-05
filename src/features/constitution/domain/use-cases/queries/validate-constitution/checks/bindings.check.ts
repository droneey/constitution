import type { Finding } from '#/kernel';
import { Axis, Layer } from '#/kernel';

import type { Binding, Constitution, PresetFile, Rule } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import {
  checkOf,
  mayReferTo,
  PresetFileKind,
  presetPathOf,
  ruleLanguagesOf,
} from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

const partOf = (input: {
  binding: Binding;
  presets: readonly PresetFile[];
}): PresetFile | undefined =>
  input.presets.find((preset) => {
    const path = presetPathOf(preset.path);

    return (
      path?.kind === PresetFileKind.Part &&
      path.scope === input.binding.scope &&
      path.tool === input.binding.tool &&
      path.axis === input.binding.axis &&
      path.name === input.binding.part
    );
  });

const SELF = 'self';
const COMMON = 'common';

// A part is named after the block its settings need — in a language's folder
// when they also need that language — and holds rules of those blocks, of the
// blocks above them, of a seam with them, or of the tool itself; self is the
// tool's own.
const isAbove = (input: { binding: Binding; byId: BlocksById; rule: Rule }): boolean => {
  const owners = [
    input.binding.part === SELF ? input.binding.tool : input.binding.part,
    ...(input.binding.scope === COMMON
      ? []
      : [
          input.binding.scope,
        ]),
  ];

  return (
    input.rule.block === input.binding.tool ||
    owners.some(
      (owner) =>
        owner === input.rule.with ||
        !input.byId.has(owner) ||
        mayReferTo({
          byId: input.byId,
          from: {
            block: owner,
            with: undefined,
          },
          to: input.rule.block,
        }),
    )
  );
};

const bindingMessage = (input: {
  binding: Binding;
  byId: BlocksById;
  presets: readonly PresetFile[];
  rule: Rule | undefined;
}): string | undefined => {
  const { binding, rule } = input;

  if (rule === undefined) {
    return `binds "${binding.rule}", which is not a rule`;
  }

  // A part holds a rule of its own axis or of foundation, as rules refer.
  if (rule.axis !== binding.axis && rule.axis !== Axis.Foundation) {
    return `binds ${rule.slug}, a rule of ${rule.axis}, under ${binding.axis}`;
  }

  if (
    !isAbove({
      binding,
      byId: input.byId,
      rule,
    })
  ) {
    return `binds ${rule.slug}, a rule of ${rule.block}, to the part ${binding.part}, which may hold only rules of its block, of the blocks above it, of a seam with it or of its tool`;
  }

  const part = partOf(input);

  if (part === undefined) {
    return `binds ${rule.slug} to the part ${binding.part}, which presets/${binding.scope}/${binding.tool}/${binding.axis}/ does not hold`;
  }

  return part.text.includes(binding.setting)
    ? undefined
    : `binds ${rule.slug} to "${binding.setting}", which ${part.path} does not hold`;
};

const bindingFindings = (input: {
  byId: BlocksById;
  constitution: Constitution;
}): readonly Finding[] => {
  const { constitution } = input;
  const rules = new Map(
    constitution.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  );

  return constitution.bindings.flatMap((binding) => {
    const message = bindingMessage({
      binding,
      byId: input.byId,
      presets: constitution.presets,
      rule: rules.get(binding.rule),
    });

    return message === undefined
      ? []
      : [
          {
            message,
            path: binding.file,
          },
        ];
  });
};

const roleOf = (rule: Rule): string | undefined => {
  const check = checkOf(rule);

  // Stryker disable next-line ConditionalExpression: only a tool check has a role
  return check.kind === 'tool' ? check.role : undefined;
};

// A language's project template holds a rule by an import contract named after it.
const CONTRACT = /\[\[tool\.importlinter\.contracts\]\]\nname = "([^"]+)"/g;

const contractHoldings = (input: {
  languages: readonly string[];
  templates: readonly PresetFile[];
}): readonly (readonly [
  string,
  string,
])[] =>
  input.languages.flatMap((language) =>
    input.templates
      .filter((template) => template.path.startsWith(`templates/project/${language}/`))
      .flatMap((template) =>
        [
          ...template.text.matchAll(CONTRACT),
        ].map(
          ([, name]) =>
            [
              // Stryker disable next-line StringLiteral: the pattern always captures the name
              name ?? '',
              language,
            ] as const,
        ),
      ),
  );

// rule → the scopes whose parts or templates hold it
const scopesOf = (constitution: Constitution): ReadonlyMap<string, ReadonlySet<string>> => {
  const scopes = new Map<string, Set<string>>();
  const languages = constitution.blocks
    .filter((block) => block.layer === Layer.Language)
    .map((block) => block.id);

  for (const [rule, scope] of [
    ...constitution.bindings.map(
      (binding) =>
        [
          binding.rule,
          binding.scope,
        ] as const,
    ),
    ...contractHoldings({
      languages,
      templates: constitution.templates,
    }),
  ]) {
    scopes.set(rule, (scopes.get(rule) ?? new Set<string>()).add(scope));
  }

  return scopes;
};

interface Holding {
  readonly byId: BlocksById;
  readonly rules: readonly Rule[];
  readonly scopes: ReadonlyMap<string, ReadonlySet<string>>;
}

interface Held extends Holding {
  readonly role: string;
  readonly rule: Rule;
}

const isToolsOwn = (input: Held): boolean => {
  // Stryker disable next-line OptionalChaining,ArrayDeclaration: every rule's block is loaded
  const checks: readonly string[] = input.byId.get(input.rule.block)?.frontMatter.checks ?? [];

  return checks.includes(input.role);
};

// A rule a tool checks is held by a binding, by the tool block's own account
// of its run, or by a rule under it that is held for the same role.
const isHeld = (input: Held): boolean =>
  input.scopes.has(input.rule.slug) ||
  isToolsOwn(input) ||
  input.rules.some(
    (child) =>
      child.parent === input.rule.slug &&
      roleOf(child) === input.role &&
      isHeld({
        ...input,
        rule: child,
      }),
  );

// In one language a rule is held by a part of that language or of every
// language, by its template, by the account of its tool, or by a rule under it
// that holds for the language: one a tool of any role holds there, or one of
// the language's own that is reviewed or tested.
const isHeldIn = (
  input: Held & {
    language: string;
  },
): boolean => {
  const scopes = input.scopes.get(input.rule.slug);

  return (
    scopes?.has(input.language) === true ||
    scopes?.has(COMMON) === true ||
    isToolsOwn(input) ||
    input.rules.some((child) => {
      const languages = ruleLanguagesOf({
        byId: input.byId,
        rule: child,
      });
      const role = roleOf(child);

      if (child.parent !== input.rule.slug) {
        return false;
      }

      return role === undefined
        ? languages.includes(input.language)
        : (languages.length === 0 || languages.includes(input.language)) &&
            isHeldIn({
              ...input,
              role,
              rule: child,
            });
    })
  );
};

// A language whose own parts or template hold a rule of a block for a role
// holds every rule of that block for that role.
const servedLanguages = (input: Held): readonly string[] => [
  ...new Set(
    input.rules
      .filter((other) => other.block === input.rule.block && roleOf(other) === input.role)
      .flatMap((other) => [
        ...(input.scopes.get(other.slug) ?? []),
      ])
      .filter((scope) => scope !== COMMON),
  ),
];

const unheldMessages = (input: Held): readonly string[] => {
  const { role, rule } = input;
  const says = `says a tool holds ${rule.slug} (tool/${role}), but`;

  if (!isHeld(input)) {
    return [
      `${says} no binding holds it, nor a rule that carries it out`,
    ];
  }

  const languages = ruleLanguagesOf(input);
  const isHeldInLanguage = (language: string): boolean =>
    isHeldIn({
      ...input,
      language,
    });

  if (languages.length > 0) {
    return languages.some(isHeldInLanguage)
      ? []
      : [
          `${says} nothing holds it in ${languages.join(' or ')}`,
        ];
  }

  return servedLanguages(input)
    .filter((language) => !isHeldInLanguage(language))
    .map(
      (language) =>
        `${says} nothing holds it in ${language}, which holds other rules of ${rule.block} for that role`,
    );
};

// A role no tool with presets checks has nothing to bind.
const unheldFindings = (input: {
  byId: BlocksById;
  constitution: Constitution;
}): readonly Finding[] => {
  const { blocks, presets, rules } = input.constitution;
  const toolsWithPresets = new Set(presets.map((preset) => presetPathOf(preset.path)?.tool));
  const presetRoles = new Set<string>(
    blocks
      .filter((block) => toolsWithPresets.has(block.id))
      .flatMap((block) => block.frontMatter.checks),
  );
  const holding: Holding = {
    byId: input.byId,
    rules,
    scopes: scopesOf(input.constitution),
  };

  return rules.flatMap((rule) => {
    const role = roleOf(rule);

    // Stryker disable next-line ConditionalExpression: a rule no tool checks has no role for a tool with presets to hold
    return role === undefined || !presetRoles.has(role)
      ? []
      : unheldMessages({
          ...holding,
          role,
          rule,
        }).map((message) => ({
          message,
          path: rule.file,
        }));
  });
};

const bindingsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => [
  ...bindingFindings({
    byId,
    constitution,
  }),
  ...unheldFindings({
    byId,
    constitution,
  }),
];

export { bindingsCheck };

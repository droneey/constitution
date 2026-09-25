import { isFence } from '#/libs/markdown';

import type { Rule, RuleLabel, StrayHeading } from '../../../entities';

const RULE_HEADING = /^## (\S+) · (MUST|SHOULD|MAY)$/;
const SECTION_HEADING = /^#{1,2} /;
const LOOKS_LIKE_RULE = /^## .+ · /;
const LABEL = /^\*\*(Why|Check|Tags|Example|Implements):\*\*\s*(.*)$/;

interface Source {
  block: string;
  file: string;
  text: string;
  with: string | null;
}

interface Draft {
  labels: Readonly<Partial<Record<RuleLabel, string>>>;
  level: string;
  slug: string;
  statement: readonly string[];
}

interface ParseState {
  draft: Draft | undefined;
  isInFence: boolean;
  rules: readonly Rule[];
  strayHeadings: readonly StrayHeading[];
}

interface RulesParsed {
  rules: readonly Rule[];
  strayHeadings: readonly StrayHeading[];
}

const closed = (input: { source: Source; state: ParseState }): ParseState => {
  const { draft } = input.state;

  if (draft === undefined) {
    return input.state;
  }

  return {
    ...input.state,
    draft: undefined,
    rules: [
      ...input.state.rules,
      {
        block: input.source.block,
        file: input.source.file,
        labels: draft.labels,
        level: draft.level,
        slug: draft.slug,
        statement: draft.statement.join(' ').trim(),
        with: input.source.with,
      },
    ],
  };
};

const onHeading = (input: {
  line: string;
  source: Source;
  state: ParseState;
}): ParseState => {
  const state = closed(input);
  const heading = RULE_HEADING.exec(input.line);

  if (heading !== null) {
    return {
      ...state,
      draft: {
        labels: {},
        level: heading[2] ?? '',
        slug: heading[1] ?? '',
        statement: [],
      },
    };
  }

  if (!LOOKS_LIKE_RULE.test(input.line)) {
    return state;
  }

  return {
    ...state,
    strayHeadings: [
      ...state.strayHeadings,
      {
        block: input.source.block,
        file: input.source.file,
        heading: input.line,
      },
    ],
  };
};

const onText = (input: { draft: Draft; line: string }): Draft => {
  const label = LABEL.exec(input.line);

  if (label !== null) {
    return {
      ...input.draft,
      labels: {
        ...input.draft.labels,
        [(label[1] ?? '').toLowerCase() as RuleLabel]: (label[2] ?? '').trim(),
      },
    };
  }

  const isStatement =
    Object.keys(input.draft.labels).length === 0 && input.line.trim() !== '';

  return isStatement
    ? {
        ...input.draft,
        statement: [
          ...input.draft.statement,
          input.line.trim(),
        ],
      }
    : input.draft;
};

const step =
  (source: Source) =>
  (state: ParseState, line: string): ParseState => {
    if (isFence(line)) {
      return {
        ...state,
        isInFence: !state.isInFence,
      };
    }

    if (state.isInFence) {
      return state;
    }

    if (SECTION_HEADING.test(line)) {
      return onHeading({
        line,
        source,
        state,
      });
    }

    if (state.draft === undefined) {
      return state;
    }

    return {
      ...state,
      draft: onText({
        draft: state.draft,
        line,
      }),
    };
  };

const parseRules = (source: Source): RulesParsed => {
  const state = closed({
    source,
    state: source.text.split('\n').reduce(step(source), {
      draft: undefined,
      isInFence: false,
      rules: [],
      strayHeadings: [],
    }),
  });

  return {
    rules: state.rules,
    strayHeadings: state.strayHeadings,
  };
};

export { parseRules };

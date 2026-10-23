import { Axis, Layer } from '#/kernel/constants';

import type { BlockCard, FrontMatterParser } from '../../../contracts';
import type { CatalogueAnswer, StatedRule } from '../../../entities';
import { WarningCode } from '../../../entities';
import { splitFrontMatter, withoutCodeFences } from '../../../utils';
import { parseRequirements, parseRules } from '../load-constitution';
import type { WarningLog } from './warning-log.utils';

// A file of a source, its path from the source's folder: blocks/domains/ui/ui.md.
interface SourceFile {
  readonly path: string;
  // undefined when it cannot be read
  readonly text?: string;
}

interface CatalogueSource {
  // undefined when the pack is not installed
  readonly files?: readonly SourceFile[];
  // '' for the Constitution, else the pack's path as constitution.yaml names it
  readonly source: string;
  // the folder a warning names the source's files under
  readonly where: string;
}

interface BlockDraft {
  card: BlockCard;
  chapters: string[];
  id: string;
  layer: Layer;
  seams: string[];
  source: string;
}

interface ReadState {
  answers: CatalogueAnswer[];
  drafts: Map<string, BlockDraft>;
  log: WarningLog;
  parser: FrontMatterParser;
  rules: StatedRule[];
  skipped: Set<string>;
  slugs: Set<string>;
}

interface FileInput {
  file: SourceFile;
  source: CatalogueSource;
  state: ReadState;
}

const LAYER_FOLDERS: readonly (readonly [
  Layer,
  string,
])[] = [
  [
    Layer.Domain,
    'blocks/domains/',
  ],
  [
    Layer.Platform,
    'blocks/contexts/platforms/',
  ],
  [
    Layer.Language,
    'blocks/contexts/languages/',
  ],
  [
    Layer.Implementation,
    'blocks/implementations/',
  ],
];
const CORE_FOLDER = 'blocks/core/';
const CORE = 'core';
const SEAM = /^with\/([^/]+)\.md$/;
const CHAPTER = /^[^/]+\.md$/;
const EMPTY_CARD: BlockCard = {
  extends: undefined,
  governs: [],
  isAbstract: false,
  requires: [],
  summary: '',
};

const warnOf = (input: { message: string; source: CatalogueSource; state: ReadState }): void => {
  input.state.log.add({
    code: input.source.source === '' ? WarningCode.Constitution : WarningCode.Pack,
    message: input.message,
  });
};

const whereOf = (input: { path: string; source: CatalogueSource }): string =>
  `${input.source.where}/${input.path}`;

interface Located {
  id: string;
  layer: Layer;
  name: string;
}

const locate = (path: string): Located | undefined => {
  if (path.startsWith(CORE_FOLDER)) {
    return {
      id: CORE,
      layer: Layer.Core,
      name: path.slice(CORE_FOLDER.length),
    };
  }

  const found = LAYER_FOLDERS.find(([, folder]) => path.startsWith(folder));

  if (found === undefined) {
    return undefined;
  }

  const rest = path.slice(found[1].length);
  const id = rest.includes('/') ? rest.slice(0, rest.indexOf('/')) : '';

  return {
    id,
    layer: found[0],
    name: rest.slice(id.length + 1),
  };
};

// The text a rule or a requirement is read from: no front matter, no code sample.
const readRules = (
  input: FileInput & {
    axis: Axis;
    draft: BlockDraft;
    seam?: string;
  },
): void => {
  const { file, source, state } = input;

  if (file.text === undefined) {
    warnOf({
      message: `${whereOf({
        path: file.path,
        source,
      })} cannot be read — its rules are left out`,
      source,
      state,
    });

    return;
  }

  const text = withoutCodeFences(splitFrontMatter(file.text).body);
  const read = {
    block: input.draft.id,
    file: file.path,
    text,
    with: input.seam,
  };

  for (const rule of parseRules({
    ...read,
    axis: input.axis,
  }).rules) {
    if (state.slugs.has(rule.slug)) {
      warnOf({
        message: `${whereOf({
          path: file.path,
          source,
        })} repeats the rule ${rule.slug} — the first is used`,
        source,
        state,
      });
    } else {
      state.slugs.add(rule.slug);
      state.rules.push(rule);
    }
  }

  state.answers.push(
    ...parseRequirements(read).answers.map((answer) => ({
      block: answer.block,
      met: answer.met,
      requirement: answer.requirement,
    })),
  );
};

const readPassport = (
  input: FileInput & {
    draft: BlockDraft;
  },
): void => {
  const { file, source, state } = input;
  const where = whereOf({
    path: file.path,
    source,
  });

  if (file.text === undefined) {
    warnOf({
      message: `${where} cannot be read — its rules are left out`,
      source,
      state,
    });

    return;
  }

  const { frontMatter } = splitFrontMatter(file.text);

  if (frontMatter === undefined) {
    warnOf({
      message: `${where} has no front matter — the block is read without it`,
      source,
      state,
    });
  } else {
    input.draft.card = state.parser.card(frontMatter);
  }

  readRules({
    ...input,
    axis: Axis.Foundation,
  });
};

const readPart = (
  input: FileInput & {
    draft: BlockDraft;
    name: string;
  },
): void => {
  const slash = input.name.indexOf('/');
  const axis = Object.values(Axis).find((candidate) => candidate === input.name.slice(0, slash));
  const rest = input.name.slice(slash + 1);
  const seam = SEAM.exec(rest)?.[1];

  if (axis !== undefined && seam !== undefined) {
    input.draft.seams.push(`${axis}/${seam}`);
    readRules({
      ...input,
      axis,
      seam,
    });
  } else if (axis !== undefined && CHAPTER.test(rest)) {
    input.draft.chapters.push(input.name);
    readRules({
      ...input,
      axis,
    });
  } else {
    warnOf({
      message: `${whereOf({
        path: input.file.path,
        source: input.source,
      })} is not a block file — move or remove it`,
      source: input.source,
      state: input.state,
    });
  }
};

// The draft a file adds to, or undefined when the block is another source's, which is read first.
const draftOf = (
  input: FileInput & {
    located: Located;
  },
): BlockDraft | undefined => {
  const { located, source, state } = input;
  const skipKey = `${source.source}\n${located.id}`;
  const draft = state.drafts.get(located.id);

  if (state.skipped.has(skipKey)) {
    return undefined;
  }

  if (draft === undefined) {
    const created: BlockDraft = {
      card: EMPTY_CARD,
      chapters: [],
      id: located.id,
      layer: located.layer,
      seams: [],
      source: source.source,
    };

    state.drafts.set(located.id, created);

    return created;
  }

  if (draft.source === source.source) {
    return draft;
  }

  warnOf({
    message: `${whereOf({
      path: input.file.path,
      source,
    })} repeats the block ${located.id} — the one read first is used`,
    source,
    state,
  });
  state.skipped.add(skipKey);

  return undefined;
};

const readFile = (input: FileInput): void => {
  const located = locate(input.file.path);

  if (located === undefined || (located.layer === Layer.Core && input.source.source !== '')) {
    warnOf({
      message: `${whereOf({
        path: input.file.path,
        source: input.source,
      })} is not inside a block folder of a domain, a context or an implementation`,
      source: input.source,
      state: input.state,
    });

    return;
  }

  if (located.id === '') {
    return;
  }

  const draft = draftOf({
    ...input,
    located,
  });

  if (draft === undefined) {
    return;
  }

  if (located.name === `${located.id}.md`) {
    readPassport({
      ...input,
      draft,
    });
  } else {
    readPart({
      ...input,
      draft,
      name: located.name,
    });
  }
};

export type { BlockDraft, CatalogueSource, ReadState };
export { readFile };

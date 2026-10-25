import type { ProjectWarning } from '#/kernel/entities';

// The digest's budgets count bytes: the room after its header, the warnings' share of it, and the
// room kept for the note of the block list's lines left out.
const BUDGET_BYTES = 9400;
const WARNING_BUDGET_BYTES = 1000;
const LEFT_OUT_NOTE_BYTES = 200;
const DELIMITER = '---';
const encoder = new TextEncoder();

const bytesOf = (line: string): number => encoder.encode(line).length + 1;

interface Body {
  readonly lines: string[];
  used: number;
}

const put = (input: { body: Body; line: string }): void => {
  input.body.lines.push(input.line);
  input.body.used += bytesOf(input.line);
};

const openSection = (body: Body): void => {
  if (body.lines.length > 0) {
    put({
      body,
      line: '',
    });
  }
};

const putWarnings = (input: {
  body: Body;
  isStartup: boolean;
  warnings: readonly ProjectWarning[];
}): void => {
  const { body, warnings } = input;

  if (warnings.length === 0) {
    return;
  }

  // the warnings open the digest, so no blank line comes before them
  put({
    body,
    line: input.isStartup ? '⚠️ Warnings — tell the user at the start of the session' : '⚠️ Warnings',
  });

  const lines = warnings.map((warning) => `- ${warning.code}: ${warning.message}`);
  let given = 0;
  let bytes = 0;

  for (const line of lines) {
    if (bytes + bytesOf(line) > WARNING_BUDGET_BYTES) {
      break;
    }

    put({
      body,
      line,
    });
    bytes += bytesOf(line);
    given += 1;
  }

  if (given < lines.length) {
    put({
      body,
      line: `and ${lines.length - given} more`,
    });
  }
};

// Core's text without its front matter, its blank lines at the start and the end, as one section.
const putCore = (input: { body: Body; core: string }): void => {
  const lines = input.core
    .split('\n')
    .map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line));
  const end = lines[0] === DELIMITER ? lines.indexOf(DELIMITER, 1) : -1;
  const text = lines.slice(lines[0] === DELIMITER && end === -1 ? lines.length : end + 1);
  const first = text.findIndex((line) => line !== '');

  if (first === -1) {
    return;
  }

  const last = text.findLastIndex((line) => line !== '');

  openSection(input.body);

  for (const line of text.slice(first, last + 1)) {
    put({
      body: input.body,
      line,
    });
  }
};

const fits = (input: { body: Body; bytes: number }): boolean =>
  input.body.used + input.bytes + LEFT_OUT_NOTE_BYTES <= BUDGET_BYTES;

// The block list as far as the budget lets it go, and a note of the lines left out.
const putBlockList = (input: { body: Body; lines: readonly string[] }): void => {
  const { body, lines } = input;
  let given = 0;

  for (const line of lines) {
    const gap = given === 0 && body.lines.length > 0 ? 1 : 0;

    if (
      !fits({
        body,
        bytes: gap + bytesOf(line),
      })
    ) {
      break;
    }

    if (given === 0) {
      openSection(body);
    }

    put({
      body,
      line,
    });
    given += 1;
  }

  if (given === lines.length) {
    return;
  }

  if (given === 0) {
    openSection(body);
  }

  const left = lines.length - given;

  put({
    body,
    line: `${left} ${left === 1 ? 'more line' : 'more lines'} of the block list did not fit; constitution.yaml names every block.`,
  });
};

/** Core's text alone, as the digest gives it when constitution.yaml does not parse. */
const coreBodyOf = (core: string): readonly string[] => {
  const body: Body = {
    lines: [],
    used: 0,
  };

  putCore({
    body,
    core,
  });

  return body.lines;
};

/** The warnings, core's text and the block list, each within its share of the budget. */
const budgetedBodyOf = (input: {
  blockList: readonly string[];
  core: string;
  isStartup: boolean;
  warnings: readonly ProjectWarning[];
}): readonly string[] => {
  const body: Body = {
    lines: [],
    used: 0,
  };

  putWarnings({
    body,
    isStartup: input.isStartup,
    warnings: input.warnings,
  });
  putCore({
    body,
    core: input.core,
  });
  putBlockList({
    body,
    lines: input.blockList,
  });

  return body.lines;
};

export { budgetedBodyOf, coreBodyOf };

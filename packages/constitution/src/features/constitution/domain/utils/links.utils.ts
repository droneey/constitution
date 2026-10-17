// Group 2 is the target in angle brackets, group 3 the bare target.
const INLINE_LINK =
  /(\[(?:[^[\]]|\[[^[\]]*\])*\]\(\s*)(?:<([^>\n]*)>|([^\s()]+))(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
const LINK_DEFINITION = /^( {0,3}\[[^\]]+\]:\s*)(?:<([^>\n]*)>|(\S+))/gm;
const EXTERNAL = /^(?:[a-z][\d+.a-z-]*:|#|\/\/)/i;
const ANCHOR = '#';

const isLocal = (target: string): boolean => target !== '' && !EXTERNAL.test(target);

const targetsIn = (text: string): readonly string[] =>
  [
    ...text.matchAll(INLINE_LINK),
    ...text.matchAll(LINK_DEFINITION),
  ].map(
    // Stryker disable next-line StringLiteral: group 2 or group 3 always takes part
    (match) => match[2] ?? match[3] ?? '',
  );

const localLinkTargets = (text: string): readonly string[] =>
  targetsIn(text)
    .filter(isLocal)
    .map(
      // Stryker disable next-line StringLiteral: split always yields a first part
      (target) => target.split(ANCHOR)[0] ?? '',
    );

export { localLinkTargets };

export { withoutCodeFences } from './code-fences.utils';
export { compareText } from './compare-text.utils';
export { dayOf } from './days.utils';
export {
  attempted,
  isRangeError,
  isSyntaxError,
  recognisedFailure,
} from './failures.utils';
export { fieldsOf, isDeepEqual } from './fields.utils';
export { firstBy } from './first-by.utils';
export { splitFrontMatter } from './front-matter.utils';
export { globPiecesOf } from './glob-pieces.utils';
export { globMatches } from './globs.utils';
export { inlineCodeSpans, maskInlineCode, withoutInlineCode } from './inline-code.utils';
export { memoised } from './memoised.utils';
export { isInnerPath, normalizePath, stemOf, withoutDotSlash } from './paths.utils';
export type { PatternedText } from './patterned-text.utils';
export { patternedTextOf } from './patterned-text.utils';
export type { MarkdownSection } from './sections.utils';
export { isHeading, sectionsOf } from './sections.utils';
export { cellsOf, isTableLine, tablesOf } from './tables.utils';
export {
  collapseWhitespace,
  ownedWordMatcher,
  WordKind,
  wordMatcher,
} from './tokens.utils';

/** the `$type` of a style of text */
const TYPOGRAPHY_TYPE = 'typography';

/** the parts of a style of text, each a reference to a token of its scale */
enum TypographyPart {
  FontFamily = 'fontFamily',
  FontSize = 'fontSize',
  FontWeight = 'fontWeight',
  LetterSpacing = 'letterSpacing',
  LineHeight = 'lineHeight',
}

export { TYPOGRAPHY_TYPE, TypographyPart };

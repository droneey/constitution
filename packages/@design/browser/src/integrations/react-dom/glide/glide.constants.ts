const GLIDE_ATTRIBUTE = 'data-glide';
const VISIBLE_ATTRIBUTE = 'data-visible';
const ENTERING_ATTRIBUTE = 'data-entering';

// Why: the block is hidden from assistive technology, so a spec finds it by this id.
// Stryker disable next-line StringLiteral: only specs read the id, and they read it through this constant
const GLIDE_TEST_ID = 'glide';

export { ENTERING_ATTRIBUTE, GLIDE_ATTRIBUTE, GLIDE_TEST_ID, VISIBLE_ATTRIBUTE };

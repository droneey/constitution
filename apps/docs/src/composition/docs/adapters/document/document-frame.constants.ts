// Why: below this width the open sidebar pushes the page out of view, and the frame's styles show
// it collapsed until the page marks it; spelled in rem, never as the library's drawer query, which
// the site answers with one that matches nothing.
const NARROW_SCREEN_QUERY = '(width < 48rem)';

export { NARROW_SCREEN_QUERY };

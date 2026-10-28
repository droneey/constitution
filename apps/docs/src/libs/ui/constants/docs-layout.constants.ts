// Why: the library turns its sidebar into a drawer below 768 pixels and asks for it by this query;
// the site keeps one layout at every width, so the query is answered by one that matches nothing.
const DRAWER_QUERY = '(width < 768px)';

const QUERY_MATCHING_NOTHING = 'not all';

export { DRAWER_QUERY, QUERY_MATCHING_NOTHING };

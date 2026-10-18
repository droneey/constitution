import { fromHtml } from 'hast-util-from-html';

/** the SVG a small flowchart, `A[Rule] --> B[Block]`, draws in the site's colours, as beautiful-mermaid wrote it */
const GOLDEN_FLOWCHART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240.662 100.9" width="240.662" height="100.9" style="--bg:var(--color-surface-base);--fg:var(--color-text-primary);--line:color-mix(in oklch, var(--color-accent-solid) 60%, var(--color-text-muted));--accent:var(--color-accent-solid);--muted:var(--color-text-muted);--surface:color-mix(in oklch, var(--color-accent-solid) 7%, var(--color-surface-level-1));--border:color-mix(in oklch, var(--color-accent-solid) 45%, transparent)">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
  text { font-family: 'Inter', system-ui, sans-serif; }
  svg {
    /* Derived from --bg and --fg (overridable via --line, --accent, etc.) */
    --_text:          var(--fg);
    --_text-sec:      var(--muted, color-mix(in srgb, var(--fg) 60%, var(--bg)));
    --_text-muted:    var(--muted, color-mix(in srgb, var(--fg) 40%, var(--bg)));
    --_text-faint:    color-mix(in srgb, var(--fg) 25%, var(--bg));
    --_line:          var(--line, color-mix(in srgb, var(--fg) 50%, var(--bg)));
    --_arrow:         var(--accent, color-mix(in srgb, var(--fg) 85%, var(--bg)));
    --_node-fill:     var(--surface, color-mix(in srgb, var(--fg) 3%, var(--bg)));
    --_node-stroke:   var(--border, color-mix(in srgb, var(--fg) 20%, var(--bg)));
    --_group-fill:    var(--bg);
    --_group-hdr:     color-mix(in srgb, var(--fg) 5%, var(--bg));
    --_inner-stroke:  color-mix(in srgb, var(--fg) 12%, var(--bg));
    --_key-badge:     color-mix(in srgb, var(--fg) 10%, var(--bg));
  }
</style>
<defs>
  <marker id="arrowhead" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">
    <polygon points="0 0, 8 2.5, 0 5" fill="var(--_arrow)" stroke="var(--_arrow)" stroke-width="0.75" stroke-linejoin="round" />
  </marker>
  <marker id="arrowhead-start" markerWidth="8" markerHeight="5" refX="1" refY="2.5" orient="auto-start-reverse">
    <polygon points="8 0, 0 2.5, 8 5" fill="var(--_arrow)" stroke="var(--_arrow)" stroke-width="0.75" stroke-linejoin="round" />
  </marker>
</defs>
<polyline class="edge" data-from="A" data-to="B" data-style="solid" data-arrow-start="false" data-arrow-end="true" points="100.626,50.45 132.626,50.45" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)" />
<g class="node" data-id="A" data-label="Rule" data-shape="rectangle">
  <rect x="32" y="32" width="68.626" height="36.900000000000006" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75" />
  <text x="66.313" y="50.45" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)" dy="4.55">Rule</text>
</g>
<g class="node" data-id="B" data-label="Block" data-shape="rectangle">
  <rect x="132.626" y="32" width="76.036" height="36.900000000000006" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75" />
  <text x="170.644" y="50.45" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)" dy="4.55">Block</text>
</g>
</svg>`;

/** the elements of the golden flowchart, as a figure holds them */
export const goldenFlowchart = (): ReturnType<typeof fromHtml>['children'] =>
  fromHtml(GOLDEN_FLOWCHART, {
    fragment: true,
    space: 'svg',
  }).children;

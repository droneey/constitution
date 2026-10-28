import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { build } from 'vite';

// Why: Tailwind scans the folder Vite builds from for classes, and Stryker's sandbox links in the
// app's `node_modules` as a symbolic link Tailwind follows, so the scan starts from the sources;
// what it leaves out adds no class that reads a custom property of the site's own.
const sourceRoot = fileURLToPath(new URL('../..', import.meta.url));
const stylesheet = fileURLToPath(new URL('../app.css', import.meta.url));

const setByBaseUiOnWhatItMeasures: ReadonlySet<string> = new Set([
  '--accordion-panel-height',
  '--anchor-width',
  '--available-height',
  '--available-width',
  '--collapsible-panel-height',
  '--popup-height',
  '--positioner-height',
  '--transform-origin',
]);

const setByFumadocsOnItsLayoutAndWidgets: ReadonlySet<string> = new Set([
  '--callout-color',
  '--duration',
  '--easing',
  '--fd-animated-height',
  '--fd-docs-row-1',
  '--fd-docs-row-2',
  '--index',
]);

const setByShikiOnEachToken: ReadonlySet<string> = new Set([
  '--shiki-dark',
  '--shiki-dark-bg',
  '--shiki-dark-font-style',
  '--shiki-light',
  '--shiki-light-bg',
  '--shiki-light-font-style',
]);

const setByTheProgressRingOnItsCircle: ReadonlySet<string> = new Set([
  '--toc-fill-property',
]);

const setAtRuntime: ReadonlySet<string> = setByBaseUiOnWhatItMeasures
  .union(setByFumadocsOnItsLayoutAndWidgets)
  .union(setByShikiOnEachToken)
  .union(setByTheProgressRingOnItsCircle);

const DECLARATION = /(?:^|[{;\s])(?<name>--[\w-]+)\s*:/gu;
const REGISTRATION = /@property\s+(?<name>--[\w-]+)/gu;
const READ_WITHOUT_FALLBACK = /var\(\s*(?<name>--[\w-]+)\s*\)/gu;

const namesOf = (css: string, pattern: RegExp): Set<string> =>
  new Set(Array.from(css.matchAll(pattern), ({ groups }) => groups?.['name'] ?? ''));

// Why: Tailwind's optimiser is left out, as it neither adds nor drops a custom property and only
// prints the build's warnings again.
const buildAppCss = async (): Promise<string> => {
  const output = await build({
    configFile: false,
    root: sourceRoot,
    logLevel: 'silent',
    plugins: [
      tailwindcss({
        optimize: false,
      }),
    ],
    build: {
      write: false,
      rollupOptions: {
        input: stylesheet,
      },
    },
  });

  return [
    output,
  ]
    .flat()
    .flatMap((bundle) => ('output' in bundle ? bundle.output : []))
    .flatMap((file) =>
      file.type === 'asset' && file.fileName.endsWith('.css')
        ? [
            String(file.source),
          ]
        : [],
    )
    .join('\n');
};

const undefinedReadsOf = (css: string): string[] => {
  const defined = namesOf(css, DECLARATION).union(namesOf(css, REGISTRATION)).union(setAtRuntime);

  return [
    ...namesOf(css, READ_WITHOUT_FALLBACK).difference(defined),
  ].toSorted((one, other) => one.localeCompare(other));
};

export { buildAppCss, undefinedReadsOf };

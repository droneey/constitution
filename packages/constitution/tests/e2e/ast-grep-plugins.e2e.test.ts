import { describe, expect, it } from 'bun:test';

import { formatsPluginRows } from './ast-grep-formats-plugins.fixtures';
import { frameworksPluginRows } from './ast-grep-frameworks-plugins.fixtures';
import { interfacePluginRows } from './ast-grep-interface-plugins.fixtures';
import type { PluginRow } from './ast-grep-plugins.fixtures';
import {
  allowedCases,
  pluginsOf,
  pluginsWithNoRow,
  reportedCases,
} from './ast-grep-plugins.fixtures';
import { pythonPluginRows } from './ast-grep-python-plugins.fixtures';
import { typescriptPluginRows } from './ast-grep-typescript-plugins.fixtures';

const SCAN_TIMEOUT = 60_000;

const presetRows: readonly PluginRow[] = [
  {
    language: 'css',
    slug: 'full-width-leaves-out-the-scrollbar',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
        'css',
      ],
    },
    reported: [
      {
        condition: "a page's width is taken as 100vw",
        files: {
          'src/styles/page.css': '.page {\n  inline-size: calc(100vw - 2rem);\n}\n',
        },
      },
      {
        condition: "a banner's width is 100vw",
        files: {
          'src/styles/page.css': '.promo-banner {\n  inline-size: 100vw;\n}\n',
        },
      },
      {
        condition: 'a custom property holds a width of 100.0VW',
        files: {
          'src/styles/page.css': ':root {\n  --page-width: 100.0VW;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a page's width is 100% of its block",
        files: {
          'src/styles/page.css': '.page {\n  inline-size: 100%;\n}\n',
        },
      },
      {
        condition: 'a media query measures the full viewport width',
        files: {
          'src/styles/page.css':
            '@media (min-width: 100vw) {\n  .page {\n    inline-size: 100%;\n  }\n}\n',
        },
      },
      {
        condition: 'a width takes half the viewport',
        files: {
          'src/styles/page.css': '.page {\n  inline-size: 50vw;\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'line-height-set-as-a-number',
    unit: {
      axes: [],
      blocks: [
        'css',
      ],
    },
    reported: [
      {
        condition: 'a line height is set in pixels',
        files: {
          'src/styles/label.css': '.label {\n  line-height: 24px;\n}\n',
        },
      },
      {
        condition: 'a line height is a percentage',
        files: {
          'src/styles/label.css': '.label {\n  line-height: 150%;\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its line height in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font: 1rem/24px sans-serif;\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its line height in pixels after a spaced slash',
        files: {
          'src/styles/label.css': '.label {\n  font: 1rem / 24px sans-serif;\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its line height by a calc of lengths',
        files: {
          'src/styles/label.css': '.label {\n  font: 1rem/calc(1em + 4px) sans-serif;\n}\n',
        },
      },
      {
        condition: 'a calc sets a line height in lengths',
        files: {
          'src/styles/label.css': '.label {\n  line-height: calc(1em + 4px);\n}\n',
        },
      },
      {
        condition: 'a custom property named for a line height holds pixels',
        files: {
          'src/styles/label.css': ':root {\n  --line-height-body: 24px;\n}\n',
        },
      },
      {
        condition: 'a leading custom property holds pixels',
        files: {
          'src/styles/label.css': ':root {\n  --leading-tight: 20px;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a line height is a unitless number',
        files: {
          'src/styles/label.css': '.label {\n  line-height: 1.5;\n}\n',
        },
      },
      {
        condition: 'a line height is held in a custom property named in pixels',
        files: {
          'src/styles/label.css': '.label {\n  line-height: var(--leading-24px);\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its size in rem and its line height as a number',
        files: {
          'src/styles/label.css': '.label {\n  font: 1rem/1.5 sans-serif;\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its size in pixels and its line height as a number',
        files: {
          'src/styles/label.css': '.label {\n  font: italic 16px/1.5 sans-serif;\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets no line height',
        files: {
          'src/styles/label.css': '.label {\n  font: 1rem sans-serif;\n}\n',
        },
      },
      {
        condition: 'a line height is normal',
        files: {
          'src/styles/label.css': '.label {\n  line-height: normal;\n}\n',
        },
      },
      {
        condition: 'a leading custom property holds a number',
        files: {
          'src/styles/label.css': ':root {\n  --leading-tight: 1.25;\n}\n',
        },
      },
      {
        condition: "a text size's line height is a calc of numbers",
        files: {
          'src/styles/label.css': ':root {\n  --text-sm--line-height: calc(1.25 / 0.875);\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'selector-never-targets-an-id',
    unit: {
      axes: [],
      blocks: [
        'css',
      ],
    },
    reported: [
      {
        condition: 'a stylesheet styles an element by its id',
        files: {
          'src/theme.css':
            '@layer base, components;\n\n@layer base {\n  :root {\n    --color-text: oklch(20% 0 0);\n  }\n}\n\n@layer components {\n  #main {\n    color: var(--color-text);\n  }\n}\n',
        },
      },
      {
        condition: 'a compound selector names an element by its id',
        files: {
          'src/styles/page.css': 'a#main {\n  color: red;\n}\n',
        },
      },
      {
        condition: 'a pseudo-class takes an id as its argument',
        files: {
          'src/styles/page.css': '.card:not(#main) {\n  color: red;\n}\n',
        },
      },
      {
        condition: 'a nested rule targets an id beside its nesting selector',
        files: {
          'src/styles/page.css': '.card {\n  &#main {\n    color: red;\n  }\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a selector styles by class and a colour is written in hex',
        files: {
          'src/styles/page.css': '.main {\n  color: #fff;\n}\n',
        },
      },
      {
        condition: 'a selector matches an id attribute',
        files: {
          'src/styles/page.css': '[id="main"] {\n  color: red;\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'theme-alias-block-written-inline',
    unit: {
      axes: [],
      blocks: [
        'css',
        'tailwind',
      ],
    },
    reported: [
      {
        condition: 'the theme keeps the default scales',
        files: {
          'src/libs/ui/theme/theme.css': '@theme {\n  --color-text: oklch(20% 0 0);\n}\n',
        },
      },
      {
        condition: 'the theme resets only some default scales',
        files: {
          'src/libs/ui/theme/theme.css':
            '@theme {\n  --color-*: initial;\n  --spacing-*: initial;\n}\n',
        },
      },
      {
        condition: 'an alias block is not inline',
        files: {
          'src/libs/ui/theme/theme.css':
            '@theme {\n  --*: initial;\n}\n\n@theme {\n  --spacing-inset-md: var(--space-inset-md);\n}\n',
        },
      },
      {
        condition: 'only a comment names the reset',
        files: {
          'src/libs/ui/theme/theme.css':
            '@theme {\n  /* --*: initial; */\n  --color-text: oklch(20% 0 0);\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the theme resets the default scales',
        files: {
          'src/libs/ui/theme/theme.css':
            '@theme {\n  --*: initial;\n  --color-text: oklch(20% 0 0);\n}\n',
        },
      },
      {
        condition: 'an alias block is inline',
        files: {
          'src/libs/ui/theme/theme.css':
            '@theme inline {\n  --spacing-inset-md: var(--space-inset-md);\n}\n',
        },
      },
      {
        condition: 'an alias block is inline and a reference',
        files: {
          'src/libs/ui/theme/theme.css':
            '@theme inline reference {\n  --color-surface: var(--color-surface);\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'transition-all-never-used',
    unit: {
      axes: [],
      blocks: [
        'css',
        'tailwind',
      ],
    },
    reported: [
      {
        condition: 'a stylesheet applies the transition of every property',
        files: {
          'src/styles/button.css': '.button {\n  @apply transition-all;\n}\n',
        },
      },
      {
        condition: 'a variant applies the transition of every property',
        files: {
          'src/styles/button.css': '.button {\n  @apply duration-fast hover:transition-all;\n}\n',
        },
      },
      {
        condition: 'a utility applies the transition of every property outside a style rule',
        files: {
          'src/styles/button.css': '@utility fade {\n  @apply transition-all;\n}\n',
        },
      },
      {
        condition: 'an important modifier applies the transition of every property',
        files: {
          'src/styles/button.css': '.button {\n  @apply !transition-all;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a stylesheet applies the transition of the colours',
        files: {
          'src/styles/button.css': '.button {\n  @apply transition-colors;\n}\n',
        },
      },
      {
        condition: 'a stylesheet applies the transition of the opacity with a duration',
        files: {
          'src/styles/button.css': '.button {\n  @apply transition-opacity duration-fast;\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'transition-names-its-properties',
    unit: {
      axes: [],
      blocks: [
        'css',
      ],
    },
    reported: [
      {
        condition: 'a transition moves all properties',
        files: {
          'src/styles/button.css': '.button {\n  transition: all 150ms ease-out;\n}\n',
        },
      },
      {
        condition: 'a transition property lists all among others',
        files: {
          'src/styles/button.css': '.button {\n  transition-property: opacity, all;\n}\n',
        },
      },
      {
        condition: 'a transition gives only its duration and easing',
        files: {
          'src/styles/button.css': '.button {\n  transition: 150ms ease-out;\n}\n',
        },
      },
      {
        condition: 'a later item of a transition names no property',
        files: {
          'src/styles/button.css':
            '.button {\n  transition:\n    opacity 150ms ease-out,\n    300ms ease-in;\n}\n',
        },
      },
      {
        condition: 'a prefixed transition moves all properties',
        files: {
          'src/styles/button.css': '.button {\n  -webkit-transition: all 1s;\n}\n',
        },
      },
      {
        condition: 'an important transition gives only its duration',
        files: {
          'src/styles/button.css': '.button {\n  transition: 1s !important;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a transition names the property it moves',
        files: {
          'src/styles/button.css': '.button {\n  transition: opacity 150ms ease-out;\n}\n',
        },
      },
      {
        condition: 'a transition names its property after its duration',
        files: {
          'src/styles/button.css': '.button {\n  transition: 150ms opacity;\n}\n',
        },
      },
      {
        condition: 'a transition names each property it moves on its own line',
        files: {
          'src/styles/button.css':
            '.button {\n  transition:\n    background-color 150ms ease-out,\n    color 150ms ease-out;\n}\n',
        },
      },
      {
        condition: 'a transition eases by a cubic bezier',
        files: {
          'src/styles/button.css':
            '.button {\n  transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);\n}\n',
        },
      },
      {
        condition: 'a transition is none',
        files: {
          'src/styles/button.css': '.button {\n  transition: none;\n}\n',
        },
      },
      {
        condition: 'a transition reads a custom property whose name holds all',
        files: {
          'src/styles/button.css': '.button {\n  transition: var(--all-motion);\n}\n',
        },
      },
      {
        condition: 'a transition duration is set alone',
        files: {
          'src/styles/button.css': '.button {\n  transition-duration: 150ms;\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'type-sized-in-rem',
    unit: {
      axes: [],
      blocks: [
        'css',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'a font size is set in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font-size: 14px;\n}\n',
        },
      },
      {
        condition: 'a font size is set in points',
        files: {
          'src/styles/label.css': '.label {\n  font-size: 12pt;\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its size in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font: italic 16px/1.5 sans-serif;\n}\n',
        },
      },
      {
        condition: 'a clamp adds a term in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font-size: clamp(1rem, 2vw + 14px, 2rem);\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its size in pixels before a spaced slash',
        files: {
          'src/styles/label.css': '.label {\n  font: 16px / 1.5 sans-serif;\n}\n',
        },
      },
      {
        condition: 'a custom property named for a font size holds pixels',
        files: {
          'src/styles/label.css': ':root {\n  --font-size-caption: 12px;\n}\n',
        },
      },
      {
        condition: 'a max takes an argument in pixels alone',
        files: {
          'src/styles/label.css': '.label {\n  font-size: max(1rem, 14px);\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a font size is set in rem',
        files: {
          'src/styles/label.css': '.label {\n  font-size: 0.875rem;\n}\n',
        },
      },
      {
        condition: 'a font size is set in em',
        files: {
          'src/styles/label.css': '.label {\n  font-size: 1.25em;\n}\n',
        },
      },
      {
        condition: 'a clamp has bounds in rem and adds a rem term',
        files: {
          'src/styles/label.css': '.label {\n  font-size: clamp(1rem, 0.5rem + 2vw, 2rem);\n}\n',
        },
      },
      {
        condition: 'a font size is held in a custom property named in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font-size: var(--text-16px);\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its line height after the slash in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font: 1rem/24px sans-serif;\n}\n',
        },
      },
      {
        condition: 'the font shorthand sets its line height after a spaced slash in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font: 1rem / 24px sans-serif;\n}\n',
        },
      },
      {
        condition: 'a calc adds a rem term to a length in pixels',
        files: {
          'src/styles/label.css': '.label {\n  font-size: calc(1rem + 2px);\n}\n',
        },
      },
      {
        condition: "the root's font size is a percentage of the browser's default",
        files: {
          'src/styles/label.css': ':root {\n  font-size: 100%;\n}\n',
        },
      },
      {
        condition: 'a custom property not named for a font size holds pixels',
        files: {
          'src/styles/label.css': ':root {\n  --space-4: 16px;\n}\n',
        },
      },
      {
        condition: 'a font size is inherited',
        files: {
          'src/styles/label.css': '.label {\n  font-size: inherit;\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'viewport-height-leaves-out-the-browsers-toolbars',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
        'css',
      ],
    },
    reported: [
      {
        condition: "a page's height is taken in vh",
        files: {
          'src/styles/page.css': '.page {\n  min-height: 100vh;\n}\n',
        },
      },
      {
        condition: "a page's height is taken in lvh",
        files: {
          'src/styles/page.css': '.page {\n  min-height: 100lvh;\n}\n',
        },
      },
      {
        condition: 'a calc takes a height in vh',
        files: {
          'src/styles/page.css': '.page {\n  block-size: calc(100vh - 4rem);\n}\n',
        },
      },
      {
        condition: 'a fractional height is taken in upper-case VH',
        files: {
          'src/styles/page.css': '.page {\n  height: 50.5VH;\n}\n',
        },
      },
      {
        condition: 'a custom property holds a height in vh',
        files: {
          'src/styles/page.css': ':root {\n  --page-height: 100vh;\n}\n',
        },
      },
      {
        condition: 'a rule inside a media query takes its height in vh',
        files: {
          'src/styles/page.css':
            '@media (min-height: 40vh) {\n  .page {\n    min-height: 100vh;\n  }\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a page's height is taken in svh",
        files: {
          'src/styles/page.css': '.page {\n  min-height: 100svh;\n}\n',
        },
      },
      {
        condition: "a page's height follows the toolbars in dvh",
        files: {
          'src/styles/page.css': '.page {\n  min-height: 100dvh;\n}\n',
        },
      },
      {
        condition: "a media query measures the viewport's height in vh",
        files: {
          'src/styles/page.css':
            '@media (min-height: 40vh) {\n  .page {\n    min-height: 50svh;\n  }\n}\n',
        },
      },
      {
        condition: "a media query nested in a rule measures the viewport's height in vh",
        files: {
          'src/styles/page.css':
            '.page {\n  @media (min-height: 40vh) {\n    min-height: 50svh;\n  }\n}\n',
        },
      },
      {
        condition: 'a container query measures the height in vh',
        files: {
          'src/styles/page.css':
            '@container (min-height: 40vh) {\n  .page {\n    min-height: 50svh;\n  }\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'web-font-served-as-woff2',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
        'css',
      ],
    },
    reported: [
      {
        condition: 'a font face serves a TrueType file',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Body";\n  src: url("/fonts/body.ttf") format("truetype");\n  font-display: swap;\n}\n',
        },
      },
      {
        condition: 'a font face also serves WOFF and TrueType',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Inter";\n  src:\n    url("/fonts/inter.woff2") format("woff2"),\n    url("/fonts/inter.woff") format("woff"),\n    url("/fonts/inter.ttf") format("truetype");\n  font-display: swap;\n}\n',
        },
      },
      {
        condition: 'a font face serves WOFF from a data address',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Body";\n  src: url(data:font/woff;base64,d09GRgABAAA) format("woff");\n  font-display: swap;\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a font face serves WOFF2 and swaps it in',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Body";\n  src: url("/fonts/body.woff2") format("woff2");\n  font-display: swap;\n}\n',
        },
      },
      {
        condition: 'a font face serves WOFF2 with a query and takes a local font first',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Body";\n  src:\n    local("Body"),\n    url(/fonts/body.woff2?v=2) format("woff2");\n  font-display: optional;\n}\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'web-font-shows-its-text-while-it-loads',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
        'css',
      ],
    },
    reported: [
      {
        condition: 'a font face blocks its text while it loads',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Body";\n  src: url("/fonts/body.woff2") format("woff2");\n  font-display: block;\n}\n',
        },
      },
      {
        condition: 'a font face sets no font display',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Body";\n  src: url("/fonts/body.woff2") format("woff2");\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a font face serves WOFF2 and swaps it in',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Body";\n  src: url("/fonts/body.woff2") format("woff2");\n  font-display: swap;\n}\n',
        },
      },
      {
        condition: 'a font face serves WOFF2 with a query and takes a local font first',
        files: {
          'src/styles/fonts.css':
            '@font-face {\n  font-family: "Body";\n  src:\n    local("Body"),\n    url(/fonts/body.woff2?v=2) format("woff2");\n  font-display: optional;\n}\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'configuration-input-read-from-os-environ-only-by-the-provider',
    unit: {
      blocks: [
        'deployment',
      ],
    },
    reported: [
      {
        condition: 'an adapter reads the environment',
        files: {
          'src/shop/infrastructure/mail/mail_adapter.py': 'HOST = os.environ[NAME]\n',
        },
      },
      {
        condition: 'the composition root reads the environment',
        files: {
          'src/shop/root/config/settings.py': 'HOST = os.environ[NAME]\n',
        },
      },
      {
        condition: 'the entry file reads the environment',
        files: {
          'src/shop/main.py': 'HOST = os.getenv(NAME)\n',
        },
      },
      {
        condition: 'a delivery unit imports a read of the environment',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/sync/sync_cli.py':
            'from os import getenv\n',
        },
      },
      {
        condition: 'a read imported under another name',
        files: {
          'src/shop/libs/mail/mail_client.py': 'from os import environ as variables\n',
        },
      },
      {
        condition: 'the environment read through a module imported under another name',
        files: {
          'src/shop/integrations/fastapi/router.py':
            'import os as system\nHOST = system.environ.get(NAME)\n',
        },
      },
      {
        condition: 'the bytes of the environment read',
        files: {
          'src/shop/infrastructure/mail/mail_adapter.py': 'HOST = os.environb[NAME]\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the configuration provider reads the environment',
        files: {
          'src/shop/infrastructure/config/settings.py': 'SETTINGS = parse_settings(os.environ)\n',
        },
      },
      {
        condition: 'a spec drives the program',
        files: {
          'tests/conftest.py': 'HOST = os.environ[NAME]\n',
        },
      },
      {
        condition: 'another name of os',
        files: {
          'src/shop/infrastructure/mail/mail_adapter.py':
            'import os\nPATH = os.path.join(FOLDER, NAME)\n',
        },
      },
      {
        condition: 'a mapping handed in under the same name',
        files: {
          'src/shop/root/wiring.py': 'HOST = environ[NAME]\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'effects-held-only-by-the-edge',
    reported: [
      {
        condition: 'an effectful submodule imported',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'import urllib.request\n',
        },
      },
      {
        condition: 'a name imported from an effectful submodule',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'from urllib.request import urlopen\n',
        },
      },
      {
        condition: 'an effectful submodule imported under another name',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'import http.client as client\n',
        },
      },
      {
        condition: 'an effectful submodule imported from its package',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'from importlib import metadata\n',
        },
      },
      {
        condition: 'a client of the web imported from its package',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'from http import client\n',
        },
      },
      {
        condition: 'an effectful function imported',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'from uuid import uuid4\n',
        },
      },
      {
        condition: 'a time-ordered identifier imported',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'from uuid import uuid7\n',
        },
      },
      {
        condition: 'an effectful function imported under another name',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'from uuid import uuid4 as new_id\n',
        },
      },
      {
        condition: 'a stream among names imported on several lines',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'from sys import (\n  argv,\n  version,\n)\n',
        },
      },
      {
        condition: 'a compressed file opened',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'from bz2 import open\n',
        },
      },
      {
        condition: 'the clock called through an imported class',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'STAMP = datetime.now()\n',
        },
      },
      {
        condition: 'the clock called through its module',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'STAMP = datetime.datetime.utcnow()\n',
        },
      },
      {
        condition: 'the date called through an imported class',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'TODAY = date.today()\n',
        },
      },
      {
        condition: 'an identifier drawn through its module',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'IDENTIFIER = uuid.uuid4()\n',
        },
      },
      {
        condition: 'a file opened by the builtin',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            "TEXT = open('orders.txt').read()\n",
        },
      },
      {
        condition: 'a line read by the builtin',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'ANSWER = input()\n',
        },
      },
      {
        condition: 'a standard stream written',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'sys.stdout.write(TEXT)\n',
        },
      },
      {
        condition: 'the arguments read',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'ARGUMENTS = sys.argv\n',
        },
      },
      {
        condition: 'the process ended',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'sys.exit(1)\n',
        },
      },
      {
        condition: 'a process started through asyncio',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'PROCESS = asyncio.create_subprocess_exec(COMMAND)\n',
        },
      },
      {
        condition: 'an archive opened',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'ARCHIVE = zipfile.ZipFile(PATH)\n',
        },
      },
      {
        condition: 'the locale set',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            "locale.setlocale(locale.LC_ALL, '')\n",
        },
      },
      {
        condition: 'the working folder read through pathlib',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'HERE = Path.cwd()\n',
        },
      },
      {
        condition: 'the home folder read through its module',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'HOME = pathlib.Path.home()\n',
        },
      },
      {
        condition: 'the clock read through a module imported under another name',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'import datetime as dt, json as j\nSTAMP = dt.datetime.now()\n',
        },
      },
      {
        condition: 'the clock read through a class imported under another name',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'import json as j\nfrom datetime import datetime as moment\nSTAMP = moment.now()\n',
        },
      },
      {
        condition: 'an identifier drawn through a module imported under another name',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'import uuid as ids\nIDENTIFIER = ids.uuid4()\n',
        },
      },
      {
        condition: 'a stream written through a module imported under another name',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'import sys as system\nsystem.stderr.write(TEXT)\n',
        },
      },
      {
        condition: 'an effect in the kernel',
        files: {
          'src/shop/kernel/value_objects/order_id_value_object.py': 'NEW = uuid.uuid4()\n',
        },
      },
      {
        condition: 'an effect in a shared folder',
        files: {
          'src/shop/shared/parsing/parse_utils.py': 'TODAY = date.today()\n',
        },
      },
      {
        condition: "an effect in a composition module's domain",
        files: {
          'src/shop/composition/checkout/domain/totals/total.py': 'STAMP = datetime.now()\n',
        },
      },
      {
        condition: "an effect in the program's presentation",
        files: {
          'src/shop/presentation/screens/orders_screen.py': 'sys.stdout.write(TEXT)\n',
        },
      },
      {
        condition: 'an effect in a file of the package root',
        files: {
          'src/shop/version.py': 'from importlib.metadata import version\n',
        },
      },
      {
        condition: "an effect beside an entrypoint's entry file",
        files: {
          'src/shop/entrypoints/worker/jobs.py': 'ARGUMENTS = sys.argv\n',
        },
      },
    ],
    allowed: [
      {
        condition: "an effect in a feature's adapter",
        files: {
          'src/shop/features/orders/infrastructure/http/orders_client.py':
            'import urllib.request\n',
        },
      },
      {
        condition: 'a call to the clock in an adapter',
        files: {
          'src/shop/infrastructure/clock/clock_adapter.py': 'STAMP = datetime.now()\n',
        },
      },
      {
        condition: "an effect in a composition module's adapter",
        files: {
          'src/shop/composition/checkout/infrastructure/mail/mail_adapter.py':
            'sys.stderr.write(TEXT)\n',
        },
      },
      {
        condition: 'an effect in a library of libs/',
        files: {
          'src/shop/libs/tabula/sheet.py': "TEXT = open('orders.txt').read()\n",
        },
      },
      {
        condition: 'an effect in a folder of a library named like a layer',
        files: {
          'src/shop/libs/tabula/domain/sheet.py': 'STAMP = datetime.now()\n',
        },
      },
      {
        condition: 'an effect in the composition root',
        files: {
          'src/shop/root/wiring.py': 'ARGUMENTS = sys.argv\n',
        },
      },
      {
        condition: 'an effect in an integration',
        files: {
          'src/shop/integrations/fastapi/router.py': 'STAMP = datetime.now()\n',
        },
      },
      {
        condition: 'the entry file',
        files: {
          'src/shop/main.py': 'sys.exit(main(sys.argv))\n',
        },
      },
      {
        condition: 'the module entry file',
        files: {
          'src/shop/__main__.py': 'sys.exit(main())\n',
        },
      },
      {
        condition: "an entrypoint's entry file",
        files: {
          'src/shop/entrypoints/worker/main.py': 'ARGUMENTS = sys.argv\n',
        },
      },
      {
        condition: 'a spec',
        files: {
          'tests/test_orders.py': 'IDENTIFIER = uuid.uuid4()\n',
        },
      },
      {
        condition: 'a module that sits in src/ itself',
        files: {
          'src/orders.py': 'IDENTIFIER = uuid.uuid4()\n',
        },
      },
      {
        condition: 'a pure module of a package with an effectful one',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'import urllib.parse\n',
        },
      },
      {
        condition: 'a pure name of a package with an effectful module',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'from http import HTTPStatus\n',
        },
      },
      {
        condition: 'a pure name of asyncio imported',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'from asyncio import TaskGroup\n',
        },
      },
      {
        condition: 'the package reading its own data',
        files: {
          'src/shop/kernel/constants/kinds_constants.py': 'from importlib.resources import files\n',
        },
      },
      {
        condition: 'a call of something with no name',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'VALUE = (lambda: 1)()\n',
        },
      },
      {
        condition: 'a class of dates imported',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'from datetime import date, datetime, timedelta\n',
        },
      },
      {
        condition: 'a pure name of sys read',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'import sys\nVERSION = sys.version_info\n',
        },
      },
      {
        condition: 'a port of the clock called',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'STAMP = clock.now()\n',
        },
      },
      {
        condition: 'a date of the domain moved',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'DUE = order.placed_on.replace(day=1)\n',
        },
      },
      {
        condition: 'a module imported under another name, reached by a pure name',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'import uuid as ids\nIDENTIFIER = ids.UUID(TEXT)\n',
        },
      },
      {
        condition: 'a function of its own named like a module',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'TOTAL = io.total(LINES)\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'file-within-500-lines',
    reported: [
      {
        condition: 'a file of 501 lines',
        files: {
          'src/shop/orders.py':
            'LIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\n',
        },
      },
      {
        condition: 'a file of 501 lines with no final line break',
        files: {
          'src/shop/orders.py':
            'LIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1',
        },
      },
      {
        condition: 'a file of 501 lines whose last is blank',
        files: {
          'src/shop/orders.py':
            'LIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\n\n',
        },
      },
      {
        condition: 'a long file of build code',
        files: {
          'scripts/build_tables.py':
            'LIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a file of 500 lines',
        files: {
          'src/shop/orders.py':
            'LIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\n',
        },
      },
      {
        condition: 'a long spec',
        files: {
          'tests/test_orders.py':
            'LIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\n',
        },
      },
      {
        condition: 'a long helper of specs',
        files: {
          'tests/orders_fixtures.py':
            'LIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\n',
        },
      },
      {
        condition: 'a long generated module',
        files: {
          'src/shop/orders_gen.py':
            'LIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\n',
        },
      },
      {
        condition: 'a long module of a generated folder',
        files: {
          'src/shop/schema_gen/orders.py':
            'LIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\nLIMIT = 1\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'function-within-its-limits',
    reported: [
      {
        condition: 'an async function of more than 100 lines',
        files: {
          'src/shop/orders.py':
            'LIMIT = 1\n\n\nasync def tally() -> int:\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  return total\n',
        },
      },
      {
        condition: 'a method of more than 100 lines',
        files: {
          'src/shop/orders.py':
            'class Tally:\n  def tally() -> int:\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    return total\n',
        },
      },
      {
        condition: 'a decorated function of more than 100 lines',
        files: {
          'src/shop/orders.py':
            '@cache\ndef tally() -> int:\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  return total\n',
        },
      },
      {
        condition: 'a function returning one literal with no suppression',
        files: {
          'src/shop/orders.py':
            'def table() -> list[int]:\n  return [\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n  ]\n',
        },
      },
      {
        condition: 'a function whose suppression names another rule',
        files: {
          'src/shop/orders.py':
            '# Why: a table of the codes.\n# ast-grep-ignore: file-within-500-lines@python\ndef table() -> list[int]:\n  return [\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n  ]\n',
        },
      },
      {
        condition: 'a function nested in a short one',
        files: {
          'src/shop/orders.py':
            'def outer() -> None:\n  def inner() -> int:\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    total = 0\n    return total\n',
        },
      },
      {
        condition: 'a long function of build code',
        files: {
          'scripts/build_tables.py':
            'def tally() -> int:\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  return total\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a function of 100 lines',
        files: {
          'src/shop/orders.py':
            'def tally() -> int:\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  return total\n',
        },
      },
      {
        condition: 'a long function in a spec',
        files: {
          'tests/test_orders.py':
            'def tally() -> int:\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  return total\n',
        },
      },
      {
        condition: 'a long helper of specs',
        files: {
          'tests/orders_fixtures.py':
            'def tally() -> int:\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  return total\n',
        },
      },
      {
        condition: 'a long function in a generated module',
        files: {
          'src/shop/orders_gen.py':
            'def tally() -> int:\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  return total\n',
        },
      },
      {
        condition: 'a long function in a generated folder',
        files: {
          'src/shop/schema_gen/orders.py':
            'def tally() -> int:\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  total = 0\n  return total\n',
        },
      },
      {
        condition: 'a function returning one literal, suppressed with its reason above',
        files: {
          'src/shop/orders.py':
            '# Why: the body is one table the function returns.\n# ast-grep-ignore: function-within-its-limits@python\ndef table() -> list[int]:\n  return [\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n  ]\n',
        },
      },
      {
        condition: 'a decorated function returning one literal, suppressed above its def',
        files: {
          'src/shop/orders.py':
            '@cache\n# Why: the body is one table the function returns.\n# ast-grep-ignore: function-within-its-limits@python\ndef table() -> list[int]:\n  return [\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n    0,\n  ]\n',
        },
      },
    ],
  },
  {
    language: 'python',
    slug: 'sleep-or-call-later-only-at-the-edge',
    reported: [
      {
        condition: 'a timer imported in the domain',
        files: {
          'src/shop/features/orders/domain/order/entities/order_aggregate.py':
            'from asyncio import sleep\n',
        },
      },
      {
        condition: 'a timer in a composition module',
        files: {
          'src/shop/composition/orders/orders_composition.py': 'WAIT = threading.Timer(1, run)\n',
        },
      },
      {
        condition: 'a timer imported under another name',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'from threading import Timer as Countdown\n',
        },
      },
      {
        condition: 'a sleep awaited in a use case',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'async def remind() -> None:\n  await asyncio.sleep(DELAY)\n',
        },
      },
      {
        condition: 'a sleep through a module imported under another name',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'import asyncio as aio\n\n\nasync def remind() -> None:\n  await aio.sleep(DELAY)\n',
        },
      },
      {
        condition: 'a call scheduled on a loop handed in',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'HANDLE = loop.call_later(DELAY, remind)\n',
        },
      },
      {
        condition: 'a call scheduled on the running loop',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'HANDLE = asyncio.get_running_loop().call_at(WHEN, remind)\n',
        },
      },
      {
        condition: "a timer in the program's presentation outside its bindings",
        files: {
          'src/shop/presentation/screens/orders_screen.py': 'from asyncio import sleep\n',
        },
      },
      {
        condition: "a timer in a feature's presentation outside its bindings",
        files: {
          'src/shop/features/orders/presentation/widgets/orders_widget.py':
            'from asyncio import sleep\n',
        },
      },
      {
        condition: 'a timer in the kernel',
        files: {
          'src/shop/kernel/clock_utils.py': 'WAIT = threading.Timer(1, run)\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a binding unit schedules its own work',
        files: {
          'src/shop/features/orders/presentation/bindings/commands/place_order/place_order_cli.py':
            'from asyncio import sleep\n',
        },
      },
      {
        condition: 'a binding unit of a composition module schedules its own work',
        files: {
          'src/shop/composition/checkout/presentation/bindings/commands/pay/pay_cli.py':
            'from asyncio import sleep\n',
        },
      },
      {
        condition: "a unit of the program's bindings schedules its own work",
        files: {
          'src/shop/presentation/bindings/retry_bindings.py':
            'HANDLE = loop.call_later(DELAY, retry)\n',
        },
      },
      {
        condition: 'a timer in an adapter',
        files: {
          'src/shop/infrastructure/clock/clock_adapter.py': 'from asyncio import sleep\n',
        },
      },
      {
        condition: "a timer in a feature's adapter",
        files: {
          'src/shop/features/orders/infrastructure/queue/orders_worker.py':
            'HANDLE = loop.call_at(WHEN, relay)\n',
        },
      },
      {
        condition: 'a timer in the composition root',
        files: {
          'src/shop/root/wiring.py': 'WAIT = threading.Timer(1, stop)\n',
        },
      },
      {
        condition: 'a timer in the entry file',
        files: {
          'src/shop/main.py': 'import asyncio\nasyncio.run(asyncio.sleep(0))\n',
        },
      },
      {
        condition: 'a timer in a library of libs/',
        files: {
          'src/shop/libs/retry/retry.py': 'from asyncio import sleep\n',
        },
      },
      {
        condition: 'a spec',
        files: {
          'tests/test_orders.py': 'from asyncio import sleep\n',
        },
      },
      {
        condition: 'a task group in a use case',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'import asyncio\n\n\nasync def place() -> None:\n  async with asyncio.TaskGroup() as group:\n    group.create_task(reserve())\n',
        },
      },
      {
        condition: 'another name of threading',
        files: {
          'src/shop/features/orders/application/use_cases/commands/place_order_use_case.py':
            'LOCK = threading.Lock()\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'ast-grep-refuses-empty-names',
    reported: [
      {
        condition: 'a variable is named by an empty word',
        files: {
          'src/features/orders/order.ts': 'export const data = 1;\n',
        },
      },
      {
        condition: 'generic code in libs names a value by an empty word',
        files: {
          'src/libs/list/list.utils.ts':
            'export const firstOf = (items: readonly string[]): string | undefined => {\n  const value = items.at(0);\n\n  return value;\n};\n',
        },
      },
      {
        condition: 'a parameter is named by an empty word',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = (data: readonly number[]): number => data.length;\n',
        },
      },
      {
        condition: "an arrow function's lone parameter is named by an empty word",
        files: {
          'src/features/orders/order.ts': 'export const counts = [1, 2].map(item => item + 1);\n',
        },
      },
      {
        condition: 'a parameter property is named by an empty word',
        files: {
          'src/features/orders/order.ts':
            'export class Order {\n  constructor(private readonly info: string) {}\n}\n',
        },
      },
      {
        condition: 'a destructured field keeps an empty word',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = ({ result }: { result: number }): number => result;\n',
        },
      },
      {
        condition: 'a destructured field with a default keeps an empty word',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = ({ result = 0 }: { result?: number }): number => result;\n',
        },
      },
      {
        condition: 'a destructured field is renamed to an empty word',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = ({ total: value }: { total: number }): number => value;\n',
        },
      },
      {
        condition: 'an element of an array is bound to an empty word',
        files: {
          'src/features/orders/order.ts':
            'const [first, temp] = [1, 2];\n\nexport const sum = first + temp;\n',
        },
      },
      {
        condition: 'the rest of a destructured object is bound to an empty word',
        files: {
          'src/features/orders/order.ts':
            'const { id, ...stuff } = { id: 1, total: 2 };\n\nexport const order = { id, stuff };\n',
        },
      },
      {
        condition: 'a loop binds each element to an empty word',
        files: {
          'src/features/orders/order.ts':
            'export const print = (lines: readonly string[]): void => {\n  for (const item of lines) {\n    console.info(item);\n  }\n};\n',
        },
      },
      {
        condition: 'a caught failure is bound to an empty word',
        files: {
          'src/features/orders/order.ts':
            'export const load = (): void => {\n  try {\n    globalThis.focus();\n  } catch (thing) {\n    throw thing;\n  }\n};\n',
        },
      },
      {
        condition: 'an import is bound to an empty word',
        files: {
          'src/features/orders/order.ts':
            "import { order as obj } from './orders';\n\nexport const total = obj.total;\n",
        },
      },
      {
        condition: 'a variable of a markup file is named by an empty word',
        files: {
          'src/features/orders/order-view.tsx':
            'export const OrderView = () => {\n  const arr = [1, 2];\n\n  return <ul>{arr.length}</ul>;\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a name holds an empty word beside the word that says what it holds',
        files: {
          'src/features/orders/order.ts': 'export const orderData = 1;\n',
        },
      },
      {
        condition: 'a property of an object or a member it reads is named by an empty word',
        files: {
          'src/features/orders/order.ts':
            'export const response = { data: 1 };\n\nexport const total = response.data;\n',
        },
      },
      {
        condition: 'a destructured field named by an empty word is renamed to what it holds',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = ({ data: order }: { data: number }): number => order;\n',
        },
      },
      {
        condition: 'an imported empty word is renamed to what it holds',
        files: {
          'src/features/orders/order.ts':
            "import { data as order } from './orders';\n\nexport const total = order.total;\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'ast-grep-refuses-empty-verbs',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a function is named by an empty verb',
        files: {
          'src/features/orders/order.ts': 'export const process = (): number => 1;\n',
        },
      },
      {
        condition: 'a declared function is named by an empty verb',
        files: {
          'src/features/orders/order.ts': 'export function handle(): number {\n  return 1;\n}\n',
        },
      },
      {
        condition: 'a generator is named by an empty verb',
        files: {
          'src/features/orders/order.ts':
            'export function* execute(): Generator<number> {\n  yield 1;\n}\n',
        },
      },
      {
        condition: 'a function expression held by a variable is named by an empty verb',
        files: {
          'src/features/orders/order.ts':
            'export const manage = function (): number {\n  return 1;\n};\n',
        },
      },
      {
        condition: 'a class method is named by an empty verb',
        files: {
          'src/features/orders/order.ts':
            'export class Orders {\n  run(): number {\n    return 1;\n  }\n}\n',
        },
      },
      {
        condition: 'a class method is named get, not a getter',
        files: {
          'src/features/orders/order.ts':
            'export class Orders {\n  get(id: string): string {\n    return id;\n  }\n}\n',
        },
      },
      {
        condition: "an object's method outside a proxy is named by an empty verb",
        files: {
          'src/features/orders/order.ts':
            'export const orders = {\n  update(): number {\n    return 1;\n  },\n};\n',
        },
      },
      {
        condition: "a component's function in a markup file is named by an empty verb",
        files: {
          'src/features/orders/order-view.tsx':
            'export const OrderView = () => {\n  const set = (): void => {};\n\n  return <button onClick={set}>Save</button>;\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: "a proxy's handler names its trap",
        files: {
          'src/settings.ts':
            'export const settings = new Proxy(\n  {},\n  {\n    get(target, property) {\n      return Reflect.get(target, property);\n    },\n  },\n);\n',
        },
      },
      {
        condition: "a handler typed as a proxy's names its trap",
        files: {
          'src/settings.ts':
            'export const handler: ProxyHandler<object> = {\n  get(target, property) {\n    return Reflect.get(target, property);\n  },\n};\n',
        },
      },
      {
        condition: 'a getter is named by an empty verb',
        files: {
          'src/features/orders/order.ts':
            'export class Order {\n  get update(): number {\n    return 1;\n  }\n}\n',
        },
      },
      {
        condition: "a function's name holds an empty verb with its object",
        files: {
          'src/features/orders/order.ts': 'export const handleOrderPlaced = (): number => 1;\n',
        },
      },
      {
        condition: 'a variable named by an empty verb holds no function',
        files: {
          'src/features/orders/order.ts': 'export const run = 1;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'bun-spec-mocks-no-module',
    reported: [
      {
        condition: 'a spec replaces a module',
        files: {
          'src/__tests__/order.test.ts':
            "import { mock } from 'bun:test';\n\nmock.module('./order', () => ({}));\n",
        },
      },
      {
        condition: 'a spec replaces a module through vi',
        files: {
          'src/__tests__/order.test.ts':
            "import { vi } from 'bun:test';\n\nvi.mock('./order', () => ({}));\n",
        },
      },
      {
        condition: 'a spec replaces a module through jest',
        files: {
          'src/order.test.ts': "import { jest } from 'bun:test';\n\njest.mock('./order');\n",
        },
      },
      {
        condition: 'a spec spies on a module it imports whole',
        files: {
          'src/__tests__/order.test.ts':
            "import { spyOn } from 'bun:test';\n\nimport * as payments from '../payments';\n\nspyOn(payments, 'charge');\n",
        },
      },
      {
        condition: 'a spec spies through vi on a module it imports whole',
        files: {
          'src/__tests__/order.test.ts':
            "import { vi } from 'bun:test';\n\nimport * as payments from '../payments';\n\nvi.spyOn(payments, 'charge');\n",
        },
      },
      {
        condition: 'a markup spec replaces a module',
        files: {
          'src/panel.test.tsx':
            "import { mock } from 'bun:test';\n\nmock.module('./order', () => ({}));\n\nexport const view = <p />;\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a spec builds a fake function through vi's object",
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, vi } from 'bun:test';\n\ntest('should call the loader when asked', () => {\n  // Arrange\n  const load = vi.fn();\n\n  // Act\n  load();\n\n  // Assert\n  expect(load).toHaveBeenCalledTimes(1);\n});\n",
        },
      },
      {
        condition: 'a spec spies on a fake object',
        files: {
          'src/__tests__/order.test.ts':
            "import { spyOn } from 'bun:test';\n\nimport * as payments from '../payments';\n\nconst gateway = payments.createGatewayFake();\n\nspyOn(gateway, 'charge');\n",
        },
      },
      {
        condition: 'production code calls a method named like a module mock',
        files: {
          'src/order.ts':
            "export const mock = { module: (name: string): string => name };\n\nmock.module('x');\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'bun-spec-never-sleeps',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a spec sleeps through Bun',
        files: {
          'src/order.test.ts':
            "import { expect, it, test } from 'bun:test';\n\ntest('should save when the user stops typing', async () => {\n  await Bun.sleep(50);\n  expect(1).toBe(1);\n});\n",
        },
      },
      {
        condition: 'a spec sleeps through Bun at once',
        files: {
          'src/__tests__/order.test.ts':
            "import { test } from 'bun:test';\n\ntest('should save when the user stops typing', () => {\n  Bun.sleepSync(50);\n});\n",
        },
      },
      {
        condition: 'a spec waits on a timer inside a promise',
        files: {
          'src/__tests__/order.test.ts':
            "import { test } from 'bun:test';\n\ntest('should save when the user stops typing', async () => {\n  await new Promise((resolve) => {\n    setTimeout(resolve, 50);\n  });\n});\n",
        },
      },
      {
        condition: "a spec imports the setTimeout of node's timers",
        files: {
          'src/__tests__/order.test.ts':
            "import { setTimeout as sleep } from 'node:timers/promises';\n\nawait sleep(50);\n",
        },
      },
      {
        condition: "a spec calls setTimeout of node's timers through its namespace",
        files: {
          'src/__tests__/order.test.ts':
            "import * as timers from 'node:timers/promises';\n\nawait timers.setTimeout(50);\n",
        },
      },
      {
        condition: 'a markup spec sleeps through Bun',
        files: {
          'src/panel.test.tsx':
            "import { test } from 'bun:test';\n\ntest('should show the panel when it loads', async () => {\n  await Bun.sleep(50);\n  const view = <p />;\n});\n",
        },
      },
      {
        condition: 'a spec waits on a timer inside a typed promise',
        files: {
          'src/__tests__/order.test.ts':
            'await new Promise<void>((resolve) => setTimeout(resolve, 50));\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a spec advances a fake clock',
        files: {
          'src/__tests__/order.test.ts':
            "import { setSystemTime, test } from 'bun:test';\n\ntest('should expire the cart when 30 minutes pass', () => {\n  setSystemTime(new Date('2026-03-01T10:30:00Z'));\n});\n",
        },
      },
      {
        condition: 'a spec builds a promise with no timer',
        files: {
          'src/__tests__/order.test.ts':
            'export const ready = new Promise<void>((resolve) => {\n  resolve();\n});\n',
        },
      },
      {
        condition: "a spec imports another member of node's timers",
        files: {
          'src/__tests__/order.test.ts':
            "import { setImmediate } from 'node:timers/promises';\n\nawait setImmediate();\n",
        },
      },
      {
        condition: 'production code sleeps',
        files: {
          'src/retry.ts':
            'export const pause = async (): Promise<void> => {\n  await Bun.sleep(50);\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'bun-test-retries-no-case',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a case is retried',
        files: {
          'src/order.test.ts':
            "import { expect, it, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  expect(1).toBe(1);\n}, { retry: 3 });\n",
        },
      },
      {
        condition: 'a case of a table is retried',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest.each([1, 2])('should keep %d when it is set', (total) => {\n  expect(total).toBe(total);\n}, { retry: 2 });\n",
        },
      },
      {
        condition: 'a retry is given by its shorthand',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, it } from 'bun:test';\n\nconst retry = 3;\n\nit('should add totals when both are set', () => {\n  expect(1).toBe(1);\n}, { retry });\n",
        },
      },
      {
        condition: 'a retry is given under a quoted key',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  expect(1).toBe(1);\n}, { 'retry': 3, timeout: 100 });\n",
        },
      },
      {
        condition: 'a markup case is retried',
        files: {
          'src/panel.test.tsx':
            "import { expect, test } from 'bun:test';\n\ntest('should show the panel when it loads', () => {\n  expect(<p />).toBeDefined();\n}, { retry: 3 });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a case configures a client that retries nothing',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should load orders when the cache is fresh', () => {\n  // Act\n  const options = { queries: { retry: false } };\n\n  // Assert\n  expect(options).toStrictEqual({ queries: { retry: false } });\n});\n",
        },
      },
      {
        condition: 'a case sets only a timeout',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  expect(1).toBe(1);\n}, { timeout: 100 });\n",
        },
      },
      {
        condition: 'a case repeats itself to surface a race',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  expect(1).toBe(1);\n}, { repeats: 20 });\n",
        },
      },
      {
        condition: 'production code retries a call',
        files: {
          'src/order.ts':
            "declare const test: (name: string, options: object) => void;\n\ntest('x', { retry: 3 });\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'cache-key-built-by-its-owners-factory',
    unit: {
      blocks: [
        'integrations/remote-data',
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'a read writes its key inline',
        files: {
          'src/features/orders/presentation/bindings/queries/list-orders/list-orders.hooks.ts':
            "export const listOrdersOptions = { queryKey: ['orders'] };\n",
        },
      },
      {
        condition: 'an invalidation writes its key inline',
        files: {
          'src/features/orders/presentation/bindings/commands/add-line/add-line.hooks.ts':
            "export const refresh = (client: QueryClient): Promise<void> => client.invalidateQueries({ queryKey: ['orders', 'detail'] });\n",
        },
      },
      {
        condition: 'a cached entry is read by an inline key',
        files: {
          'src/features/orders/presentation/bindings/commands/add-line/add-line.hooks.ts':
            "export const cached = (client: QueryClient): unknown => client.getQueryData(['orders']);\n",
        },
      },
      {
        condition: "a cached entry's state is read by an inline key",
        files: {
          'src/features/orders/presentation/bindings/commands/add-line/add-line.hooks.ts':
            "export const state = (client: QueryClient): unknown => client.getQueryState(['orders']);\n",
        },
      },
      {
        condition: 'a cached entry is written under an inline key',
        files: {
          'src/features/orders/presentation/bindings/commands/add-line/add-line.hooks.ts':
            "export const store = (client: QueryClient, order: Order): void => {\n  client.setQueryData(['orders', order.id], order);\n};\n",
        },
      },
      {
        condition: 'a component writes its key inline in a .tsx file',
        files: {
          'src/features/orders/presentation/widgets/order-list-widget/order-list-widget.tsx':
            "export const OrderListWidget = (): React.ReactElement => {\n  const orders = useQuery({ queryKey: ['orders'], queryFn: listOrders });\n\n  return <ul>{orders.data}</ul>;\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a read takes its key from the key factory',
        files: {
          'src/features/orders/presentation/bindings/queries/list-orders/list-orders.hooks.ts':
            "import { orderKeys } from '../../shared/cache';\n\nexport const listOrdersOptions = { queryKey: orderKeys.all };\n",
        },
      },
      {
        condition: 'the key factory builds its keys in the cache utilities',
        files: {
          'src/features/orders/presentation/bindings/shared/cache.ts':
            "export const orderKeys = {\n  all: ['orders'],\n  detail: (orderId: string) => ['orders', orderId],\n};\n\nexport const listOptions = { queryKey: ['orders'] };\n",
        },
      },
      {
        condition: 'a cached entry is written under a key from the factory',
        files: {
          'src/features/orders/presentation/bindings/commands/add-line/add-line.hooks.ts':
            "export const store = (client: QueryClient, order: Order): void => {\n  client.setQueryData(orderKeys.detail(order.id), ['line']);\n};\n",
        },
      },
      {
        condition: 'an array is the value of another property',
        files: {
          'src/features/orders/presentation/bindings/queries/list-orders/list-orders.hooks.ts':
            "export const listOrdersOptions = { queryKey: orderKeys.all, select: ['id'] };\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'case-holds-no-logic',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a case branches',
        files: {
          'src/order.test.ts':
            "import { expect, it, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  if (Date.now() > 0) {\n    expect(1).toBe(1);\n  }\n});\n",
        },
      },
      {
        condition: 'a case loops',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const totals = [1, 2];\n\n  // Assert\n  for (const total of totals) {\n    expect(total).toBeGreaterThan(0);\n  }\n});\n",
        },
      },
      {
        condition: 'a case holds a conditional expression',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\nit('should add totals', () => {\n  // Act\n  const total = Date.now() > 0 ? 1 : 2;\n\n  // Assert\n  expect(total).toBe(1);\n});\n",
        },
      },
      {
        condition: 'a case switches',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const total = 1;\n\n  // Assert\n  switch (total) {\n    case 1:\n      expect(total).toBe(1);\n  }\n});\n",
        },
      },
      {
        condition: 'a case waits in a loop',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  let total = 0;\n\n  // Assert\n  while (total < 1) {\n    total += 1;\n  }\n  expect(total).toBe(1);\n});\n",
        },
      },
      {
        condition: "a table's case branches",
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest.each([1])('should keep %p', (count) => {\n  // Assert\n  if (count > 0) {\n    expect(count).toBe(1);\n  }\n});\n",
        },
      },
      {
        condition: 'a callback a case hands on branches',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const totals = [1, 2].map((total) => (total > 1 ? 2 : 1));\n\n  // Assert\n  expect(totals).toEqual([1, 2]);\n});\n",
        },
      },
      {
        condition: 'a case of a markup file branches',
        files: {
          'src/__tests__/order-view.test.tsx':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const view = <p>{Date.now() > 0 ? 'paid' : 'unpaid'}</p>;\n\n  // Assert\n  expect(view).toBeDefined();\n});\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a table's case takes every input from its row",
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest.each([1])('should keep %p', (count) => {\n  // Act\n  const kept = String(count);\n\n  // Assert\n  expect(kept).toBe('1');\n});\n",
        },
      },
      {
        condition: 'a helper of the spec, outside every case, branches',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\nconst totalOf = (count: number): number => (count > 0 ? count : 0);\n\ntest('should add totals', () => {\n  // Act\n  const total = totalOf(2);\n\n  // Assert\n  expect(total).toBe(2);\n});\n",
        },
      },
      {
        condition: 'code outside the specs branches inside a call named test',
        files: {
          'src/features/orders/order.ts':
            "export const test = (name: string, body: () => number): number => body();\n\nexport const total = test('total', () => (Date.now() > 0 ? 1 : 2));\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'case-named-should-when',
    reported: [
      {
        condition: 'a case does not read should …',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('adds totals', () => {\n  expect(1).toBe(1);\n});\n",
        },
      },
      {
        condition: 'a case named by it does not read should …',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\nit('adds totals', () => {\n  // Arrange\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: "a case's name opens with something before should",
        files: {
          'src/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('it should add totals', () => {\n  // Arrange\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: "a case's name holds only the behaviour word",
        files: {
          'src/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should ', () => {\n  // Arrange\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: "a table's case does not read should …",
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest.each([1])('keeps %p', (count) => {\n  // Assert\n  expect(count).toBe(1);\n});\n",
        },
      },
      {
        condition: 'a case given a timeout does not read should …',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('adds totals', () => {\n  // Assert\n  expect(1).toBe(1);\n}, 5000);\n",
        },
      },
      {
        condition: 'a case named by a template does not read should …',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest(`adds totals`, () => {\n  // Assert\n  expect(1).toBe(1);\n});\n",
        },
      },
      {
        condition: 'a case of a markup file does not read should …',
        files: {
          'src/__tests__/order-view.test.tsx':
            "import { expect, test } from 'bun:test';\n\ntest('renders the order', () => {\n  // Arrange\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a case reads should without a condition',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const total = 1 + 1;\n\n  // Assert\n  expect(total).toBe(2);\n});\n",
        },
      },
      {
        condition: 'a case reads should, then when',
        files: {
          'src/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  // Arrange\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: "a suite's name does not read should",
        files: {
          'src/__tests__/order.test.ts':
            "import { describe, expect, test } from 'bun:test';\n\ndescribe('totalOf', () => {\n  test('should add totals', () => {\n    // Assert\n    expect(1).toBe(1);\n  });\n});\n",
        },
      },
      {
        condition: 'a call named test outside the specs does not read should',
        files: {
          'src/features/orders/order.ts':
            "export const test = (name: string, body: () => number): number => body();\n\nexport const total = test('total', () => 1);\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'case-pins-meaning-never-wording',
    reported: [
      {
        condition: 'toBe expects a sentence',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should check when it runs', () => {\n  // Arrange\n  const given = 1;\n\n  // Act\n  const outcome = String(given);\n\n  // Assert\n  expect(outcome).toBe('the order is not paid');\n});\n",
        },
      },
      {
        condition: 'toThrow expects a sentence',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Assert\n  expect(() => JSON.parse('')).toThrow('Unexpected end of input');\n});\n",
        },
      },
      {
        condition: 'a negated toContain expects a sentence',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const outcome = 'paid';\n\n  // Assert\n  expect(outcome).not.toContain('was not paid');\n});\n",
        },
      },
      {
        condition: 'toMatch expects a pattern of a sentence',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const outcome = 'paid';\n\n  // Assert\n  expect(outcome).toMatch(/order is unpaid/);\n});\n",
        },
      },
      {
        condition: 'toEqual expects a template of a sentence',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const outcome = 'paid';\n\n  // Assert\n  expect(outcome).toEqual(`the order is ${outcome}`);\n});\n",
        },
      },
      {
        condition: "a spec of the package's suites expects a sentence",
        files: {
          'tests/e2e/order.e2e.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const outcome = 'paid';\n\n  // Assert\n  expect(outcome).toBe('Order was not found');\n});\n",
        },
      },
      {
        condition: 'a case of a markup file expects a sentence',
        files: {
          'src/__tests__/order-view.test.tsx':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const view = <p>paid</p>;\n\n  // Assert\n  expect(view.props.children).toBe('the order is paid');\n});\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the expected value is a code',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should check when it runs', () => {\n  // Arrange\n  const given = 1;\n\n  // Act\n  const outcome = String(given);\n\n  // Assert\n  expect(outcome).toBe('order-unpaid');\n});\n",
        },
      },
      {
        condition: 'the expected text holds two words',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const outcome = 'paid';\n\n  // Assert\n  expect(outcome).toBe('order unpaid');\n});\n",
        },
      },
      {
        condition: "the expected value is read from a row of the case's table",
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest.each([['the order is paid']])('should say %s', (expected) => {\n  // Act\n  const outcome = String(expected);\n\n  // Assert\n  expect(outcome).toBe(expected);\n});\n",
        },
      },
      {
        condition: 'a sentence is the value under test, not the expected one',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const outcome = 'the order is paid'.length;\n\n  // Assert\n  expect(outcome).toBe(17);\n});\n",
        },
      },
      {
        condition: 'a matcher that pins no wording takes a sentence',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const outcome = 'paid';\n\n  // Assert\n  expect(outcome).toHaveProperty('the order is paid');\n});\n",
        },
      },
      {
        condition: 'code outside the specs compares a sentence',
        files: {
          'src/features/orders/order.ts':
            "export const isPaid = (outcome: { toBe: (text: string) => boolean }): boolean =>\n  outcome.toBe('the order is paid');\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'case-split-by-arrange-act-assert-comments',
    reported: [
      {
        condition: 'a case opens no section',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  expect(1 + 1).toBe(2);\n});\n",
        },
      },
      {
        condition: "a case's body is an expression",
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => expect(1 + 1).toBe(2));\n",
        },
      },
      {
        condition: 'a case asserts before it acts',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  const count = 2;\n\n  // Assert\n  expect(count).toBe(2);\n\n  // Act\n  const total = count * 3;\n});\n",
        },
      },
      {
        condition: 'a case acts and never asserts',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  const count = 2;\n\n  // Act\n  expect(count * 3).toBe(6);\n});\n",
        },
      },
      {
        condition: 'a case leaves its Arrange empty',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  // Act\n  const total = 2 * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: 'a case leaves its Act empty',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  const total = 2 * 3;\n\n  // Act\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: 'a case leaves its Assert empty',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  const count = 2;\n\n  // Act\n  expect(count * 3).toBe(6);\n\n  // Assert\n});\n",
        },
      },
      {
        condition: 'a case arranges after it acts',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const total = 2 * 3;\n\n  // Assert\n  expect(total).toBe(6);\n\n  // Arrange\n  const count = 2;\n\n  // Act\n  const doubled = count * 2;\n\n  // Assert\n  expect(doubled).toBe(4);\n});\n",
        },
      },
      {
        condition: 'a case arranges twice',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  const count = 2;\n\n  // Arrange\n  const factor = 3;\n\n  // Act\n  const total = count * factor;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: 'a case acts twice before it asserts',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Act\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: 'a case sets things up before its first section without an Arrange',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: "a step's comment says more than its name",
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange: two of them\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: 'a case of a markup file opens no section',
        files: {
          'src/__tests__/order-view.test.tsx':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  expect(<p>paid</p>).toBeDefined();\n});\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a case arranges, acts and asserts',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: 'a case that arranges nothing leaves its Arrange out',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest.each([2])('should triple %p', (count) => {\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: 'a lifecycle case repeats its Act and Assert for each move',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  const count = 2;\n\n  // Act\n  const doubled = count * 2;\n\n  // Assert\n  expect(doubled).toBe(4);\n\n  // Act\n  const tripled = doubled * 3;\n\n  // Assert\n  expect(tripled).toBe(12);\n});\n",
        },
      },
      {
        condition: 'a step holds a comment of its own beside its code',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  // Why: two is the smallest count that doubles.\n  const count = 2;\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: 'an async case awaits in its steps',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', async () => {\n  // Arrange\n  const count = await Promise.resolve(2);\n\n  // Act\n  const total = count * 3;\n\n  // Assert\n  expect(total).toBe(6);\n});\n",
        },
      },
      {
        condition: 'a case of a markup file arranges, acts and asserts',
        files: {
          'src/__tests__/order-view.test.tsx':
            "import { expect, test } from 'bun:test';\n\ntest('should add totals', () => {\n  // Arrange\n  const label = 'paid';\n\n  // Act\n  const view = <p>{label}</p>;\n\n  // Assert\n  expect(view).toBeDefined();\n});\n",
        },
      },
      {
        condition: 'a suite holds its cases without sections of its own',
        files: {
          'src/__tests__/order.test.ts':
            "import { describe, expect, test } from 'bun:test';\n\ndescribe('totalOf', () => {\n  test('should add totals', () => {\n    // Act\n    const total = 2 * 3;\n\n    // Assert\n    expect(total).toBe(6);\n  });\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'failure-never-dropped-unread',
    reported: [
      {
        condition: 'a catch holds only a comment',
        files: {
          'src/features/orders/presentation/load.ts':
            'export const load = (): void => {\n  try {\n    globalThis.focus();\n  } catch {\n    // ignore\n  }\n};\n',
        },
      },
      {
        condition: 'a catch holds only a block comment',
        files: {
          'src/features/orders/presentation/load.ts':
            'export const load = (): void => {\n  try {\n    globalThis.focus();\n  } catch (error) {\n    /* ignore */\n  }\n};\n',
        },
      },
      {
        condition: 'a catch of a spec holds only a comment',
        files: {
          'src/__tests__/load.test.ts':
            "import { test } from 'bun:test';\n\ntry {\n  globalThis.focus();\n} catch {\n  // ignore\n}\n\ntest('should load', () => {});\n",
        },
      },
      {
        condition: 'a catch of a markup file holds only a comment',
        files: {
          'src/features/orders/presentation/load-view.tsx':
            'export const LoadView = () => {\n  try {\n    globalThis.focus();\n  } catch {\n    // ignore\n  }\n\n  return <p>loaded</p>;\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a catch handles what it recognises and rethrows the rest',
        files: {
          'src/features/orders/presentation/load.ts':
            'export const load = (): void => {\n  try {\n    globalThis.focus();\n  } catch (error) {\n    // Why: focus fails only outside a window.\n    if (error instanceof TypeError) {\n      return;\n    }\n\n    throw error;\n  }\n};\n',
        },
      },
      {
        condition: "a catch is empty, which Biome's own rule refuses",
        files: {
          'src/features/orders/presentation/load.ts':
            'export const load = (): void => {\n  try {\n    globalThis.focus();\n  } catch {}\n};\n',
        },
      },
      {
        condition: 'a block that is no catch holds only a comment',
        files: {
          'src/features/orders/presentation/load.ts':
            'export const load = (): void => {\n  try {\n    globalThis.focus();\n  } finally {\n    // nothing to release\n  }\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'child-process-started-without-a-shell',
    unit: {
      axes: [],
      blocks: [
        'js-runtime/bun',
      ],
    },
    reported: [
      {
        condition: 'a process is started through exec',
        files: {
          'src/listing.ts':
            "import { exec } from 'node:child_process';\n\nexport const list = (): void => {\n  exec('ls');\n};\n",
        },
      },
      {
        condition: "a process is started through execSync of the module's namespace",
        files: {
          'src/listing.ts':
            "import * as childProcess from 'node:child_process';\n\nexport const list = (): void => {\n  childProcess.execSync('ls');\n};\n",
        },
      },
      {
        condition: 'a process is started with shell: true',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: {}, shell: true });\n};\n",
        },
      },
      {
        condition: 'a process is started with a shell named by its path',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: {}, shell: '/bin/sh' });\n};\n",
        },
      },
      {
        condition: 'a process is started through execSync imported under a name of its own',
        files: {
          'src/listing.ts':
            "import { execSync as run } from 'child_process';\n\nexport const list = (): void => {\n  run('ls');\n};\n",
        },
      },
      {
        condition: "a process is started through exec of the module's default import",
        files: {
          'src/listing.ts':
            "import childProcess from 'node:child_process';\n\nexport const list = (): void => {\n  childProcess.exec('ls');\n};\n",
        },
      },
      {
        condition: 'a process is started with a shell named by a template',
        files: {
          'src/listing.ts':
            "import { execFile } from 'node:child_process';\n\nexport const list = (): void => {\n  execFile('ls', [], { env: {}, shell: `/bin/sh` });\n};\n",
        },
      },
      {
        condition: "a process is started with shell: true through the module's namespace",
        files: {
          'src/listing.ts':
            "import * as childProcess from 'node:child_process';\n\nexport const list = (): void => {\n  childProcess.spawn('ls', [], { env: {}, shell: true });\n};\n",
        },
      },
      {
        condition: 'a component starts a process through exec',
        files: {
          'src/listing.tsx':
            "import { exec } from 'node:child_process';\n\nexport const List = () => {\n  exec('ls');\n\n  return <p />;\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a process is started with its arguments as an array',
        files: {
          'src/listing.ts':
            "import { execFile } from 'node:child_process';\n\nexport const list = (): void => {\n  execFile('ls', ['-l']);\n};\n",
        },
      },
      {
        condition: 'a process is started with shell: false',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: {}, shell: false });\n};\n",
        },
      },
      {
        condition: 'a regular expression is executed',
        files: {
          'src/listing.ts':
            "import { execFile } from 'node:child_process';\n\nexport const firstOf = (text: string): string | undefined => /a/.exec(text)?.[0];\n\nexport { execFile };\n",
        },
      },
      {
        condition: 'a process is forked with its arguments as an array',
        files: {
          'src/listing.ts':
            "import { fork } from 'node:child_process';\n\nexport const list = (): void => {\n  fork('worker.js', ['--once'], { env: {} });\n};\n",
        },
      },
      {
        condition: 'an object that starts no process names a shell',
        files: {
          'src/settings.ts': "export const settings = { shell: '/bin/zsh' };\n",
        },
      },
      {
        condition: "a method named exec of another module's namespace is called",
        files: {
          'src/listing.ts':
            "import * as database from './database';\n\nexport const list = (): void => {\n  database.exec('select 1');\n};\n",
        },
      },
      {
        condition: 'a type of child_process is imported',
        files: {
          'src/listing.ts':
            "import type { ExecFileOptions } from 'node:child_process';\n\nexport const options: ExecFileOptions = { env: {} };\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'class-never-opens-with-a-max-variant',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a class list narrows with a max-* breakpoint',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='flex max-md:hidden' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list opens a class with a max-* breakpoint first in its string',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <nav className='max-sm:flex-col' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class helper in a .ts file narrows with a max-* breakpoint',
        files: {
          'src/ui/classes.ts': "export const panel = cn('flex', 'max-md:flex-col');\n",
        },
      },
      {
        condition: 'a cva base narrows with a max-* breakpoint',
        files: {
          'src/ui/classes.ts':
            "export const panel = cva('flex max-lg:hidden', { variants: {} });\n",
        },
      },
      {
        condition: 'a template literal in a class helper narrows with a max-* breakpoint',
        files: {
          'src/ui/classes.ts':
            'export const panel = (gap: string): string => cn(`flex ${gap} max-md:hidden`);\n',
        },
      },
      {
        condition: 'a class helper inside className narrows with a max-* breakpoint',
        files: {
          'src/ui/panel.tsx':
            "export const Panel = ({ isOpen }: { isOpen: boolean }) => <div className={cn('flex', isOpen && 'max-md:hidden')} />;\n",
        },
      },
      {
        condition: 'a class helper in another attribute narrows with a max-* breakpoint',
        files: {
          'src/ui/panel.tsx':
            "export const Panel = () => <Card bodyClassName={cn('max-md:hidden')} />;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a max-* breakpoint bounds a range after a minimum',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='md:max-lg:hidden' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list caps a size with a max- utility',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='max-w-prose md:max-w-2xl' />\n  );\n}\n",
        },
      },
      {
        condition: 'a string outside a class list holds a max-* breakpoint',
        files: {
          'src/ui/classes.ts': "export const hint = 'max-md:hidden';\n",
        },
      },
      {
        condition: 'an attribute other than className holds a max-* breakpoint',
        files: {
          'src/ui/panel.tsx': "export const Panel = () => <div title='max-md:hidden' />;\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'closed-name-set-is-a-string-enum',
    reported: [
      {
        condition: 'a type is taken from an as-const array',
        files: {
          'src/features/orders/domain/order-status.ts':
            "const STATUSES = ['open', 'closed'] as const;\n\nexport type OrderStatus = (typeof STATUSES)[number];\n",
        },
      },
      {
        condition: 'a closed set is a union of string literals',
        files: {
          'src/features/orders/domain/order/value-objects/order-status.value-object.ts':
            "export type OrderStatus = 'placed' | 'paid' | 'shipped' | 'cancelled';\n",
        },
      },
      {
        condition: 'a type is taken from the values of an as-const object',
        files: {
          'src/features/orders/domain/order-status.ts':
            "const ORDER_STATUS = { Open: 'open', Closed: 'closed' } as const;\n\nexport type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];\n",
        },
      },
      {
        condition: 'a type is taken from an as-const array without parentheses',
        files: {
          'src/features/orders/domain/order-status.ts':
            "const STATUSES = ['open', 'closed'] as const;\n\nexport type OrderStatus = typeof STATUSES[number];\n",
        },
      },
      {
        condition:
          'a type is taken from an as-const array of strings while an enum subset sits beside it',
        files: {
          'src/features/orders/domain/order-status.ts':
            "enum OrderStatus {\n  Open = 'open',\n  Closed = 'closed',\n}\n\nexport const OPEN_STATUSES = [OrderStatus.Open] as const;\n\nconst NAMES = ['open', 'closed'] as const;\n\nexport type OrderStatusName = (typeof NAMES)[number];\n",
        },
      },
      {
        condition: "a field's type is a union of string literals",
        files: {
          'src/features/orders/domain/order.ts':
            "export type Order = {\n  readonly status: 'open' | 'closed';\n};\n",
        },
      },
      {
        condition: 'a .tsx file declares a union of string literals',
        files: {
          'src/ui/badge.tsx':
            "export type BadgeTone = 'neutral' | 'danger';\n\nexport const Badge = (props: { readonly tone: BadgeTone }): React.ReactElement => <span>{props.tone}</span>;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a union mixes a string literal with another type',
        files: {
          'src/features/orders/domain/limit.ts': "export type Limit = 'none' | number;\n",
        },
      },
      {
        condition: 'a union of keys is given to Omit',
        files: {
          'src/features/orders/domain/draft.ts':
            "import type { Order } from './order';\n\nexport type OrderDraft = Omit<Order, 'id' | 'placedAt'>;\n",
        },
      },
      {
        condition: 'a union of members is given to Exclude',
        files: {
          'src/features/orders/domain/open.ts':
            "import type { Status } from './status';\n\nexport type OpenStatus = Exclude<Status, 'closed' | 'cancelled'>;\n",
        },
      },
      {
        condition: "an enum subset's type is taken from its list",
        files: {
          'src/features/orders/domain/order/value-objects/order-status.value-object.ts':
            "export enum OrderStatus {\n  Placed = 'placed',\n  Paid = 'paid',\n}\n\nexport const CANCELLABLE_STATUSES = [OrderStatus.Placed, OrderStatus.Paid] as const;\n\nexport type CancellableStatus = (typeof CANCELLABLE_STATUSES)[number];\n",
        },
      },
      {
        condition: 'a closed set is a string enum',
        files: {
          'src/features/orders/domain/order/value-objects/order-status.value-object.ts':
            "export enum OrderStatus {\n  Placed = 'placed',\n  Paid = 'paid',\n}\n",
        },
      },
      {
        condition: "a wire model keeps another party's literals",
        files: {
          'src/features/orders/infrastructure/api/dtos/order.dto.ts':
            "export type OrderDto = {\n  readonly state: 'OPEN' | 'CLOSED';\n};\n",
        },
      },
      {
        condition: 'an element is taken from an array type by its index',
        files: {
          'src/features/orders/domain/line.ts':
            "import type { Order } from './order';\n\nexport type OrderLine = Order['lines'][number];\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'component-module-exports-only-components',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
      ],
    },
    reported: [
      {
        condition: 'a module exports a value beside its component',
        files: {
          'src/ui/panel.tsx':
            'export const PANEL_WIDTH = 4;\n\nexport const Panel = (): React.ReactElement => <section />;\n',
        },
      },
      {
        condition: 'a module exports a hook beside its component',
        files: {
          'src/ui/cart-summary.tsx':
            'export const useCart = (): Cart => use(CartContext);\n\nexport const CartSummary = (): React.ReactElement => <Total of={useCart()} />;\n',
        },
      },
      {
        condition: 'a module exports a context under a PascalCase name beside its component',
        files: {
          'src/ui/panel.tsx':
            "import { createContext } from 'react';\n\nexport const PanelContext = createContext('light');\n\nexport const Panel = (): React.ReactElement => <section />;\n",
        },
      },
      {
        condition:
          'a module exports a function in camelCase beside a component it declares as a function',
        files: {
          'src/ui/panel.tsx':
            'export function formatTotal(total: number): string {\n  return String(total);\n}\n\nexport function Panel(): React.ReactElement {\n  return <section />;\n}\n',
        },
      },
      {
        condition: 'a module exports by name a helper it declares beside its component',
        files: {
          'src/ui/panel.tsx':
            'const helper = (): number => 1;\n\nexport const Panel = (): React.ReactElement => <section />;\n\nexport { helper };\n',
        },
      },
      {
        condition:
          'a module exports by name a PascalCase constant it declares beside its component',
        files: {
          'src/ui/panel.tsx':
            'const Limit = 4;\n\nexport const Panel = (): React.ReactElement => <section />;\n\nexport { Limit };\n',
        },
      },
      {
        condition: 'a module exports by name a camelCase name it imports beside its component',
        files: {
          'src/ui/panel.tsx':
            "import { formatTotal } from './format';\n\nexport const Panel = (): React.ReactElement => <section />;\n\nexport { formatTotal };\n",
        },
      },
      {
        condition: 'a module re-exports a camelCase name beside its component',
        files: {
          'src/ui/panel.tsx':
            "export { formatTotal } from './format';\n\nexport const Panel = (): React.ReactElement => <section />;\n",
        },
      },
      {
        condition: 'a module re-exports everything beside its component',
        files: {
          'src/ui/panel.tsx':
            "export * from './format';\n\nexport const Panel = (): React.ReactElement => <section />;\n",
        },
      },
      {
        condition: 'a module re-exports a namespace beside its component',
        files: {
          'src/ui/panel.tsx':
            "export * as format from './format';\n\nexport const Panel = (): React.ReactElement => <section />;\n",
        },
      },
      {
        condition: 'a module exports an enumeration beside its component',
        files: {
          'src/ui/panel.tsx':
            "export enum Size {\n  Small = 'small',\n}\n\nexport const Panel = (): React.ReactElement => <section />;\n",
        },
      },
      {
        condition: 'a module exports a class beside its component',
        files: {
          'src/ui/panel.tsx':
            'export class Store {}\n\nexport const Panel = (): React.ReactElement => <section />;\n',
        },
      },
      {
        condition: 'a module exports a value beside a component it exports by name',
        files: {
          'src/ui/panel.tsx':
            'const Panel = (): React.ReactElement => <section />;\n\nexport const LIMIT = 1;\nexport { Panel };\n',
        },
      },
      {
        condition: 'a module exports a value beside a component it exports under another name',
        files: {
          'src/ui/panel.tsx':
            'function PanelView(): React.ReactElement {\n  return <section />;\n}\n\nexport const LIMIT = 1;\nexport { PanelView as Panel };\n',
        },
      },
      {
        condition:
          'a module exports a value beside a compound whose root is declared as a function',
        files: {
          'src/ui/menu.tsx':
            'function MenuRoot(): React.ReactElement {\n  return <ul />;\n}\nconst MenuItem = (): React.ReactElement => <li />;\n\nexport const Menu = Object.assign(MenuRoot, { Item: MenuItem });\nexport const size = 1;\n',
        },
      },
      {
        condition: 'a module exports a value beside a component wrapped in memo',
        files: {
          'src/ui/panel.tsx':
            "import { memo } from 'react';\n\nexport const Panel = memo((): React.ReactElement => <section />);\nexport const LIMIT = 1;\n",
        },
      },
      {
        condition: 'a module exports a value beside a component wrapped in React.forwardRef',
        files: {
          'src/ui/panel.tsx':
            "import React from 'react';\n\nexport const Input = React.forwardRef<HTMLInputElement>((props, ref) => <input ref={ref} {...props} />);\nexport const LIMIT = 1;\n",
        },
      },
      {
        condition: 'a module exports a value beside its default-exported component function',
        files: {
          'src/ui/panel.tsx':
            'export default function Panel(): React.ReactElement {\n  return <section />;\n}\n\nexport const LIMIT = 1;\n',
        },
      },
      {
        condition: 'a module exports a value beside the component it default-exports by name',
        files: {
          'src/ui/panel.tsx':
            'const Panel = (): React.ReactElement => <section />;\n\nexport const LIMIT = 1;\nexport default Panel;\n',
        },
      },
      {
        condition: 'a module default-exports a value beside its component',
        files: {
          'src/ui/panel.tsx':
            'export const Panel = (): React.ReactElement => <section />;\n\nexport default 4;\n',
        },
      },
      {
        condition:
          'a module exports a PascalCase constant that holds no component beside its component',
        files: {
          'src/ui/panel.tsx':
            'export const Panel = 4;\nexport const Card = (): React.ReactElement => <article />;\n',
        },
      },
      {
        condition: "a module exports a route's settings beside its component",
        files: {
          'src/routes/index.tsx':
            "export const Route = createFileRoute('/')({ component: Home });\n\nexport const Home = (): React.ReactElement => <main />;\n",
        },
      },
      {
        condition: 'a module exports a value before its component in one declaration',
        files: {
          'src/ui/panel.tsx':
            'export const LIMIT = 1, Panel = (): React.ReactElement => <section />;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a module exports a compound and its prop types',
        files: {
          'src/ui/menu.tsx':
            'export type MenuProps = { readonly label: string };\n\nconst MenuRoot = (props: MenuProps): React.ReactElement => <ul aria-label={props.label} />;\nconst MenuItem = (): React.ReactElement => <li />;\n\nexport const Menu = Object.assign(MenuRoot, { Item: MenuItem });\n',
        },
      },
      {
        condition: 'a module exports only values and hooks',
        files: {
          'src/ui/panel.tsx':
            'export const LIMIT = 4;\nexport const useLimit = (): number => LIMIT;\n',
        },
      },
      {
        condition: 'a module exports a component beside its types in every type-only form',
        files: {
          'src/ui/panel.tsx':
            "import type { Size } from './size';\n\nexport type { Size } from './size';\nexport { type Tone } from './tone';\nexport type PanelProps = { readonly size: Size };\nexport interface PanelState {\n  readonly isOpen: boolean;\n}\ntype Shade = 'light';\nexport type { Shade };\nexport { type Shade as PanelShade };\n\nexport const Panel = (): React.ReactElement => <section />;\n",
        },
      },
      {
        condition: 'a module exports a component beside a PascalCase name it re-exports',
        files: {
          'src/ui/panel.tsx':
            "export { Card } from './card';\n\nexport const Panel = (): React.ReactElement => <section />;\n",
        },
      },
      {
        condition: 'a module exports a component beside a PascalCase name it imports',
        files: {
          'src/ui/panel.tsx':
            "import { Card } from './card';\n\nexport const Panel = (): React.ReactElement => <section />;\n\nexport { Card };\n",
        },
      },
      {
        condition: 'a module exports a component beside a type it exports by name',
        files: {
          'src/ui/panel.tsx':
            'type PanelProps = { readonly size: number };\n\nexport const Panel = (): React.ReactElement => <section />;\n\nexport { PanelProps };\n',
        },
      },
      {
        condition: 'a module keeps its helpers and constants to itself beside its component',
        files: {
          'src/ui/panel.tsx':
            'const LIMIT = 4;\nconst widthOf = (count: number): number => count * LIMIT;\n\nexport const Panel = (): React.ReactElement => <section style={{ width: widthOf(2) }} />;\n',
        },
      },
      {
        condition: 'a module exports components wrapped in memo and forwardRef',
        files: {
          'src/ui/panel.tsx':
            "import { forwardRef, memo } from 'react';\n\nexport const Panel = memo((): React.ReactElement => <section />);\nexport const Input = forwardRef<HTMLInputElement>((props, ref) => <input ref={ref} {...props} />);\n",
        },
      },
      {
        condition: 'a module exports a component function and a component expression',
        files: {
          'src/ui/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return <section />;\n}\n\nexport const Card = function Card(): React.ReactElement {\n  return <article />;\n};\n',
        },
      },
      {
        condition: 'a module default-exports the component it declares',
        files: {
          'src/ui/panel.tsx':
            'const Panel = (): React.ReactElement => <section />;\n\nexport default Panel;\n',
        },
      },
      {
        condition: 'a module default-exports a component function',
        files: {
          'src/ui/panel.tsx':
            'export default function Panel(): React.ReactElement {\n  return <section />;\n}\n',
        },
      },
      {
        condition: 'a module exports two compounds',
        files: {
          'src/ui/menu.tsx':
            'const MenuRoot = (): React.ReactElement => <ul />;\nconst TabsRoot = (): React.ReactElement => <div />;\nconst MenuItem = (): React.ReactElement => <li />;\n\nexport const Menu = Object.assign(MenuRoot, { Item: MenuItem });\nexport const Tabs = Object.assign(TabsRoot, { Item: MenuItem });\n',
        },
      },
      {
        condition: 'a .ts module exports a value beside a component',
        files: {
          'src/ui/panel.ts': 'export const LIMIT = 4;\nexport const Panel = (): null => null;\n',
        },
      },
      {
        condition: 'a component declares its own constants inside its body',
        files: {
          'src/ui/panel.tsx':
            'export const Panel = (): React.ReactElement => {\n  const width = 4;\n\n  return <section style={{ width }} />;\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'compound-part-keyed-in-pascal-case',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
      ],
    },
    reported: [
      {
        condition: 'an object outside a compound has a PascalCase key',
        files: {
          'src/ui/theme.tsx': "export const theme = { Primary: 'blue' };\n",
        },
      },
      {
        condition: 'an object handed to another call than Object.assign has a PascalCase key',
        files: {
          'src/ui/menu.tsx': 'export const styles = createStyles({ Header: { padding: 0 } });\n',
        },
      },
      {
        condition: "a compound's module also declares an object with a PascalCase key",
        files: {
          'src/ui/menu.tsx':
            "const MenuRoot = (): React.ReactElement => <ul />;\nconst MenuItem = (): React.ReactElement => <li />;\nconst labels = { Title: 'Menu' };\n\nexport const Menu = Object.assign(MenuRoot, { Item: MenuItem, label: labels.Title });\n",
        },
      },
      {
        condition: 'an object outside a compound has a PascalCase shorthand key',
        files: {
          'src/ui/theme.tsx': "const Primary = 'blue';\n\nexport const theme = { Primary };\n",
        },
      },
      {
        condition: 'a type outside a compound has a PascalCase property',
        files: {
          'src/ui/theme.tsx': 'export type Theme = { Primary: string };\n',
        },
      },
      {
        condition: 'an interface has a PascalCase property',
        files: {
          'src/ui/theme.tsx': 'export interface Theme {\n  readonly Primary: string;\n}\n',
        },
      },
      {
        condition: "a JSX attribute's object has a PascalCase key",
        files: {
          'src/ui/root.tsx':
            'export const Root = (): React.ReactElement => <Provider search={{ SearchDialog: Dialog }} />;\n',
        },
      },
      {
        condition: 'a PascalCase key is wrapped in underscores',
        files: {
          'src/ui/theme.tsx': "export const theme = { _Primary_: 'blue' };\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a compound attaches its part to its root by Object.assign',
        files: {
          'src/ui/menu.tsx':
            'const MenuRoot = (): React.ReactElement => <ul />;\nconst MenuItem = (): React.ReactElement => <li />;\n\nexport const Menu = Object.assign(MenuRoot, { Item: MenuItem });\n',
        },
      },
      {
        condition: "a compound's typed Object.assign names its parts in its type",
        files: {
          'src/ui/order-card.tsx':
            'const OrderCardRoot = (): React.ReactElement => <article />;\nconst OrderCardHeader = (): React.ReactElement => <header />;\n\nexport const OrderCard: typeof OrderCardRoot & {\n  Header: typeof OrderCardHeader;\n} = Object.assign(OrderCardRoot, { Header: OrderCardHeader });\n',
        },
      },
      {
        condition: 'a compound attaches its part by a shorthand key',
        files: {
          'src/ui/menu.tsx':
            'const MenuRoot = (): React.ReactElement => <ul />;\nconst Item = (): React.ReactElement => <li />;\n\nexport const Menu = Object.assign(MenuRoot, { Item });\n',
        },
      },
      {
        condition: 'an object has camelCase keys',
        files: {
          'src/ui/theme.tsx':
            "export type Theme = { primary: string };\n\nexport const theme: Theme = { primary: 'blue' };\n",
        },
      },
      {
        condition: 'an object has a quoted PascalCase key',
        files: {
          'src/ui/theme.tsx': "export const headers = { 'Content-Type': 'text/html' };\n",
        },
      },
      {
        condition: 'a destructuring names a PascalCase binding',
        files: {
          'src/ui/menu.tsx':
            "export const Item = ({ Icon }: { readonly icon: never } & Record<'Icon', () => React.ReactElement>): React.ReactElement => <Icon />;\n",
        },
      },
      {
        condition: 'a .ts file has a PascalCase key',
        files: {
          'src/ui/theme.ts': "export const theme = { Primary: 'blue' };\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'duration-measured-by-performance-now',
    reported: [
      {
        condition: 'a duration is the difference of two Date.now() readings',
        files: {
          'src/timing.ts':
            'const startedAt = Date.now();\n\nexport const elapsed = (): number => Date.now() - startedAt;\n',
        },
      },
      {
        condition: 'a duration is the difference of two Date readings',
        files: {
          'src/timing.ts':
            'const startedAt = new Date().getTime();\n\nexport const elapsed = (): number => new Date().getTime() - startedAt;\n',
        },
      },
      {
        condition: "a duration is taken from a class's field that holds a Date.now() reading",
        files: {
          'src/timing.ts':
            'export class Job {\n  readonly startedAt = Date.now();\n\n  elapsed(): number {\n    return Date.now() - this.startedAt;\n  }\n}\n',
        },
      },
      {
        condition: 'a duration is the difference of two Temporal.Now readings',
        files: {
          'src/timing.ts':
            'const startedAt = Temporal.Now.instant();\n\nexport const elapsed = (): Temporal.Duration => Temporal.Now.instant().since(startedAt);\n',
        },
      },
      {
        condition: 'a function times its work by a Date.now() reading it assigns',
        files: {
          'src/timing.ts':
            'export const time = (work: () => void): number => {\n  let start = 0;\n\n  start = Date.now();\n  work();\n\n  return Date.now() - start;\n};\n',
        },
      },
      {
        condition: 'a loop times each job by a Date.now() reading of its own',
        files: {
          'src/timing.ts':
            'export const timesOf = (jobs: readonly (() => void)[]): readonly number[] => {\n  const times: number[] = [];\n\n  for (const job of jobs) {\n    const start = Date.now();\n\n    job();\n    times.push(Date.now() - start);\n  }\n\n  return times;\n};\n',
        },
      },
      {
        condition: 'a try block times its work by a Date.now() reading of its own',
        files: {
          'src/timing.ts':
            "export const time = (work: () => void): number => {\n  try {\n    const start = Date.now();\n\n    work();\n\n    return Date.now() - start;\n  } finally {\n    console.info('timed');\n  }\n};\n",
        },
      },
      {
        condition: 'a duration is taken from a field a method sets to a Date.now() reading',
        files: {
          'src/timing.ts':
            'export class Job {\n  private startedAt = 0;\n\n  begin(): void {\n    this.startedAt = Date.now();\n  }\n\n  elapsed(): number {\n    return Date.now() - this.startedAt;\n  }\n}\n',
        },
      },
      {
        condition: 'a duration is the reading of an exported start taken from Temporal.Now',
        files: {
          'src/timing.ts':
            'export const startedAt = Temporal.Now.instant();\n\nexport const elapsed = (): Temporal.Duration => startedAt.until(Temporal.Now.instant());\n',
        },
      },
      {
        condition: 'a case of a switch times its work by a Date.now() reading of its own',
        files: {
          'src/timing.ts':
            "export const time = (kind: string, work: () => void): number => {\n  switch (kind) {\n    case 'job': {\n      const start = Date.now();\n\n      work();\n\n      return Date.now() - start;\n    }\n    default:\n      return 0;\n  }\n};\n",
        },
      },
      {
        condition: 'a var holds the Date.now() reading',
        files: {
          'src/timing.ts':
            'export function time(work: () => void): number {\n  var start = Date.now();\n\n  work();\n\n  return Date.now() - start;\n}\n',
        },
      },
      {
        condition: 'a component times its render by Date.now() readings',
        files: {
          'src/timer.tsx':
            'export const Timer = (): number => {\n  const start = Date.now();\n\n  return Date.now() - start;\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the age of a stored wall-clock time is taken from the wall clock',
        files: {
          'src/timing.ts':
            'export const ageOf = (modifiedAt: number): number => Date.now() - modifiedAt;\n',
        },
      },
      {
        condition: 'the age of a stored instant is taken from Temporal.Now',
        files: {
          'src/timing.ts':
            'export const ageOf = (modifiedAt: Temporal.Instant): Temporal.Duration =>\n  Temporal.Now.instant().since(modifiedAt);\n',
        },
      },
      {
        condition: 'a duration is the difference of two performance.now() readings',
        files: {
          'src/timing.ts':
            'const startedAt = performance.now();\n\nexport const elapsed = (): number => performance.now() - startedAt;\n',
        },
      },
      {
        condition:
          'the age of a parameter is taken from the wall clock beside a function that names its own reading alike',
        files: {
          'src/timing.ts':
            'export const stamp = (): number => {\n  const start = Date.now();\n\n  return start;\n};\n\nexport const ageOf = (start: number): number => Date.now() - start;\n',
        },
      },
      {
        condition:
          "the age of a class's field is taken from the wall clock beside another class whose field alike holds a reading",
        files: {
          'src/timing.ts':
            'export class Clock {\n  readonly started = Date.now();\n}\n\nexport class Job {\n  constructor(private readonly started: number) {}\n\n  age(): number {\n    return Date.now() - this.started;\n  }\n}\n',
        },
      },
      {
        condition:
          "the age of a class's field is taken from the wall clock beside another field that holds a reading",
        files: {
          'src/timing.ts':
            'export class Job {\n  readonly created = Date.now();\n\n  constructor(private readonly modifiedAt: number) {}\n\n  age(): number {\n    return Date.now() - this.modifiedAt;\n  }\n}\n',
        },
      },
      {
        condition:
          'the age of a value is taken from the wall clock beside another name that holds a reading',
        files: {
          'src/timing.ts':
            'const startedAt = Date.now();\n\nexport const ageOf = (modifiedAt: number): number => Date.now() - modifiedAt + startedAt * 0;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'effects-held-only-by-the-edge',
    unit: {
      blocks: [],
    },
    reported: [
      {
        condition: 'an entity draws a random value and reads the clock',
        files: {
          'src/features/orders/domain/entities/order.entity.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: 'a use case makes a date of the current time',
        files: {
          'src/features/orders/application/use-cases/commands/place-order.use-case.ts':
            'export const placedAt = (): Date => new Date();\n',
        },
      },
      {
        condition: 'a use case reads the current time as text',
        files: {
          'src/features/orders/application/use-cases/commands/place-order.use-case.ts':
            'export const placedAt = (): string => Date();\n',
        },
      },
      {
        condition: 'a use case draws Math.random()',
        files: {
          'src/features/orders/application/use-cases/commands/draw-winner.use-case.ts':
            'export const draw = (): number => Math.random();\n',
        },
      },
      {
        condition: "a value object mints an identifier with node:crypto's randomUUID",
        files: {
          'src/features/orders/domain/order/value-objects/order-id.value-object.ts':
            "import { randomUUID } from 'node:crypto';\n\nexport const orderIdOf = (): string => randomUUID();\n",
        },
      },
      {
        condition: 'a service fills random bytes',
        files: {
          'src/features/orders/domain/order/services/token.service.ts':
            'export const tokenOf = (bytes: Uint8Array): Uint8Array => crypto.getRandomValues(bytes);\n',
        },
      },
      {
        condition: 'a service generates a key',
        files: {
          'src/features/orders/domain/order/services/key.service.ts':
            "export const keyOf = (): Promise<CryptoKey> =>\n  crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, true, ['sign']);\n",
        },
      },
      {
        condition: 'a use case reads Temporal.Now',
        files: {
          'src/features/orders/application/use-cases/commands/place-order.use-case.ts':
            'export const placedAt = (): Temporal.Instant => Temporal.Now.instant();\n',
        },
      },
      {
        condition: 'a component reads the clock',
        files: {
          'src/features/orders/presentation/components/order-age/order-age.tsx':
            'export const OrderAge = (): number => Date.now();\n',
        },
      },
      {
        condition: 'a binding unit reads the clock',
        files: {
          'src/features/orders/presentation/bindings/place-order.ts':
            'export const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: "a feature's file named like an entry file reads the clock",
        files: {
          'src/features/orders/main.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'an adapter draws a random value and reads the clock',
        files: {
          'src/infrastructure/ids/ids.adapter.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: "a feature's adapter reads the clock",
        files: {
          'src/features/orders/infrastructure/clock/clock.adapter.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: "a composition module's adapter reads the clock",
        files: {
          'src/composition/checkout/infrastructure/clock/clock.adapter.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: 'a lib reads the clock',
        files: {
          'src/libs/ids/ids.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: 'the composition root reads the clock',
        files: {
          'src/root/root.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: 'an entry file reads the clock',
        files: {
          'src/main.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: "an entrypoint's entry file reads the clock",
        files: {
          'src/entrypoints/worker/main.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: "an entrypoint's markup entry file reads the clock",
        files: {
          'src/entrypoints/app/main.tsx':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: 'an entry file of another name at the top of the source reads the clock',
        files: {
          'src/server.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: 'an integration reads the clock',
        files: {
          'src/integrations/vite/plugin.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: 'a spec reads the clock',
        files: {
          'src/features/orders/domain/entities/__tests__/order.entity.test.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
      {
        condition: 'a value object makes a date of a value it is handed',
        files: {
          'src/features/orders/domain/order/value-objects/placed-at.value-object.ts':
            'export const placedAtOf = (epochMilliseconds: number): Date => new Date(epochMilliseconds);\n',
        },
      },
      {
        condition: 'a script outside the source reads the clock',
        files: {
          'scripts/stamp.ts':
            'export const orderId = (): string => crypto.randomUUID();\nexport const placedAt = (): number => Date.now();\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'entity-value-or-event-typed-readonly',
    reported: [
      {
        condition: "an entity's field can be written in place",
        files: {
          'src/features/orders/domain/entities/order.entity.ts':
            'export interface Order {\n  id: string;\n}\n',
        },
      },
      {
        condition: "an event's type alias holds a field that is not readonly",
        files: {
          'src/features/orders/domain/order/events/order-placed.event.ts':
            'export type OrderPlaced = {\n  readonly orderId: string;\n  placedAt: Date;\n};\n',
        },
      },
      {
        condition: 'a value in the kernel holds an index signature that is not readonly',
        files: {
          'src/kernel/money/money.ts': 'export type Rates = {\n  [currency: string]: number;\n};\n',
        },
      },
      {
        condition: "a field's nested object type holds a field that is not readonly",
        files: {
          'src/features/orders/domain/order/entities/order.aggregate.ts':
            'export type Order = {\n  readonly shipment: {\n    trackingCode: string;\n  };\n};\n',
        },
      },
      {
        condition: 'a .tsx file of the domain holds a field that is not readonly',
        files: {
          'src/features/orders/domain/order/value-objects/badge.value-object.tsx':
            'export type Badge = {\n  label: string;\n};\n\nexport const badgeOf = (badge: Badge): React.ReactElement => <span>{badge.label}</span>;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'every field is readonly',
        files: {
          'src/features/orders/domain/order/events/order-placed.event.ts':
            'export type OrderPlaced = {\n  readonly orderId: string;\n  readonly lines: readonly string[];\n  readonly [key: string]: unknown;\n};\n',
        },
      },
      {
        condition: 'a type is wrapped in Readonly',
        files: {
          'src/features/orders/domain/order.ts':
            'export type Order = Readonly<{\n  id: string;\n}>;\n',
        },
      },
      {
        condition: "a parameter's inline object type holds a field that is not readonly",
        files: {
          'src/features/orders/domain/order.ts':
            'export const totalOf = (order: { lines: number[] }): number => order.lines.length;\n',
        },
      },
      {
        condition: "a method's parameter type in an interface holds a field that is not readonly",
        files: {
          'src/features/orders/domain/order.ts':
            'export interface OrderPolicy {\n  readonly allows: (input: { amount: number }) => boolean;\n  check(input: { amount: number }): boolean;\n}\n',
        },
      },
      {
        condition: 'a mapped type is declared',
        files: {
          'src/kernel/types/mutable.ts':
            'export type Snapshot<TValue> = {\n  readonly [TKey in keyof TValue]: TValue[TKey];\n};\n\nexport type Flags<TKey extends string> = { [TFlag in TKey]: boolean };\n',
        },
      },
      {
        condition: 'a type outside the domain and the kernel holds a field that is not readonly',
        files: {
          'src/features/orders/presentation/view.ts':
            'export type OrderView = {\n  id: string;\n};\n',
        },
      },
      {
        condition: 'a spec in the domain holds a field that is not readonly',
        files: {
          'src/features/orders/domain/__tests__/order.test.ts':
            'type Row = {\n  id: string;\n};\n\nexport const rows: readonly Row[] = [];\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'field-declares-its-autocomplete',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
        'html',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'an email field declares no autocomplete',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <input aria-label='Email' type='email' />\n  );\n}\n",
        },
      },
      {
        condition: 'a password field declares no autocomplete',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return (\n    <input aria-label="Password" type="password" />\n  );\n}\n',
        },
      },
      {
        condition: 'a telephone field written in braces declares no autocomplete',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <input aria-label='Phone' type={'tel'} />\n  );\n}\n",
        },
      },
      {
        condition: 'an email field with a closing tag declares no autocomplete',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <input aria-label='Email' type='email'></input>\n  );\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a field declares its autocomplete',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <input aria-label='Email' autoComplete='email' type='email' />\n  );\n}\n",
        },
      },
      {
        condition: 'a field takes free text',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <input aria-label='Search' type='search' />\n  );\n}\n",
        },
      },
      {
        condition: 'a field of another element names an email type',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <output aria-label='Email' type='email' />\n  );\n}\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'focus-shown-by-an-outline-utility',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a class list removes the outline',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <button className='outline-none' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list removes the outline under a variant',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <button className='rounded-md focus:outline-none focus-visible:shadow-focus' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class helper in a .ts file removes the outline',
        files: {
          'src/ui/classes.ts': "export const field = clsx('rounded-md', 'outline-none');\n",
        },
      },
      {
        condition: 'a twMerge call removes the outline',
        files: {
          'src/ui/classes.ts': "export const field = twMerge('focus-visible:outline-none');\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a class list draws focus with outline utilities',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <button className='rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list sets a ring beside outline-hidden',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <button className='outline-hidden focus-visible:ring-2 focus-visible:ring-focus' />\n  );\n}\n",
        },
      },
      {
        condition: 'a string outside a class list holds outline-none',
        files: {
          'src/ui/classes.ts': "export const hint = 'outline-none';\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'ids-from-use-id',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'an id is random',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return (\n    <input id={crypto.randomUUID()} />\n  );\n}\n',
        },
      },
      {
        condition: 'an id is built from Math.random',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return (\n    <input id={`field-${Math.random()}`} />\n  );\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'an id comes from useId',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "import { useId } from 'react';\n\nexport function Panel(): React.ReactElement {\n  const fieldId = useId();\n\n  return <input id={fieldId} />;\n}\n",
        },
      },
      {
        condition: 'a random value feeds an attribute that is no id',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return (\n    <div data-seed={Math.random()} />\n  );\n}\n',
        },
      },
      {
        condition: 'the root names an element it renders once by a constant',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return (\n    <main id="main-content" />\n  );\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'important-modifier-never-in-a-class-list',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a class list marks a utility important after it',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='px-0! text-sm' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list marks a utility important before it',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='!px-0 text-sm' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list marks an arbitrary utility important',
        files: {
          'src/ui/classes.ts': "export const panel = cn('w-[10px]!');\n",
        },
      },
      {
        condition: 'a class helper in a .ts file marks a utility important',
        files: {
          'src/ui/classes.ts': "export const panel = cn('flex', '!hidden');\n",
        },
      },
      {
        condition: 'a template chunk of a class helper marks a utility important',
        files: {
          'src/ui/classes.ts':
            'export const panel = (gap: string): string => cn(`${gap} !px-0`);\n',
        },
      },
      {
        condition: 'a className expression marks a utility important',
        files: {
          'src/ui/panel.tsx':
            "export const Panel = ({ isOpen }: { isOpen: boolean }) => <div className={isOpen ? 'px-0!' : 'px-2'} />;\n",
        },
      },
      {
        condition: 'a nested class helper marks a utility important',
        files: {
          'src/ui/classes.ts': "export const panel = cn('flex', clsx({ 'mt-0!': true }));\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a class list negates a condition',
        files: {
          'src/panel.tsx':
            "export const classes = (isOpen: boolean): string => cn('px-2', !isOpen && 'hidden');\n",
        },
      },
      {
        condition: 'a class list in a .ts file negates a condition',
        files: {
          'src/ui/classes.ts':
            "export const classes = (isOpen: boolean): string => cn('px-2', !isOpen && 'hidden');\n",
        },
      },
      {
        condition: 'a string outside a class list ends in an exclamation mark',
        files: {
          'src/ui/classes.ts': "export const greeting = 'Hello!';\n",
        },
      },
      {
        condition: 'an attribute other than className holds an exclamation mark',
        files: {
          'src/ui/panel.tsx':
            "export const Panel = () => <div title='Done!' className='px-2' />;\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'inline-style-holds-only-custom-properties',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'an inline style comes from a variable',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "const look = { color: 'red' };\n\nexport function Panel(): React.ReactElement {\n  return <div style={look} />;\n}\n",
        },
      },
      {
        condition: 'an inline style sets a visual property',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div style={{ '--progress': '50%', backgroundColor: '#16a34a' }} />\n  );\n}\n",
        },
      },
      {
        condition: 'an inline style spreads another object',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div style={{ ...base, '--progress': '50%' }} />\n  );\n}\n",
        },
      },
      {
        condition: 'an inline style holds a shorthand property',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div style={{ width, '--progress': '50%' }} />\n  );\n}\n",
        },
      },
      {
        condition: 'an inline style names a visual property by a quoted key',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return (\n    <div style={{ "color": \'red\' }} />\n  );\n}\n',
        },
      },
      {
        condition: 'an inline style is merged by a call',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div style={merge({ color: 'red' })} />\n  );\n}\n",
        },
      },
      {
        condition: 'an inline style is a string',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return (\n    <div style="color: red" />\n  );\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'an inline style sets only a custom property',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div style={{ '--progress': '50%' }} />\n  );\n}\n",
        },
      },
      {
        condition: 'a custom property is computed by a call that takes an object',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return (\n    <div style={{ "--width": format({ value: progress, unit: \'%\' }) }} />\n  );\n}\n',
        },
      },
      {
        condition: 'the inline style picks one of two objects of custom properties',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div style={isOpen ? { '--height': 'auto' } : { '--height': '0' }} />\n  );\n}\n",
        },
      },
      {
        condition: 'a positioning library computes the geometry under a suppression',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            'export function Panel(): React.ReactElement {\n  return (\n    <div\n      // ast-grep-ignore: inline-style-holds-only-custom-properties@typescript\n      style={floatingStyles}\n    />\n  );\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'ky-body-parsed-by-schema',
    unit: {
      axes: [],
      blocks: [
        'ky',
      ],
    },
    reported: [
      {
        condition: 'a response body is cast with .json<T>()',
        files: {
          'src/features/orders/order.ts':
            'interface Order {\n  id: string;\n}\n\nexport const read = (response: Response): Promise<Order> =>\n  response.json<Order>();\n',
        },
      },
      {
        condition: 'a request is typed by a type argument',
        files: {
          'src/features/orders/infrastructure/api/orders-api.adapter.ts':
            "import ky from 'ky';\n\ninterface Order {\n  id: string;\n}\n\nexport const find = async (): Promise<Order> => ky<Order>('orders/1').json();\n",
        },
      },
      {
        condition: "a request through ky's method is typed by a type argument",
        files: {
          'src/features/orders/infrastructure/api/orders-api.adapter.ts':
            "import ky from 'ky';\n\ninterface Order {\n  id: string;\n}\n\nexport const find = async (): Promise<Order> => ky.get<Order>('orders/1').json();\n",
        },
      },
      {
        condition: 'a body read by an instance is cast with .json<T>()',
        files: {
          'src/features/orders/infrastructure/api/orders-api.adapter.ts':
            "import type { KyInstance } from 'ky';\n\ninterface Order {\n  id: string;\n}\n\nexport const find = async (http: KyInstance): Promise<Order> =>\n  http.get('orders/1').json<Order>();\n",
        },
      },
      {
        condition: 'a component casts a response body with .json<T>()',
        files: {
          'src/features/orders/presentation/order.tsx':
            'interface Order {\n  id: string;\n}\n\nexport const load = (response: Response): Promise<Order> => response.json<Order>();\n\nexport const View = () => <p />;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a response body is parsed by a schema',
        files: {
          'src/features/orders/infrastructure/api/orders-api.adapter.ts':
            "import type { KyInstance } from 'ky';\nimport { z } from 'zod';\n\nconst orderSchema = z.strictObject({ id: z.string() });\n\nexport const find = async (http: KyInstance) => http.get('orders/1').json(orderSchema);\n",
        },
      },
      {
        condition: 'a response body is read as unknown and then parsed',
        files: {
          'src/features/orders/infrastructure/api/orders-api.adapter.ts':
            "import type { KyInstance } from 'ky';\nimport { z } from 'zod';\n\nconst orderSchema = z.strictObject({ id: z.string() });\n\nexport const find = async (http: KyInstance) => orderSchema.parse(await http.get('orders/1').json());\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'links-name-typed-targets',
    unit: {
      axes: [],
      blocks: [
        'tanstack-router',
      ],
    },
    reported: [
      {
        condition: 'a link target is concatenated',
        files: {
          'src/features/orders/presentation/widgets/order-link.ts':
            "export const target = (id: string): { to: string } => ({ to: '/orders/' + id });\n",
        },
      },
      {
        condition: 'a link target is a template with a substitution',
        files: {
          'src/features/orders/presentation/widgets/order-link.ts':
            'export const target = (id: string): { to: string } => ({ to: `/orders/${id}` });\n',
        },
      },
      {
        condition: 'a Link element is handed a template path',
        files: {
          'src/features/orders/presentation/widgets/order-link.tsx':
            "import { Link } from '@tanstack/react-router';\n\nexport const OrderLink = ({ id }: { id: string }): React.ReactElement => (\n  <Link to={`/orders/${id}`}>{id}</Link>\n);\n",
        },
      },
      {
        condition: 'a Link element is handed a concatenated path',
        files: {
          'src/features/orders/presentation/widgets/order-link.tsx':
            "import { Link } from '@tanstack/react-router';\n\nexport const OrderLink = ({ id }: { id: string }): React.ReactElement => (\n  <Link to={'/orders/' + id}>{id}</Link>\n);\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a link names its route by path and params',
        files: {
          'src/features/orders/presentation/widgets/order-link.ts':
            "export const target = { to: '/orders/$orderId' };\n",
        },
      },
      {
        condition: 'a Link element names its route by path and params',
        files: {
          'src/features/orders/presentation/widgets/order-link.tsx':
            'import { Link } from \'@tanstack/react-router\';\n\nexport const OrderLink = ({ id }: { id: string }): React.ReactElement => (\n  <Link params={{ orderId: id }} to="/orders/$orderId">{id}</Link>\n);\n',
        },
      },
      {
        condition: 'a range ends at a sum',
        files: {
          'src/features/pages/domain/page-range.ts':
            'export const range = (start: number): { from: number; to: number } => ({ from: start, to: start + 10 });\n',
        },
      },
      {
        condition: 'a template with no substitution names the path',
        files: {
          'src/features/orders/presentation/widgets/order-link.ts':
            'export const target = { to: `/orders` };\n',
        },
      },
      {
        condition: 'a path built from strings goes to another key',
        files: {
          'src/features/orders/presentation/widgets/order-link.ts':
            "export const target = (id: string): { href: string } => ({ href: '/orders/' + id });\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'locale-passed-to-every-intl-call',
    unit: {
      axes: [],
      blocks: [
        'localization',
      ],
    },
    reported: [
      {
        condition: 'a date is formatted without a locale',
        files: {
          'src/panel.tsx': 'export const label = (at: Date): string => at.toLocaleDateString();\n',
        },
      },
      {
        condition: 'a date is formatted without a locale in a .ts file',
        files: {
          'src/label.ts': 'export const label = (at: Date): string => at.toLocaleDateString();\n',
        },
      },
      {
        condition: 'a number is formatted with undefined for its locale',
        files: {
          'src/label.ts':
            "export const label = (count: number): string => count.toLocaleString(undefined, { style: 'decimal' });\n",
        },
      },
      {
        condition: 'a time is formatted with an empty list of locales',
        files: {
          'src/label.ts': 'export const label = (at: Date): string => at.toLocaleTimeString([]);\n',
        },
      },
      {
        condition: 'an Intl formatter is built with undefined for its locale',
        files: {
          'src/price.ts':
            "export const priceText = (amount: number): string =>\n  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(amount);\n",
        },
      },
      {
        condition: 'an Intl formatter is built with no arguments',
        files: {
          'src/list.ts':
            'export const listText = (names: readonly string[]): string => new Intl.ListFormat().format(names);\n',
        },
      },
      {
        condition: 'an Intl formatter is called without new and without a locale',
        files: {
          'src/date.ts':
            'export const dateText = (at: Date): string => Intl.DateTimeFormat().format(at);\n',
        },
      },
      {
        condition: 'an Intl formatter is given void 0 for its locale',
        files: {
          'src/date.ts':
            'export const dateText = (at: Date): string => Intl.DateTimeFormat(void 0).format(at);\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'formatting takes a locale',
        files: {
          'src/panel.tsx':
            "export const label = (at: Date): string => at.toLocaleDateString('uk');\n",
        },
      },
      {
        condition: 'an Intl formatter takes the active locale',
        files: {
          'src/price.ts':
            "export const priceText = (amount: number, locale: string): string =>\n  new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount);\n",
        },
      },
      {
        condition: "Intl's static function lists the canonical locales",
        files: {
          'src/locales.ts': 'export const locales = (): string[] => Intl.getCanonicalLocales();\n',
        },
      },
      {
        condition: 'a string is cased by its locale',
        files: {
          'src/label.ts':
            "export const label = (text: string): string => text.toLocaleUpperCase('uk');\n",
        },
      },
      {
        condition: 'a method of another name is called without arguments',
        files: {
          'src/label.ts': 'export const label = (at: Date): string => at.toISOString();\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'logical-utilities-for-direction',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
        'localization',
      ],
    },
    reported: [
      {
        condition: 'a class list sets a physical margin',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='ml-4' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list sets a negative physical margin',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='-mr-2 flex' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list sets a physical padding under a variant',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='md:pl-4' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list aligns text to a physical side',
        files: {
          'src/ui/classes.ts': "export const cell = cva('text-left', { variants: {} });\n",
        },
      },
      {
        condition: 'a class list sets a physical border',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='border-l border-border' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list rounds a physical corner',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='rounded-tl-md' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list positions on a physical side',
        files: {
          'src/ui/classes.ts': "export const badge = cn('absolute', 'right-0');\n",
        },
      },
      {
        condition: 'a class list floats to a physical side',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='float-left' />\n  );\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a class list uses logical sides',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='ms-4 text-start items-center' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list sets both inline sides at once',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='mx-4 px-2 inset-x-0' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list holds utilities that open with the letters of a physical side',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <div className='placeholder:text-muted prose mt-2 mb-4' />\n  );\n}\n",
        },
      },
      {
        condition: 'a string outside a class list holds a physical side',
        files: {
          'src/ui/classes.ts': "export const hint = 'ml-4';\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'modern-react-api-only',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a context is read with useContext',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "import { createContext, useContext } from 'react';\n\nconst ThemeContext = createContext('light');\n\nexport function Panel(): string {\n  return useContext(ThemeContext);\n}\n",
        },
      },
      {
        condition: 'a hook in a .ts file reads a context with React.useContext',
        files: {
          'src/hooks/use-theme.ts':
            "import React from 'react';\n\nexport const useTheme = (): string => React.useContext(ThemeContext);\n",
        },
      },
      {
        condition: 'a context is read with a typed useContext',
        files: {
          'src/hooks/use-theme.ts':
            "import { useContext } from 'react';\n\nexport const useTheme = (): string => useContext<string>(ThemeContext);\n",
        },
      },
      {
        condition: 'a context is rendered through its Provider',
        files: {
          'src/panel.tsx':
            'export const Panel = ({ children }: PanelProps): React.ReactElement => (\n  <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>\n);\n',
        },
      },
      {
        condition: "a context's Provider closes itself",
        files: {
          'src/panel.tsx':
            'export const Panel = (): React.ReactElement => <ThemeContext.Provider value="dark" />;\n',
        },
      },
      {
        condition: 'a component is given defaultProps',
        files: {
          'src/panel.tsx':
            "export const Panel = ({ label }: PanelProps): React.ReactElement => <p>{label}</p>;\n\nPanel.defaultProps = { label: 'Untitled' };\n",
        },
      },
      {
        condition: 'a ref is created with createRef',
        files: {
          'src/panel.tsx':
            "import { createRef } from 'react';\n\nconst box = createRef<HTMLDivElement>();\n\nexport const Panel = (): React.ReactElement => <div ref={box} />;\n",
        },
      },
      {
        condition: 'a ref is created with React.createRef in a .ts file',
        files: {
          'src/refs.ts':
            "import React from 'react';\n\nexport const boxOf = () => React.createRef();\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a component holds a ref object',
        files: {
          'src/panel.tsx':
            "import { useRef } from 'react';\n\nexport function Panel(): React.ReactElement {\n  const box = useRef<HTMLDivElement>(null);\n\n  return <div ref={box} />;\n}\n",
        },
      },
      {
        condition: 'a context is read with use',
        files: {
          'src/panel.tsx':
            "import { use } from 'react';\n\nexport const Panel = (): React.ReactElement => <p>{use(ThemeContext)}</p>;\n",
        },
      },
      {
        condition: 'a context is rendered as its own provider',
        files: {
          'src/panel.tsx':
            'export const Panel = ({ children }: PanelProps): React.ReactElement => (\n  <ThemeContext value="dark">{children}</ThemeContext>\n);\n',
        },
      },
      {
        condition: 'a prop takes its default in the parameter',
        files: {
          'src/panel.tsx':
            "export const Panel = ({ label = 'Untitled' }: PanelProps): React.ReactElement => <p>{label}</p>;\n",
        },
      },
      {
        condition: 'an object names a defaultProps key',
        files: {
          'src/settings.ts': "export const settings = { defaultProps: { size: 'small' } };\n",
        },
      },
      {
        condition: "an element's name ends in Provider without a member",
        files: {
          'src/panel.tsx':
            'export const Panel = ({ children }: PanelProps): React.ReactElement => <ThemeProvider>{children}</ThemeProvider>;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'module-level-text-holds-the-message',
    unit: {
      axes: [],
      blocks: [
        'localization',
        'lingui',
      ],
    },
    reported: [
      {
        condition: 'a message is translated at the top level of a module',
        files: {
          'src/features/chat/presentation/status.ts':
            "import { t } from '@lingui/core/macro';\n\nexport const online = t`Online`;\n",
        },
      },
      {
        condition: 'an option list translates its labels at the top level of a module',
        files: {
          'src/features/chat/presentation/status.ts':
            "import { t } from '@lingui/core/macro';\n\nexport const sortOptions = [\n  { value: 'newest', label: t`Newest first` },\n  { value: 'oldest', label: t`Oldest first` },\n];\n",
        },
      },
      {
        condition: 'a plural is taken at the top level of a module',
        files: {
          'src/features/chat/presentation/status.ts':
            "import { plural } from '@lingui/core/macro';\n\ndeclare const count: number;\n\nexport const unread = plural(count, { one: '# message', other: '# messages' });\n",
        },
      },
      {
        condition: 'a static field of a class is translated as the module loads',
        files: {
          'src/features/chat/presentation/status.ts':
            "import { t } from '@lingui/core/macro';\n\nexport class Status {\n  static readonly online = t`Online`;\n}\n",
        },
      },
      {
        condition: 'a component module translates a message at its top level',
        files: {
          'src/features/chat/presentation/status.tsx':
            "import { t } from '@lingui/core/macro';\n\nconst online = t`Online`;\n\nexport const Status = () => <p>{online}</p>;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a module declares its message and a component translates it',
        files: {
          'src/features/chat/presentation/status.ts':
            "import { msg, t } from '@lingui/core/macro';\n\nexport const online = msg`Online`;\nexport const label = (): string => t`Away`;\n",
        },
      },
      {
        condition: 'a method translates its message where it is called',
        files: {
          'src/features/chat/presentation/status.ts':
            "import { t } from '@lingui/core/macro';\n\nexport class Status {\n  label(): string {\n    return t`Online`;\n  }\n}\n",
        },
      },
      {
        condition: 'a field of each instance is translated as it is built',
        files: {
          'src/features/chat/presentation/status.ts':
            "import { t } from '@lingui/core/macro';\n\nexport class Status {\n  readonly label = t`Online`;\n}\n",
        },
      },
      {
        condition: 'a component translates its message as it renders',
        files: {
          'src/features/chat/presentation/status.tsx':
            "import { t } from '@lingui/core/macro';\n\nexport const Status = () => <p>{t`Online`}</p>;\n",
        },
      },
      {
        condition: 'a module that imports no macro calls its own t',
        files: {
          'src/features/chat/presentation/status.ts':
            "const t = (parts: TemplateStringsArray): string => parts.join('');\n\nexport const online = t`Online`;\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'module-level-variable-declared-const',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a module exports a binding it can reassign',
        files: {
          'src/session.ts': 'export let current = 0;\n',
        },
      },
      {
        condition: 'a markup module declares a var at its top',
        files: {
          'src/panel.tsx': 'var count = 0;\n\nexport const Panel = () => <p>{count}</p>;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a function declares a binding it reassigns',
        files: {
          'src/count.ts':
            'export const countOf = (items: readonly string[]): number => {\n  let count = 0;\n\n  for (const item of items) {\n    count += item.length;\n  }\n\n  return count;\n};\n',
        },
      },
      {
        condition: "a spec's setup reassigns a module-level binding",
        files: {
          'src/__tests__/session.test.ts':
            'let current = 0;\n\nexport const next = (): number => current + 1;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'name-cased-by-the-typescript-conventions',
    reported: [
      {
        condition: 'a module-level constant holding a literal is camelCase',
        files: {
          'src/features/orders/order.ts': 'export const maxItems = 5;\n',
        },
      },
      {
        condition: 'a module-level constant holding a regular expression is camelCase',
        files: {
          'src/features/orders/order-number.ts':
            'const orderNumberPattern = /^ORD-\\d{8}$/;\n\nexport const isOrderNumber = (text: string): boolean => orderNumberPattern.test(text);\n',
        },
      },
      {
        condition: 'a module-level constant computed from another is SCREAMING_SNAKE_CASE',
        files: {
          'src/features/orders/attempts.ts':
            'const MAX_ATTEMPTS = 5;\n\nexport const LAST_ATTEMPT = MAX_ATTEMPTS - 1;\n',
        },
      },
      {
        condition: 'a module-level constant computed at run time is PascalCase and no component',
        files: {
          'src/features/orders/registry.ts':
            'const Registry = new Map<string, string>();\n\nexport const lookUp = (key: string): string | undefined => Registry.get(key);\n',
        },
      },
      {
        condition: 'a module-level constant holding an object declared as const is camelCase',
        files: {
          'src/features/orders/labels.ts':
            "export const statusLabels = { open: 'Open', closed: 'Closed' } as const;\n",
        },
      },
      {
        condition:
          'a module-level constant holding an object declared as const that satisfies a type is camelCase',
        files: {
          'src/features/orders/routes.ts':
            "export const routes = { home: '/' } as const satisfies Record<string, string>;\n",
        },
      },
      {
        condition: 'a module-level constant holding a template without expressions is camelCase',
        files: {
          'src/features/orders/prefix.ts': 'export const keyPrefix = `orders`;\n',
        },
      },
      {
        condition: 'a module-level constant holding a negative number is camelCase',
        files: {
          'src/features/orders/delta.ts': 'export const minDelta = -1;\n',
        },
      },
      {
        condition: 'a module-level constant holding a literal is camelCase in a .tsx file',
        files: {
          'src/ui/panel.tsx':
            'const maxItems = 5;\n\nexport const Panel = (): React.ReactElement => <p>{maxItems}</p>;\n',
        },
      },
      {
        condition:
          'a module-level constant holding a literal is PascalCase beside a type of another name',
        files: {
          'src/features/orders/limit.ts':
            'export type Limit = number;\n\nexport const MaxLimit = 5;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a module-level constant holding a literal is SCREAMING_SNAKE_CASE',
        files: {
          'src/features/orders/order.ts':
            "export const MAX_ITEMS = 5;\n\nexport const ORDER_NUMBER_PATTERN = /^ORD-\\d{8}$/;\n\nexport const STATUS_LABELS = { open: 'Open' } as const;\n",
        },
      },
      {
        condition: 'a module-level constant computed from another is camelCase',
        files: {
          'src/features/orders/attempts.ts':
            'const MAX_ATTEMPTS = 5;\n\nexport const lastAttempt = MAX_ATTEMPTS - 1;\n',
        },
      },
      {
        condition: 'a component is PascalCase',
        files: {
          'src/ui/panel.tsx':
            'export const Panel = (): React.ReactElement => <section />;\n\nconst Card = function Card(): React.ReactElement {\n  return <article />;\n};\n\nexport const Shown = Card;\n',
        },
      },
      {
        condition: 'a component wrapped in memo is PascalCase',
        files: {
          'src/ui/panel.tsx':
            "import { memo } from 'react';\n\nconst PanelView = (): React.ReactElement => <section />;\n\nconst Panel = memo(PanelView);\n\nexport default Panel;\n",
        },
      },
      {
        condition: 'an exported constant computed at run time is PascalCase for its framework',
        files: {
          'src/routes/index.ts': "export const Route = createFileRoute('/')({});\n",
        },
      },
      {
        condition: 'a constant computed at run time is PascalCase and exported by a clause',
        files: {
          'src/routes/index.ts': "const Route = createFileRoute('/')({});\n\nexport { Route };\n",
        },
      },
      {
        condition: 'an object declared as const is the companion of a type of its name',
        files: {
          'src/features/orders/order-status.ts':
            "export const OrderStatus = { Open: 'open', Closed: 'closed' } as const;\n\nexport type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];\n",
        },
      },
      {
        condition: "a computed companion of a type takes the type's name",
        files: {
          'src/features/orders/order.ts':
            'interface Order {\n  readonly total: number;\n}\n\nconst Order = {\n  isEmpty: (order: Order): boolean => order.total === 0,\n};\n\nexport const isEmptyOrder = Order.isEmpty;\n',
        },
      },
      {
        condition: 'a constant inside a function holds a literal in camelCase',
        files: {
          'src/features/orders/order.ts':
            'export const limitOf = (): number => {\n  const maxItems = 5;\n\n  return maxItems;\n};\n',
        },
      },
      {
        condition: 'a template with an expression is camelCase',
        files: {
          'src/features/orders/greeting.ts':
            "const NAME = 'Ada';\n\nexport const greeting = `Hello, ${NAME}`;\n",
        },
      },
      {
        condition: 'a module-level variable declared with let holds a literal in camelCase',
        files: {
          'src/features/orders/counter.ts':
            'let counter = 0;\n\nexport const next = (): number => {\n  counter += 1;\n\n  return counter;\n};\n',
        },
      },
      {
        condition: 'a destructured module-level constant is camelCase',
        files: {
          'src/features/orders/settings.ts':
            'const SETTINGS = { limit: 5 } as const;\n\nexport const { limit } = SETTINGS;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'null-written-only-where-react-uses-it',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
      ],
    },
    reported: [
      {
        condition: 'a conditional returns null beside a value that is no markup',
        files: {
          'src/panel.tsx':
            'export const countOf = (isShown: boolean): number | undefined => (isShown ? 1 : null) ?? undefined;\n',
        },
      },
      {
        condition: "a type spells a field's absence as null",
        files: {
          'src/checkout.tsx':
            'type CheckoutState = {\n  coupon: Coupon | null;\n  selectedAddressId: AddressId | null;\n};\n\nexport const Checkout = (state: CheckoutState): React.ReactElement => <p>{state.coupon?.code}</p>;\n',
        },
      },
      {
        condition: 'a variable starts as null',
        files: {
          'src/panel.tsx':
            'let selected = null;\n\nexport const Panel = (): React.ReactElement => <p>{selected}</p>;\n',
        },
      },
      {
        condition: 'a value is compared loosely with null',
        files: {
          'src/panel.tsx':
            "export const Panel = ({ label }: PanelProps): React.ReactElement => <p>{label == null ? 'none' : label}</p>;\n",
        },
      },
      {
        condition: 'a function that renders nothing returns a value typed with null',
        files: {
          'src/panel.tsx':
            'export function findOrder(orders: Order[]): Order | null {\n  return orders[0] ?? null;\n}\n',
        },
      },
      {
        condition: 'a state holds null',
        files: {
          'src/panel.tsx':
            "import { useState } from 'react';\n\nexport const Panel = (): React.ReactElement => {\n  const [order] = useState<Order | undefined>(null);\n\n  return <p>{order?.id}</p>;\n};\n",
        },
      },
      {
        condition: 'a rendered branch passes null as a prop',
        files: {
          'src/panel.tsx':
            'export const Panel = ({ isOpen }: PanelProps): React.ReactElement | null => (isOpen ? <div title={null} /> : null);\n',
        },
      },
      {
        condition: "an argument other than JSON.stringify's replacer is null",
        files: {
          'src/panel.tsx':
            'export const text = (value: unknown): string => JSON.stringify(null, undefined, 2);\n',
        },
      },
      {
        condition: "an async component's return type wraps ReactElement or null in a Promise",
        files: {
          'src/panel.tsx':
            'export const Panel = async (): Promise<React.ReactElement | null> => <div />;\n',
        },
      },
      {
        condition: 'an arrow that renders nothing has a null body',
        files: {
          'src/panel.tsx': 'export const firstOrder = (): Order | undefined => null;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a component renders the null branch of a conditional',
        files: {
          'src/panel.tsx':
            'interface PanelProps {\n  readonly isOpen: boolean;\n}\n\nexport function Panel({ isOpen }: PanelProps): React.ReactElement | null {\n  return isOpen ? <div /> : null;\n}\n',
        },
      },
      {
        condition: 'a component returns null',
        files: {
          'src/panel.tsx':
            "import type { ReactElement } from 'react';\n\nexport function Panel({ isOpen }: PanelProps): ReactElement | null {\n  if (!isOpen) {\n    return null;\n  }\n\n  return <div />;\n}\n",
        },
      },
      {
        condition: "an arrow component's body is null",
        files: {
          'src/panel.tsx': 'export const Empty = (): React.ReactElement | null => null;\n',
        },
      },
      {
        condition: 'a branch renders null before parenthesised markup',
        files: {
          'src/panel.tsx':
            'export const Panel = ({ isOpen }: PanelProps): React.ReactElement | null => (isOpen ? null : (\n  <div />\n));\n',
        },
      },
      {
        condition: 'a branch inside markup renders null beside a fragment',
        files: {
          'src/panel.tsx':
            'export const Panel = ({ isOpen }: PanelProps): React.ReactElement => <main>{isOpen ? <></> : null}</main>;\n',
        },
      },
      {
        condition: 'a value is compared strictly with null',
        files: {
          'src/panel.tsx':
            'export const isMissing = (value: unknown): boolean => value === null || null !== value;\n',
        },
      },
      {
        condition: 'a component holds a ref object',
        files: {
          'src/panel.tsx':
            "import { useRef } from 'react';\n\nexport function Panel(): React.ReactElement {\n  const box = useRef<HTMLDivElement>(null);\n  const list = React.useRef<HTMLUListElement | null>(null);\n\n  return <div ref={box}><ul ref={list} /></div>;\n}\n",
        },
      },
      {
        condition: 'a prop is typed as a ref object',
        files: {
          'src/panel.tsx':
            "import type { RefObject } from 'react';\n\nexport type PanelProps = {\n  readonly box: RefObject<HTMLDivElement | null>;\n  readonly list: React.RefObject<HTMLUListElement | null>;\n};\n",
        },
      },
      {
        condition: 'an object is created with no prototype',
        files: {
          'src/panel.tsx': 'export const table = Object.create(null);\n',
        },
      },
      {
        condition: 'a value is written as JSON with no replacer',
        files: {
          'src/panel.tsx':
            'export const text = (value: unknown): string => JSON.stringify(value, null, 2);\n',
        },
      },
      {
        condition: "an object's render callback renders nothing",
        files: {
          'src/panel.tsx': 'export const columns = { empty: () => null };\n',
        },
      },
      {
        condition: "a prop's render callback renders nothing",
        files: {
          'src/panel.tsx':
            'export const Panel = (): React.ReactElement => <List renderEmpty={() => null} />;\n',
        },
      },
      {
        condition: 'a .ts file writes null',
        files: {
          'src/order.ts': 'export const none = null;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'outside-value-unknown-until-parsed',
    reported: [
      {
        condition: 'parsed JSON is cast to a type',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (text: string): Order => JSON.parse(text) as Order;\n',
        },
      },
      {
        condition: 'parsed JSON is cast to a type through unknown',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (text: string): Order => JSON.parse(text) as unknown as Order;\n',
        },
      },
      {
        condition: 'parsed JSON is given a type by its declaration',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (text: string): Order => {\n  const order: Order = JSON.parse(text);\n\n  return order;\n};\n',
        },
      },
      {
        condition: "a response's body is cast to a type",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = async (response: Response): Promise<Order> =>\n  (await response.json()) as Order;\n',
        },
      },
      {
        condition: "a response's body is cast as a promise of a type",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (response: Response): Promise<Order> =>\n  response.json() as Promise<Order>;\n',
        },
      },
      {
        condition: "a client's body is read with a type argument",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\ninterface Client {\n  readonly json: <TBody>() => Promise<TBody>;\n}\n\nexport const orderOf = (client: Client): Promise<Order> => client.json<Order>();\n',
        },
      },
      {
        condition: 'parsed JSON is said to satisfy a type',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (text: string): Order => JSON.parse(text) satisfies Order;\n',
        },
      },
      {
        condition: "a response's awaited body is given a type by its declaration",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = async (response: Response): Promise<Order> => {\n  const order: Order = await response.json();\n\n  return order;\n};\n',
        },
      },
      {
        condition: "a response's body is cast without parentheses around its await",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = async (response: Response): Promise<Order> => await response.json() as Order;\n',
        },
      },
      {
        condition: "a response's awaited body is said to satisfy a type",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = async (response: Response): Promise<Order> =>\n  (await response.json()) satisfies Order;\n',
        },
      },
      {
        condition: "a response's body is cast through unknown",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = async (response: Response): Promise<Order> =>\n  (await response.json()) as unknown as Order;\n',
        },
      },
      {
        condition: 'parsed JSON is cast to a type in a markup file',
        files: {
          'src/order-panel.tsx':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (text: string): Order => JSON.parse(text) as Order;\n',
        },
      },
      {
        condition: "a response's body promise is given a type by its declaration",
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (response: Response): Promise<Order> => {\n  const order: Promise<Order> = response.json();\n\n  return order;\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'parsed JSON is typed unknown',
        files: {
          'src/order.ts':
            'export const parsedOf = (text: string): unknown => {\n  const parsed: unknown = JSON.parse(text);\n\n  return parsed;\n};\n',
        },
      },
      {
        condition: "a client's body is read as unknown",
        files: {
          'src/order.ts':
            'interface Client {\n  readonly json: <TBody>() => Promise<TBody>;\n}\n\nexport const bodyOf = (client: Client): Promise<unknown> => client.json<unknown>();\n',
        },
      },
      {
        condition: "a response's body is cast to unknown",
        files: {
          'src/order.ts':
            'export const bodyOf = async (response: Response): Promise<unknown> => (await response.json()) as unknown;\n',
        },
      },
      {
        condition: "a response's body is cast as a promise of unknown",
        files: {
          'src/order.ts':
            'export const bodyOf = (response: Response): Promise<unknown> => response.json() as Promise<unknown>;\n',
        },
      },
      {
        condition: "a response's body is declared unknown",
        files: {
          'src/order.ts':
            'export const bodyOf = async (response: Response): Promise<unknown> => {\n  const body: unknown = await response.json();\n\n  return body;\n};\n',
        },
      },
      {
        condition: 'a parsed value is narrowed by a schema',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\ndeclare const orderSchema: { parse: (value: unknown) => Order };\n\nexport const orderOf = (text: string): Order => orderSchema.parse(JSON.parse(text));\n',
        },
      },
      {
        condition: 'a value of known type is cast',
        files: {
          'src/order.ts':
            'interface Order {\n  readonly id: string;\n}\n\nexport const orderOf = (value: Order | undefined): Order => value as Order;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'parameter-object-has-a-named-type',
    reported: [
      {
        condition: 'an exported function takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = (input: { count: number; price: number }): number =>\n  input.count * input.price;\n',
        },
      },
      {
        condition: 'an exported function declaration takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export function totalOf(input: { count: number; price: number }): number {\n  return input.count * input.price;\n}\n',
        },
      },
      {
        condition: 'an exported function takes a destructured object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = ({ count, price }: { count: number; price: number }): number => count * price;\n',
        },
      },
      {
        condition: 'an exported function takes an optional object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = (count: number, options?: { readonly price: number }): number =>\n  count * (options?.price ?? 1);\n',
        },
      },
      {
        condition:
          'an exported function takes an object typed by an intersection with an inline object',
        files: {
          'src/features/orders/order.ts':
            'type Query = { readonly id: string };\n\nexport const totalOf = (input: Query & { readonly price: number }): number => input.price;\n',
        },
      },
      {
        condition:
          'an exported function takes an object typed by an intersection that opens with an inline object',
        files: {
          'src/features/orders/order.ts':
            'type Query = { readonly id: string };\n\ntype Paged = { readonly page: number };\n\nexport const totalOf = (input: { readonly price: number } & Query & Paged): number => input.price;\n',
        },
      },
      {
        condition: 'an exported function expression takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = function (input: { count: number }): number {\n  return input.count;\n};\n',
        },
      },
      {
        condition: "an exported interface's method takes an object typed inline",
        files: {
          'src/features/orders/order.ts':
            'export interface InvoiceRepositoryPort {\n  find(query: { readonly invoiceId: string }): Promise<string | undefined>;\n}\n',
        },
      },
      {
        condition: "an exported interface's function property takes an object typed inline",
        files: {
          'src/features/orders/order.ts':
            'export interface InvoiceRepositoryPort {\n  readonly find: (query: { readonly invoiceId: string }) => Promise<string | undefined>;\n}\n',
        },
      },
      {
        condition: "an exported type's method takes an object typed inline",
        files: {
          'src/features/orders/order.ts':
            'export type InvoiceRepositoryPort = {\n  find(query: { readonly invoiceId: string }): Promise<string | undefined>;\n};\n',
        },
      },
      {
        condition: 'an exported function type takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export type Find = (query: { readonly invoiceId: string }) => Promise<string | undefined>;\n',
        },
      },
      {
        condition: 'an exported declared function takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export declare function totalOf(input: { count: number }): number;\n',
        },
      },
      {
        condition: 'an exported overload takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export function totalOf(input: { count: number }): number;\nexport function totalOf(input: { count: number }): number {\n  return input.count;\n}\n',
        },
      },
      {
        condition: 'a function an export list names takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'const totalOf = (input: { count: number }): number => input.count;\n\nexport { totalOf };\n',
        },
      },
      {
        condition: 'a function an export list renames takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'function totalOf(input: { count: number }): number {\n  return input.count;\n}\n\nexport { totalOf as orderTotal };\n',
        },
      },
      {
        condition:
          'an interface an export list names has a method that takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'interface InvoiceRepositoryPort {\n  find(query: { readonly invoiceId: string }): Promise<string | undefined>;\n}\n\nexport type { InvoiceRepositoryPort };\n',
        },
      },
      {
        condition: 'a default-exported function takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export default function totalOf(input: { count: number }): number {\n  return input.count;\n}\n',
        },
      },
      {
        condition: "an exported class's method takes an object typed inline",
        files: {
          'src/features/orders/order.ts':
            'export class Orders {\n  totalOf(input: { count: number }): number {\n    return input.count;\n  }\n}\n',
        },
      },
      {
        condition: "an exported class's protected method takes an object typed inline",
        files: {
          'src/features/orders/order.ts':
            'export abstract class Orders {\n  protected abstract totalOf(input: { count: number }): number;\n}\n',
        },
      },
      {
        condition: "an exported class's constructor takes an object typed inline",
        files: {
          'src/features/orders/order.ts':
            'export class Orders {\n  constructor(private readonly input: { count: number }) {}\n}\n',
        },
      },
      {
        condition: 'an exported component takes props typed inline',
        files: {
          'src/features/orders/presentation/components/order-badge/order-badge.tsx':
            'export const OrderBadge = ({ count }: { count: number }): number => count;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a function inside its module takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'const totalOf = (input: { count: number; price: number }): number =>\n  input.count * input.price;\n\nexport const priceOf = (count: number): number => totalOf({ count, price: 3 });\n',
        },
      },
      {
        condition: 'an exported function takes an object of a named type',
        files: {
          'src/features/orders/order.ts':
            'type Query = { readonly id: string };\n\nexport const find = (query: Query): string => query.id;\n',
        },
      },
      {
        condition: 'an exported function takes a function whose parameter is typed inline',
        files: {
          'src/features/orders/order.ts':
            "export const each = (visit: (entry: { readonly id: string }) => void): void => {\n  visit({ id: 'a' });\n};\n",
        },
      },
      {
        condition: 'an exported function returns an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export const orderOf = (id: string): { readonly id: string } => ({ id });\n',
        },
      },
      {
        condition: 'an exported function returns a function that takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export const createFind =\n  (prefix: string) =>\n  (query: { readonly id: string }): string =>\n    prefix + query.id;\n',
        },
      },
      {
        condition: 'an exported value is an object whose method takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export const orders = {\n  find: (query: { readonly id: string }): string => query.id,\n};\n',
        },
      },
      {
        condition: 'a function inside an exported function takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = (count: number): number => {\n  const priceOf = (input: { count: number }): number => input.count;\n\n  return priceOf({ count });\n};\n',
        },
      },
      {
        condition: "an exported class's private method takes an object typed inline",
        files: {
          'src/features/orders/order.ts':
            'export class Orders {\n  totalOf(count: number): number {\n    return this.priceOf({ count });\n  }\n\n  private priceOf(input: { count: number }): number {\n    return input.count;\n  }\n}\n',
        },
      },
      {
        condition: 'a function re-exported from another module shares its name with a local one',
        files: {
          'src/features/orders/order.ts':
            "const totalOf = (input: { count: number }): number => input.count;\n\nexport const priceOf = (count: number): number => totalOf({ count });\nexport { totalOf as orderTotal } from './totals';\n",
        },
      },
      {
        condition: 'an interface inside its module has a method that takes an object typed inline',
        files: {
          'src/features/orders/order.ts':
            'interface Finder {\n  find(query: { readonly id: string }): string;\n}\n\nexport const finderOf = (finder: Finder): Finder => finder;\n',
        },
      },
      {
        condition: 'an exported function takes a list of objects typed inline',
        files: {
          'src/features/orders/order.ts':
            'export const totalOf = (lines: readonly { count: number }[]): number => lines.length;\n',
        },
      },
      {
        condition: "an exported class's private field method takes an object typed inline",
        files: {
          'src/features/orders/order.ts':
            'export class Orders {\n  totalOf(count: number): number {\n    return this.#priceOf({ count });\n  }\n\n  #priceOf(input: { count: number }): number {\n    return input.count;\n  }\n}\n',
        },
      },
      {
        condition: 'an exported type holds an object typed inline that is no parameter',
        files: {
          'src/features/orders/order.ts':
            'export type Order = {\n  readonly lines: { readonly count: number };\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'query-client-built-by-the-root',
    unit: {
      blocks: [
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'a module builds the query client at its top level',
        files: {
          'src/shared/query/client.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const client = new QueryClient();\n",
        },
      },
      {
        condition: 'a provider component builds the query client in a .tsx file',
        files: {
          'src/presentation/providers.tsx':
            "import { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nexport const Providers = ({ children }: { readonly children: React.ReactNode }): React.ReactElement => (\n  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>\n);\n",
        },
      },
      {
        condition: 'a function outside the root builds a client with its options',
        files: {
          'src/features/orders/presentation/bindings/shared/client.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const createClient = (): QueryClient => new QueryClient({ defaultOptions: {} });\n",
        },
      },
      {
        condition: 'fixtures outside a folder of specs build the client',
        files: {
          'src/features/orders/order.fixtures.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const client = new QueryClient();\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the cache utilities declare a read and the root builds the client',
        files: {
          'src/features/orders/presentation/bindings/shared/cache.ts':
            "export const listOptions = { queryKey: ['orders'], queryFn: (): number => 1 };\n",
          'src/root/query-client.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const client = new QueryClient();\n",
        },
      },
      {
        condition: 'the root builds the client in a .tsx file',
        files: {
          'src/root/app.tsx':
            "import { QueryClient } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();\n\nexport const App = (): React.ReactElement => <main data-client={String(queryClient)} />;\n",
        },
      },
      {
        condition: "the program's entry file builds the client",
        files: {
          'src/main.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nconst client = new QueryClient();\n\nclient.clear();\n",
        },
      },
      {
        condition: "the program's entry file in .tsx builds the client",
        files: {
          'src/main.tsx':
            "import { QueryClient } from '@tanstack/react-query';\n\nconst client = new QueryClient();\n\nclient.clear();\n",
        },
      },
      {
        condition: "an entrypoint's entry file builds the client",
        files: {
          'src/entrypoints/worker/main.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nconst client = new QueryClient();\n\nclient.clear();\n",
        },
      },
      {
        condition: 'a spec builds the client',
        files: {
          'src/features/orders/__tests__/orders.test.tsx':
            "import { QueryClient } from '@tanstack/react-query';\n\nconst client = new QueryClient();\n\nclient.clear();\n",
        },
      },
      {
        condition: 'a spec kept apart from the source builds the client',
        files: {
          'tests/e2e/orders.e2e.test.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nconst client = new QueryClient();\n\nclient.clear();\n",
        },
      },
      {
        condition: 'a module only names the QueryClient type',
        files: {
          'src/presentation/providers.ts':
            "import type { QueryClient } from '@tanstack/react-query';\n\nexport const clear = (client: QueryClient): void => {\n  client.clear();\n};\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'raw-html-never-reaches-the-dom',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
      ],
    },
    reported: [
      {
        condition: 'markup is assigned to innerHTML',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const show = (panel: Element, markup: string): void => {\n  panel.innerHTML = markup;\n};\n',
        },
      },
      {
        condition: 'markup is appended to outerHTML',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const show = (panel: Element, markup: string): void => {\n  panel.outerHTML += markup;\n};\n',
        },
      },
      {
        condition: 'markup is assigned to innerHTML by a computed key',
        files: {
          'src/features/orders/presentation/show.ts':
            "export const show = (panel: Element, markup: string): void => {\n  panel['innerHTML'] = markup;\n};\n",
        },
      },
      {
        condition: 'markup is assigned to srcdoc',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const show = (frame: HTMLIFrameElement, markup: string): void => {\n  frame.srcdoc = markup;\n};\n',
        },
      },
      {
        condition: 'srcdoc is set as an attribute',
        files: {
          'src/features/orders/presentation/show.ts':
            "export const show = (frame: HTMLIFrameElement, markup: string): void => {\n  frame.setAttribute('srcdoc', markup);\n};\n",
        },
      },
      {
        condition: 'markup is inserted beside an element',
        files: {
          'src/features/orders/presentation/show.ts':
            "export const show = (panel: Element, markup: string): void => {\n  panel.insertAdjacentHTML('beforeend', markup);\n};\n",
        },
      },
      {
        condition: 'markup is set unsafely',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const show = (panel: Element, markup: string): void => {\n  panel.setHTMLUnsafe(markup);\n};\n',
        },
      },
      {
        condition: 'a document is parsed unsafely from markup',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const parsed = (markup: string): Document => Document.parseHTMLUnsafe(markup);\n',
        },
      },
      {
        condition: 'markup is parsed by DOMParser',
        files: {
          'src/features/orders/presentation/show.ts':
            "export const parsed = (markup: string): Document => new DOMParser().parseFromString(markup, 'text/html');\n",
        },
      },
      {
        condition: 'markup is parsed into a contextual fragment',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const fragment = (markup: string): DocumentFragment =>\n  document.createRange().createContextualFragment(markup);\n',
        },
      },
      {
        condition: 'markup is written to the document',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const show = (markup: string): void => {\n  document.write(markup);\n};\n',
        },
      },
      {
        condition: 'markup is written to the document as a line',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const show = (markup: string): void => {\n  window.document.writeln(markup);\n};\n',
        },
      },
      {
        condition: 'markup reaches an iframe through its srcDoc prop',
        files: {
          'src/features/orders/presentation/preview.tsx':
            'export const Preview = ({ markup }: { markup: string }): React.ReactElement => (\n  <iframe srcDoc={markup} title="Preview" />\n);\n',
        },
      },
      {
        condition: 'markup is assigned to innerHTML in a markup file',
        files: {
          'src/features/orders/presentation/show.tsx':
            'export const show = (panel: Element, markup: string): void => {\n  panel.innerHTML = markup;\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'text is set through the element interfaces',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const show = (panel: Element, label: string): void => {\n  panel.textContent = label;\n};\n',
        },
      },
      {
        condition: 'innerHTML is read',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const markupOf = (panel: Element): string => panel.innerHTML;\n',
        },
      },
      {
        condition: 'markup is set through the sanitising element API',
        files: {
          'src/features/orders/presentation/show.ts':
            'export const show = (panel: Element, markup: string): void => {\n  panel.setHTML(markup);\n};\n',
        },
      },
      {
        condition: 'another attribute is set',
        files: {
          'src/features/orders/presentation/show.ts':
            "export const show = (frame: HTMLIFrameElement, address: string): void => {\n  frame.setAttribute('src', address);\n};\n",
        },
      },
      {
        condition: 'an iframe is given an address',
        files: {
          'src/features/orders/presentation/preview.tsx':
            'export const Preview = ({ address }: { address: string }): React.ReactElement => (\n  <iframe src={address} title="Preview" />\n);\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'react-compiler-on',
    reported: [
      {
        condition: 'a component memoises a value by hand',
        files: {
          'src/Panel.tsx':
            "import { useMemo } from 'react';\n\nexport function Panel({ label }: { label: string }): string {\n  return useMemo(() => label.trim(), [label]);\n}\n",
        },
      },
      {
        condition: 'a hook in a .ts file memoises a callback by hand',
        files: {
          'src/hooks/use-save.ts':
            "import { useCallback } from 'react';\n\nexport const useSave = (save: () => void): (() => void) => useCallback(() => save(), [save]);\n",
        },
      },
      {
        condition: 'a component is wrapped in memo',
        files: {
          'src/panel.tsx':
            "import { memo } from 'react';\n\nexport const Panel = memo((): React.ReactElement => <p />);\n",
        },
      },
      {
        condition: 'a component is wrapped in React.memo',
        files: {
          'src/panel.tsx':
            "import React from 'react';\n\nexport const Panel = React.memo((): React.ReactElement => <p />);\n",
        },
      },
      {
        condition: 'a component marked use no memo with no comment memoises by hand',
        files: {
          'src/panel.tsx':
            "import { useMemo } from 'react';\n\nexport function Panel({ label }: { label: string }): string {\n  'use no memo';\n\n  return useMemo(() => label.trim(), [label]);\n}\n",
        },
      },
      {
        condition: 'a component memoises by hand beside another marked use no memo',
        files: {
          'src/panel.tsx':
            "import { useMemo } from 'react';\n\nexport function Legacy({ label }: { label: string }): string {\n  // Why: the Compiler cannot compile this component's mutation of its props\n  'use no memo';\n\n  return label;\n}\n\nexport function Panel({ label }: { label: string }): string {\n  return useMemo(() => label.trim(), [label]);\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a component leaves memoisation to the Compiler',
        files: {
          'src/panel.tsx':
            'export function Panel({ label }: { label: string }): string {\n  return label.trim();\n}\n',
        },
      },
      {
        condition:
          'a component the Compiler cannot compile is marked use no memo with a comment and memoises by hand',
        files: {
          'src/panel.tsx':
            "import { useMemo } from 'react';\n\nexport function Panel({ label }: { label: string }): string {\n  // Why: the Compiler cannot compile this component's mutation of its props\n  'use no memo';\n\n  return useMemo(() => label.trim(), [label]);\n}\n",
        },
      },
      {
        condition: 'a hook marked use no memo with a comment on its line memoises by hand',
        files: {
          'src/hooks/use-save.ts':
            "import { useCallback } from 'react';\n\nexport const useSave = (save: () => void): (() => void) => {\n  'use no memo'; // Why: a library compares this callback by identity and the Compiler skips it\n\n  return useCallback(() => save(), [save]);\n};\n",
        },
      },
      {
        condition: 'a module marked use no memo with a comment memoises by hand',
        files: {
          'src/panel.tsx':
            "// Why: the Compiler cannot compile this module's components\n'use no memo';\n\nimport { useMemo } from 'react';\n\nexport function Panel({ label }: { label: string }): string {\n  return useMemo(() => label.trim(), [label]);\n}\n",
        },
      },
      {
        condition: "another object's memo method is called",
        files: {
          'src/cache.ts': 'export const cached = cache.memo(() => 1);\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'read-declared-once-as-query-options',
    unit: {
      blocks: [
        'tanstack-query',
      ],
    },
    reported: [
      {
        condition: 'a hook writes its read inline',
        files: {
          'src/features/orders/presentation/bindings/queries/list/list.hooks.ts':
            "export const options = { queryKey: ['orders'], queryFn: (): number => 1 };\n",
        },
      },
      {
        condition: 'a component passes useQuery an inline queryFn',
        files: {
          'src/features/orders/presentation/widgets/order-list-widget/order-list-widget.tsx':
            "import { useQuery } from '@tanstack/react-query';\n\nexport const OrderListWidget = (): React.ReactElement => {\n  const orders = useQuery({ queryKey: orderKeys.all, queryFn: () => listOrders() });\n\n  return <ul>{orders.data}</ul>;\n};\n",
        },
      },
      {
        condition: 'a hook writes the queryFn as a shorthand property',
        files: {
          'src/features/orders/presentation/bindings/queries/list/list.hooks.ts':
            'const queryFn = (): number => 1;\n\nexport const options = { queryKey: orderKeys.all, queryFn };\n',
        },
      },
      {
        condition: 'a hook writes the queryFn as a method',
        files: {
          'src/features/orders/presentation/bindings/queries/list/list.hooks.ts':
            'export const options = {\n  queryKey: orderKeys.all,\n  queryFn() {\n    return 1;\n  },\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the cache utilities declare a read and the root builds the client',
        files: {
          'src/features/orders/presentation/bindings/shared/cache.ts':
            "export const listOptions = { queryKey: ['orders'], queryFn: (): number => 1 };\n",
          'src/root/query-client.ts':
            "import { QueryClient } from '@tanstack/react-query';\n\nexport const client = new QueryClient();\n",
        },
      },
      {
        condition: "a hook takes the read's queryOptions",
        files: {
          'src/features/orders/presentation/bindings/queries/show-order/show-order.hooks.ts':
            "import { useQuery } from '@tanstack/react-query';\n\nexport const useOrder = (orderId: string) => useQuery(orderQueryOptions(getOrder, orderId));\n",
        },
      },
      {
        condition: 'a spec writes a queryFn',
        files: {
          'src/features/orders/presentation/__tests__/list.hooks.test.ts':
            "export const options = { queryKey: ['orders'], queryFn: (): number => 1 };\n",
        },
      },
      {
        condition: 'the root writes a queryFn',
        files: {
          'src/root/prefetch.ts':
            "export const options = { queryKey: ['orders'], queryFn: (): number => 1 };\n",
        },
      },
      {
        condition: 'a hook reads a queryFn member of the options without declaring one',
        files: {
          'src/features/orders/presentation/bindings/queries/list/list.hooks.ts':
            'export const run = (options: { queryFn: () => number }): number => options.queryFn();\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'schema-builds-values-through-their-constructor',
    unit: {
      axes: [],
      blocks: [
        'schema/zod',
      ],
    },
    reported: [
      {
        condition: 'a type argument',
        files: {
          'src/features/accounts/infrastructure/api/models/account.model.ts':
            "import { z } from 'zod';\n\nexport const emailModel = z.string().brand<'Email'>();\n",
        },
      },
      {
        condition: 'a brand is taken with no type argument',
        files: {
          'src/features/accounts/infrastructure/api/models/account.model.ts':
            "import { z } from 'zod';\n\nexport const skuModel = z.string().regex(/^[A-Z]{3}-\\d{4}$/).brand();\n",
        },
      },
      {
        condition: 'a schema chain over several lines takes a brand',
        files: {
          'src/features/accounts/infrastructure/api/models/account.model.ts':
            "import { z } from 'zod';\n\nexport const emailModel = z\n  .string()\n  .min(3)\n  .brand<'Email'>();\n",
        },
      },
      {
        condition: 'a component module brands a schema',
        files: {
          'src/features/accounts/presentation/account-form.tsx':
            "import { z } from 'zod';\n\nconst emailModel = z.string().brand<'Email'>();\n\nexport const AccountForm = () => <p>{String(emailModel)}</p>;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a schema builds the value through its create function',
        files: {
          'src/features/accounts/infrastructure/api/models/account.model.ts':
            "import { z } from 'zod';\n\ndeclare const createEmail: (value: string) => string;\n\nexport const emailModel = z.string().transform((value) => createEmail(value));\n",
        },
      },
      {
        condition: 'a brand of something that is no schema is called',
        files: {
          'src/features/accounts/infrastructure/api/models/account.model.ts':
            'declare const label: { brand: () => string };\n\nexport const text = label.brand();\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'screen-height-class-never-used',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a class list sizes with h-screen',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='min-h-screen' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list sizes with h-screen alone',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='h-screen' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list sizes with the large viewport',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='h-lvh' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list caps a height by the large viewport under a variant',
        files: {
          'src/ui/classes.ts': "export const sheet = cn('md:max-h-lvh');\n",
        },
      },
      {
        condition: 'a class helper in a .ts file sizes with h-screen',
        files: {
          'src/ui/classes.ts': "export const shell = clsx('flex', 'h-screen');\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a class list sizes to the dynamic viewport',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='h-dvh' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list sizes to the small viewport',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='min-h-svh' />\n  );\n}\n",
        },
      },
      {
        condition: 'a string outside a class list holds h-screen',
        files: {
          'src/ui/classes.ts': "export const hint = 'h-screen';\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'screen-width-class-never-used',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a class list sizes with w-screen',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='w-screen' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list sizes with the dynamic viewport width',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='w-dvw' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list sizes a minimum width by the small viewport',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='min-w-svw' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class helper in a .ts file sizes with w-screen under a variant',
        files: {
          'src/ui/classes.ts': "export const shell = cn('md:w-screen');\n",
        },
      },
      {
        condition: 'a class list caps a width by the large viewport',
        files: {
          'src/ui/classes.ts': "export const shell = cn('max-w-lvw');\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a class list sizes to its container',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='w-full' />\n  );\n}\n",
        },
      },
      {
        condition: 'a class list caps a width at a breakpoint',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <main className='max-w-screen-md' />\n  );\n}\n",
        },
      },
      {
        condition: 'a string outside a class list holds w-screen',
        files: {
          'src/ui/classes.ts': "export const hint = 'w-screen';\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'set-timeout-called-only-at-the-edge',
    unit: {
      blocks: [],
    },
    reported: [
      {
        condition: 'an entity sets a timer',
        files: {
          'src/features/orders/domain/entities/order.entity.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'a use case sets an interval',
        files: {
          'src/features/orders/application/use-cases/commands/poll-orders.use-case.ts':
            'export const poll = (run: () => void): void => {\n  setInterval(run, 10);\n};\n',
        },
      },
      {
        condition: 'a use case sets a timer through globalThis',
        files: {
          'src/features/orders/application/use-cases/commands/poll-orders.use-case.ts':
            'export const later = (run: () => void): void => {\n  globalThis.setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'a use case awaits the promised setTimeout',
        files: {
          'src/features/orders/application/use-cases/commands/settle-order.use-case.ts':
            "import { setTimeout } from 'node:timers/promises';\n\nexport const settle = async (): Promise<void> => {\n  await setTimeout(10);\n};\n",
        },
      },
      {
        condition: 'a component sets a timer',
        files: {
          'src/features/orders/presentation/components/order-badge/order-badge.tsx':
            'export const OrderBadge = (): null => {\n  setTimeout(() => undefined, 10);\n\n  return null;\n};\n',
        },
      },
      {
        condition: "a feature's file named like an entry file sets a timer",
        files: {
          'src/features/orders/main.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'a domain file sets an immediate',
        files: {
          'src/kernel/utils/defer.ts':
            'export const defer = (run: () => void): void => {\n  setImmediate(run);\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a binding unit sets a timer',
        files: {
          'src/features/orders/presentation/bindings/poll-orders.use-case.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: "a binding unit of the program's presentation sets a timer",
        files: {
          'src/presentation/bindings/poll.tsx':
            'export const Poll = (): null => {\n  setTimeout(() => undefined, 10);\n\n  return null;\n};\n',
        },
      },
      {
        condition: "a composition module's binding unit sets a timer",
        files: {
          'src/composition/checkout/presentation/bindings/poll-checkout.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'an adapter sets a timer',
        files: {
          'src/infrastructure/clock/clock.adapter.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: "a feature's adapter sets a timer",
        files: {
          'src/features/orders/infrastructure/clock/clock.adapter.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'a lib sets a timer',
        files: {
          'src/libs/retry/retry.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'the composition root sets a timer',
        files: {
          'src/root/root.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'an entry file sets a timer',
        files: {
          'src/main.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: "an entrypoint's entry file sets a timer",
        files: {
          'src/entrypoints/worker/main.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: "an entrypoint's markup entry file sets a timer",
        files: {
          'src/entrypoints/app/main.tsx':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'an entry file of another name at the top of the source sets a timer',
        files: {
          'src/server.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'an integration sets a timer',
        files: {
          'src/integrations/vite/plugin.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'a spec sets a timer',
        files: {
          'src/features/orders/domain/entities/__tests__/order.entity.test.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'a script outside the source sets a timer',
        files: {
          'scripts/wait.ts':
            'export const later = (run: () => void): void => {\n  setTimeout(run, 10);\n};\n',
        },
      },
      {
        condition: 'a use case calls a method named setTimeout on a port',
        files: {
          'src/features/orders/application/use-cases/commands/poll-orders.use-case.ts':
            'interface Clock {\n  readonly setTimeout: (run: () => void) => void;\n}\n\nexport const later = (clock: Clock, run: () => void): void => {\n  clock.setTimeout(run);\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'spawn-given-an-env-built-for-it',
    unit: {
      axes: [],
      blocks: [
        'js-runtime/bun',
      ],
    },
    reported: [
      {
        condition: 'a process is left to inherit process.env',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', []);\n};\n",
        },
      },
      {
        condition: 'options name no env',
        files: {
          'src/listing.ts':
            "import { execFileSync } from 'node:child_process';\n\nexport const list = (): void => {\n  execFileSync('ls', [], { cwd: '/' });\n};\n",
        },
      },
      {
        condition:
          "a process started through the module's namespace is left to inherit process.env",
        files: {
          'src/listing.ts':
            "import * as childProcess from 'node:child_process';\n\nexport const list = (): void => {\n  childProcess.spawnSync('ls', []);\n};\n",
        },
      },
      {
        condition: "Bun's own start is left to inherit its env",
        files: {
          'src/listing.ts': "export const list = (): void => {\n  Bun.spawnSync(['ls']);\n};\n",
        },
      },
      {
        condition: 'a process is given process.env',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: process.env });\n};\n",
        },
      },
      {
        condition: 'a process is given a copy of process.env',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: { ...process.env, CI: '1' } });\n};\n",
        },
      },
      {
        condition: "a process is given process.env's entries",
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: Object.fromEntries(Object.entries(process.env)) });\n};\n",
        },
      },
      {
        condition: "Bun's own start is given a copy of Bun.env after a variable of its own",
        files: {
          'src/listing.ts':
            "export const list = (): void => {\n  Bun.spawnSync(['ls'], { env: { CI: '1', ...Bun.env } });\n};\n",
        },
      },
      {
        condition: "Bun's own start is given Bun.env",
        files: {
          'src/listing.ts':
            "export const list = (): void => {\n  Bun.spawnSync({ cmd: ['ls'], env: Bun.env });\n};\n",
        },
      },
      {
        condition: 'a process is given process.env assigned onto an object',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: Object.assign({ CI: '1' }, process.env) });\n};\n",
        },
      },
      {
        condition: 'a process is given a clone of process.env under a quoted key',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { 'env': structuredClone(process.env) });\n};\n",
        },
      },
      {
        condition: "a start imported from Bun's module is left to inherit its env",
        files: {
          'src/listing.ts':
            "import { spawn } from 'bun';\n\nexport const list = (): void => {\n  spawn(['ls']);\n};\n",
        },
      },
      {
        condition: 'a start imported under a name of its own is left to inherit process.env',
        files: {
          'src/listing.ts':
            "import { exec as run } from 'node:child_process';\n\nexport const list = (): void => {\n  run('ls');\n};\n",
        },
      },
      {
        condition: "a command of Bun's shell is given no env",
        files: {
          'src/listing.ts':
            'export const list = async (): Promise<void> => {\n  await Bun.$`ls`;\n};\n',
        },
      },
      {
        condition: "a command of Bun's shell is given Bun.env",
        files: {
          'src/listing.ts':
            'export const list = async (): Promise<void> => {\n  await Bun.$`ls`.env(Bun.env);\n};\n',
        },
      },
      {
        condition: "Bun's shell is given process.env for every command",
        files: {
          'src/listing.ts':
            "import { $ } from 'bun';\n\n$.env(process.env);\n\nexport const list = async (): Promise<void> => {\n  await $`ls`;\n};\n",
        },
      },
      {
        condition: "a process is given import.meta's env",
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: import.meta.env });\n};\n",
        },
      },
      {
        condition: 'a process started with a callback is left to inherit process.env',
        files: {
          'src/listing.ts':
            "import { execFile } from 'node:child_process';\n\nexport const list = (): void => {\n  execFile('ls', ['-l'], (error) => {\n    console.error(error);\n  });\n};\n",
        },
      },
      {
        condition:
          "a process started through the module's default import is left to inherit process.env",
        files: {
          'src/listing.ts':
            "import childProcess from 'child_process';\n\nexport const list = (): void => {\n  childProcess.fork('worker.js');\n};\n",
        },
      },
      {
        condition: 'a component starts a process left to inherit process.env',
        files: {
          'src/listing.tsx':
            "import { spawnSync } from 'node:child_process';\n\nexport const List = () => {\n  spawnSync('ls', []);\n\n  return <p />;\n};\n",
        },
      },
      {
        condition: "a command of Bun's shell imported under a name of its own is given no env",
        files: {
          'src/listing.ts':
            "import { $ as sh } from 'bun';\n\nexport const list = async (): Promise<void> => {\n  await sh`ls`;\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a process is given an env built for it',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: { CI: '1' } });\n};\n",
        },
      },
      {
        condition: 'a process is given a variable read from process.env',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: { PATH: process.env['PATH'] ?? '' } });\n};\n",
        },
      },
      {
        condition: 'an object that starts no process holds process.env',
        files: {
          'src/settings.ts': 'export const settings = { env: process.env };\n',
        },
      },
      {
        condition: 'a process is given the variables picked from process.env',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\ndeclare const pick: (from: object, names: readonly string[]) => Record<string, string>;\n\nexport const list = (): void => {\n  spawnSync('ls', [], { env: pick(process.env, ['PATH']) });\n};\n",
        },
      },
      {
        condition: 'a function of the module of its own is named like a start of a process',
        files: {
          'src/listing.ts':
            "import { execFileSync } from 'node:child_process';\n\nconst spawnWorker = (name: string): void => {\n  console.info(name);\n};\n\nexport const list = (): void => {\n  spawnWorker('ls');\n  execFileSync('ls', [], { env: { CI: '1' } });\n};\n",
        },
      },
      {
        condition: 'a process is given an env built for it under a quoted key',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\nexport const list = (): void => {\n  spawnSync('ls', [], { 'env': { CI: '1' } });\n};\n",
        },
      },
      {
        condition: "a command of Bun's shell is given an env built for it",
        files: {
          'src/listing.ts':
            "export const list = async (): Promise<void> => {\n  await Bun.$`ls`.env({ CI: '1' });\n};\n",
        },
      },
      {
        condition: "Bun's shell is given an env built for it for every command",
        files: {
          'src/listing.ts':
            "import { $ } from 'bun';\n\n$.env({ PATH: process.env['PATH'] ?? '' });\n\nexport const list = async (): Promise<void> => {\n  await $`ls`;\n};\n",
        },
      },
      {
        condition: "a function of the module of its own bears a start's name beside child_process",
        files: {
          'src/listing.ts':
            "import { execFileSync } from 'node:child_process';\n\nconst exec = (command: string): void => {\n  console.info(command);\n};\n\nexport const list = (): void => {\n  exec('ls');\n  execFileSync('ls', [], { env: { CI: '1' } });\n};\n",
        },
      },
      {
        condition: "a tag of the module of its own is named like Bun's shell beside child_process",
        files: {
          'src/listing.ts':
            "import { execFileSync } from 'node:child_process';\n\nconst $ = (parts: TemplateStringsArray): string => parts.join('');\n\nexport const list = (): string => {\n  execFileSync('ls', [], { env: { CI: '1' } });\n\n  return $`ls`;\n};\n",
        },
      },
      {
        condition: 'a process is given options read from a name',
        files: {
          'src/listing.ts':
            "import { spawnSync, type SpawnSyncOptions } from 'node:child_process';\n\nexport const list = (options: SpawnSyncOptions): void => {\n  spawnSync('ls', [], options);\n};\n",
        },
      },
      {
        condition: 'a process is given options spread from another object',
        files: {
          'src/listing.ts':
            "import { spawnSync } from 'node:child_process';\n\ndeclare const base: { env: Record<string, string> };\n\nexport const list = (): void => {\n  spawnSync('ls', [], { ...base, cwd: '/' });\n};\n",
        },
      },
      {
        condition: "Bun's own start is given an env built for it",
        files: {
          'src/listing.ts':
            "export const list = (): void => {\n  Bun.spawnSync({ cmd: ['ls'], env: { CI: '1' } });\n};\n",
        },
      },
      {
        condition: 'a start is only imported as a type',
        files: {
          'src/listing.ts':
            "import type { spawn } from 'node:child_process';\n\nexport type Start = typeof spawn;\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'spec-never-selects-from-the-document',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'tailwind',
        'testing-library',
      ],
    },
    reported: [
      {
        condition: 'a spec finds an element by a selector',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/__tests__/panel.test.tsx':
            "export const panel = (container: HTMLElement): Element | null =>\n  container.querySelector('.panel');\n",
        },
      },
      {
        condition: 'a spec in a TypeScript file finds every element by a selector',
        files: {
          'src/features/cart/cart.test.ts':
            "export const rows = (): NodeListOf<Element> => document.querySelectorAll('tr');\n",
        },
      },
      {
        condition: 'a spec reaches the selector through optional chaining',
        files: {
          'src/__tests__/panel.test.tsx':
            "export const panel = (container?: HTMLElement): Element | null | undefined =>\n  container?.querySelector('.panel');\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a spec finds an element by its role',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/__tests__/panel.test.tsx':
            "import { screen } from '@testing-library/react';\n\nexport const panel = (): HTMLElement => screen.getByRole('region');\n",
        },
      },
      {
        condition: 'production code queries the document by a selector',
        files: {
          'src/features/cart/presentation/cart-total.ts':
            "export const total = (): Element | null => document.querySelector('.cart-total');\n",
        },
      },
      {
        condition: 'a spec finds an element no person perceives by its data-testid',
        files: {
          'src/__tests__/panel.test.tsx':
            "import { screen } from '@testing-library/react';\n\nexport const portal = (): HTMLElement => screen.getByTestId('portal-root');\n",
        },
      },
      {
        condition:
          'the one spec of a framework selector queries through its constant under a suppression',
        files: {
          'src/__tests__/scroller.test.tsx':
            "import { PAGE_SCROLLER_SELECTOR } from '../scroller';\n\nexport const scroller = (): Element | null =>\n  // ast-grep-ignore: spec-never-selects-from-the-document@typescript\n  document.querySelector(PAGE_SCROLLER_SELECTOR);\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'strict-matcher-only',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a spec compares with toEqual',
        files: {
          'src/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('adds totals', () => {\n  expect(1).toEqual(1);\n});\n",
        },
      },
      {
        condition: 'a spec compares with toMatchObject',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should place the order when the cart is full', () => {\n  expect({ status: 'placed' }).toMatchObject({ status: 'placed' });\n});\n",
        },
      },
      {
        condition: 'a spec compares with not.toEqual',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should place the order when the cart is full', () => {\n  expect(1).not.toEqual(2);\n});\n",
        },
      },
      {
        condition: 'a spec checks with toBeTruthy',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should place the order when the cart is full', () => {\n  expect(1).toBeTruthy();\n});\n",
        },
      },
      {
        condition: 'a spec checks with toBeFalsy',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should place the order when the cart is full', () => {\n  expect(0).toBeFalsy();\n});\n",
        },
      },
      {
        condition: 'a spec compares with objectContaining',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should place the order when the cart is full', () => {\n  expect({ status: 'placed' }).toStrictEqual(expect.objectContaining({ status: 'placed' }));\n});\n",
        },
      },
      {
        condition: 'a spec compares with arrayContaining',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should place the order when the cart is full', () => {\n  expect([1, 2]).toStrictEqual(expect.arrayContaining([1]));\n});\n",
        },
      },
      {
        condition: 'a spec compares with a negated objectContaining',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should place the order when the cart is full', () => {\n  expect({ status: 'placed' }).toStrictEqual(expect.not.objectContaining({ status: 'paid' }));\n});\n",
        },
      },
      {
        condition: 'a markup spec compares with toEqual',
        files: {
          'src/panel.test.tsx':
            "import { expect, test } from 'bun:test';\n\ntest('should render the panel when asked', () => {\n  expect(<p />).toEqual(<p />);\n});\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a spec compares with toStrictEqual and toBe',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should place the order when the cart is full', () => {\n  expect({ status: 'placed' }).toStrictEqual({ status: 'placed' });\n  expect(1).toBe(1);\n});\n",
        },
      },
      {
        condition: 'a spec checks that a parse throws',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test } from 'bun:test';\n\ntest('should place the order when the cart is full', () => {\n  expect(() => JSON.parse('{')).toThrow();\n});\n",
        },
      },
      {
        condition: 'production code calls a method named toEqual',
        files: {
          'src/money.ts':
            'declare const amount: { toEqual: (other: number) => boolean };\n\nexport const isZero = amount.toEqual(0);\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'surface-only-re-exports',
    unit: {
      blocks: [],
    },
    reported: [
      {
        condition: "a feature's surface declares a value",
        files: {
          'src/features/orders/index.ts': "export const ORDERS = 'orders';\n",
        },
      },
      {
        condition: 'a surface imports what it offers',
        files: {
          'src/features/orders/index.ts':
            "import { placeOrder } from './application/use-cases';\n\nexport { placeOrder };\n",
        },
      },
      {
        condition: 'a surface declares a function beside its re-exports',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\nexport function orderTotal(lines: readonly number[]): number {\n  return lines.reduce((total, line) => total + line, 0);\n}\n",
        },
      },
      {
        condition: 'a surface declares a type',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\nexport type OrderId = string;\n",
        },
      },
      {
        condition: 'a surface declares an interface',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\nexport interface Order {\n  readonly id: string;\n}\n",
        },
      },
      {
        condition: 'a surface declares an enum',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\nexport enum OrderStatus {\n  Placed = 'placed',\n}\n",
        },
      },
      {
        condition: 'a surface declares a class',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\nexport class OrderError extends Error {}\n",
        },
      },
      {
        condition: 'a surface declares a value it does not export',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\nconst ORDERS = 'orders';\n",
        },
      },
      {
        condition: 'a surface exports a default value',
        files: {
          'src/features/orders/index.ts': "export default 'orders';\n",
        },
      },
      {
        condition: 'a surface exports a default function',
        files: {
          'src/features/orders/index.ts':
            "export default function orders(): string {\n  return 'orders';\n}\n",
        },
      },
      {
        condition: 'a surface runs a statement',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\nconsole.info('orders loaded');\n",
        },
      },
      {
        condition: 'a surface branches',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\nif (import.meta.env.DEV) {\n  console.info('orders');\n}\n",
        },
      },
      {
        condition: 'a surface loops in a switch',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\nswitch (import.meta.env.MODE) {\n  default:\n}\n",
        },
      },
      {
        condition: 'a surface declares a namespace',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\nexport namespace Orders {\n  export const name = 'orders';\n}\n",
        },
      },
      {
        condition: 'a surface declares an ambient module',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\n\ndeclare module 'orders' {\n  export const name: string;\n}\n",
        },
      },
      {
        condition: 'a surface assigns its export',
        files: {
          'src/features/orders/index.ts':
            "import { orders } from './orders';\n\nexport = orders;\n",
        },
      },
      {
        condition: "a component's surface declares a component",
        files: {
          'src/features/orders/presentation/components/order-badge/index.tsx':
            'export const OrderBadge = (): null => null;\n',
        },
      },
      {
        condition: "the composition root's surface declares a value in a .ts file",
        files: {
          'src/root/index.ts': "export const ROOT = 'root';\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a surface re-exports by name',
        files: {
          'src/features/orders/index.ts':
            "export { placeOrder } from './application/use-cases';\nexport type { Order } from './domain/order/entities';\n",
        },
      },
      {
        condition: 'a surface re-exports a default by name',
        files: {
          'src/features/orders/index.ts': "export { default as orders } from './orders';\n",
        },
      },
      {
        condition: 'a surface re-exports a whole module',
        files: {
          'src/features/orders/index.ts': "export * from './application/use-cases';\n",
        },
      },
      {
        condition: 'a surface holds a comment beside its re-exports',
        files: {
          'src/features/orders/index.ts':
            "// Why: the read side alone is offered to the dashboard.\nexport { placeOrder } from './application/use-cases';\n",
        },
      },
      {
        condition: 'a file other than a surface declares a value',
        files: {
          'src/features/orders/orders.ts': "export const ORDERS = 'orders';\n",
        },
      },
      {
        condition: 'a function inside a non-surface file declares and branches',
        files: {
          'src/features/orders/order-total.ts':
            'export function orderTotal(lines: readonly number[]): number {\n  if (lines.length === 0) {\n    return 0;\n  }\n\n  return lines.reduce((total, line) => total + line, 0);\n}\n',
        },
      },
      {
        condition: 'a markup surface of the composition root declares itself',
        files: {
          'src/root/routes/orders/index.tsx': 'export const Route = (): null => null;\n',
        },
      },
      {
        condition: 'a route of the root declares itself in an index',
        files: {
          'src/root/routes/index.ts': 'export const Route = 1;\n',
        },
        unit: {
          blocks: [
            'react/react-dom',
            'tanstack-router',
          ],
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'test-runs-unconditionally',
    reported: [
      {
        condition: 'a concurrent case is left to do',
        files: {
          'src/__tests__/order.test.ts':
            "import { test } from 'bun:test';\n\ntest.concurrent.todo('should add totals when both are set');\n",
        },
      },
      {
        condition: 'a case is left to do',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, it, describe } from 'bun:test';\n\ntest.todo('should add totals when both are set');\n",
        },
      },
      {
        condition: 'a case runs only under a condition',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, it, describe } from 'bun:test';\n\ntest.if(process.platform === 'linux')('should add totals when both are set', () => {\n  expect(1).toBe(1);\n});\n",
        },
      },
      {
        condition: 'a case is skipped under a condition',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, it, describe } from 'bun:test';\n\nit.skipIf(process.env['CI'] === '1')('should add totals when both are set', () => {\n  expect(1).toBe(1);\n});\n",
        },
      },
      {
        condition: 'a case is left to do under a condition',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, it, describe } from 'bun:test';\n\nit.todoIf(true)('should add totals when both are set', () => {\n  expect(1).toBe(1);\n});\n",
        },
      },
      {
        condition: 'a case is expected to fail',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, it, describe } from 'bun:test';\n\ntest.failing('should add totals when both are set', () => {\n  expect(1).toBe(2);\n});\n",
        },
      },
      {
        condition: 'a table of cases runs only under a condition',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, it, describe } from 'bun:test';\n\ndescribe.if(true).each([1])('totals %d', (total) => {\n  expect(total).toBe(total);\n});\n",
        },
      },
      {
        condition: 'a suite runs only under a condition written over two lines',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, it, describe } from 'bun:test';\n\ndescribe\n  .if(true)('totals', () => {\n    test('should add totals when both are set', () => {\n      expect(1).toBe(1);\n    });\n  });\n",
        },
      },
      {
        condition: 'a markup case is left to do',
        files: {
          'src/panel.test.tsx':
            "import { test } from 'bun:test';\n\ntest.todo('should show the panel when it loads');\n\nexport const view = <p />;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a case and a table of cases run every time',
        files: {
          'src/__tests__/order.test.ts':
            "import { expect, test, it, describe } from 'bun:test';\n\ntest('should add totals when both are set', () => {\n  expect(1).toBe(1);\n});\n\ntest.concurrent.each([1, 2])('should keep %d when it is set', (total) => {\n  expect(total).toBe(total);\n});\n",
        },
      },
      {
        condition: 'production code calls a method named todo',
        files: {
          'src/todos.ts':
            "declare const test: { todo: (title: string) => void };\n\ntest.todo('write the invoice');\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'transition-all-never-used',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'tailwind',
      ],
    },
    reported: [
      {
        condition: 'a class list transitions every property',
        files: {
          'src/ui/button.tsx':
            'export function Button(): React.ReactElement {\n  return <button className="transition-all" type="button" />;\n}\n',
        },
      },
      {
        condition: 'a class helper in a .ts file transitions every property under a variant',
        files: {
          'src/ui/classes.ts':
            "export const button = cn('bg-primary', 'motion-safe:transition-all');\n",
        },
      },
      {
        condition: 'a cva variant transitions every property',
        files: {
          'src/ui/classes.ts':
            "export const button = cva('bg-primary', { variants: { tone: { soft: 'transition-all' } } });\n",
        },
      },
      {
        condition: 'a class helper in another attribute transitions every property',
        files: {
          'src/ui/panel.tsx':
            "export const Panel = () => <Card bodyClassName={cn('transition-all')} />;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a class list transitions the colours',
        files: {
          'src/ui/button.tsx':
            'export function Button(): React.ReactElement {\n  return <button className="transition-colors" type="button" />;\n}\n',
        },
      },
      {
        condition: 'a class list uses the default transition',
        files: {
          'package.json':
            '{"name":"fixture","dependencies":{"react":"19.2.0","tailwindcss":"4.2.0"}}',
          'src/panel.tsx':
            "export function Panel(): React.ReactElement {\n  return (\n    <button className='transition duration-fast' />\n  );\n}\n",
        },
      },
      {
        condition: 'a string outside a class list holds transition-all',
        files: {
          'src/ui/classes.ts': "export const hint = 'transition-all';\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'tsx-only-where-markup-is-written',
    reported: [
      {
        condition: 'a .tsx file writes no markup',
        files: {
          'src/ui/order-total.tsx': 'export const orderTotal = 1;\n',
        },
      },
      {
        condition: 'a .tsx file opens with a statement and writes no markup',
        files: {
          'src/ui/order-total.tsx':
            'for (const total of [\n  1,\n]) {\n  console.info(total);\n}\n\nexport const orderTotal = 1;\n',
        },
      },
      {
        condition: 'a .tsx file writes only a generic arrow function',
        files: {
          'src/ui/identity.tsx':
            'export const identity = <TValue,>(value: TValue): TValue => value;\n',
        },
      },
      {
        condition: 'a .tsx file opens with a comment and writes no markup',
        files: {
          'src/ui/order-status-label-key.utils.tsx':
            "// Why: the keys follow the catalogue's own order.\nexport const orderStatusLabelKey = (status: string): string => `orders.status.${status}`;\n",
        },
      },
      {
        condition: 'a .tsx file only imports and declares types',
        files: {
          'src/ui/props.tsx':
            "import type { ReactNode } from 'react';\n\nexport type PanelProps = {\n  readonly children: ReactNode;\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a .tsx file renders an element',
        files: {
          'src/ui/order-total.tsx':
            'export function OrderTotal(): React.ReactElement {\n  return <p>1</p>;\n}\n',
        },
      },
      {
        condition: 'a .tsx file renders a fragment',
        files: {
          'src/ui/order-total.tsx':
            'export function OrderTotal(): React.ReactElement {\n  return <>1</>;\n}\n',
        },
      },
      {
        condition: 'a .tsx file renders a self-closing element',
        files: {
          'src/ui/divider.tsx': 'export const Divider = (): React.ReactElement => <hr />;\n',
        },
      },
      {
        condition: 'a .ts file writes no markup',
        files: {
          'src/ui/order-total.ts': 'export const orderTotal = 1;\n',
        },
      },
      {
        condition: 'a .tsx file holds only comments',
        files: {
          'src/ui/placeholder.tsx': '// Why: generated later by the design tool.\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'type-name-undecorated',
    unit: {
      axes: [],
      blocks: [
        'bun-test',
      ],
    },
    reported: [
      {
        condition: 'a type alias carries the Type suffix',
        files: {
          'src/features/orders/order.ts': 'export type OrderType = {\n  id: string;\n};\n',
        },
      },
      {
        condition: 'an interface carries the I prefix',
        files: {
          'src/features/payments/application/contracts/payment.port.ts':
            'export interface IPaymentPort {\n  readonly charge: (amount: number) => Promise<void>;\n}\n',
        },
      },
      {
        condition: 'an interface carries the Interface suffix',
        files: {
          'src/features/orders/order.ts':
            'export interface OrderInterface {\n  readonly id: string;\n}\n',
        },
      },
      {
        condition: 'a generic type alias carries the Type suffix',
        files: {
          'src/libs/page/page.ts':
            'export type PageType<TItem> = {\n  readonly items: readonly TItem[];\n};\n',
        },
      },
      {
        condition: 'a .tsx file declares props with the Type suffix',
        files: {
          'src/ui/badge.tsx':
            'type BadgePropsType = { readonly label: string };\n\nexport const Badge = (props: BadgePropsType): React.ReactElement => <span>{props.label}</span>;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a type is named by its noun',
        files: {
          'src/features/orders/order.ts':
            'export type Order = {\n  readonly id: string;\n};\n\nexport interface PaymentPort {\n  readonly charge: (amount: number) => Promise<void>;\n}\n',
        },
      },
      {
        condition: 'a name opens with an I that starts a word',
        files: {
          'src/features/billing/invoice.ts':
            'export type Invoice = {\n  readonly id: string;\n};\n\nexport interface Item {\n  readonly id: string;\n}\n',
        },
      },
      {
        condition: 'a type refers to a decorated name it does not declare',
        files: {
          'src/libs/http/headers.ts':
            "import type { ContentType } from 'vendor';\n\nexport type Headers = {\n  readonly contentType: ContentType;\n};\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'undefined-is-the-only-absence',
    reported: [
      {
        condition: 'null is assigned outside an adapter',
        files: {
          'src/features/orders/domain/order.ts':
            'export const cancelledAt: Date | undefined = null;\n',
        },
      },
      {
        condition: "a field's type admits null",
        files: {
          'src/features/customers/domain/customer.ts':
            'export type Customer = {\n  readonly id: string;\n  readonly phone: string | null;\n};\n',
        },
      },
      {
        condition: 'a value is compared loosely with null',
        files: {
          'src/features/orders/domain/order.ts':
            'export const isMissing = (value: string | undefined): boolean => value == null;\n',
        },
      },
      {
        condition: 'a function returns null',
        files: {
          'src/features/orders/domain/order.ts':
            'export const firstLine = (lines: readonly string[]): string | undefined => {\n  if (lines.length === 0) {\n    return null;\n  }\n\n  return lines[0];\n};\n',
        },
      },
      {
        condition: 'null is passed to a call other than an allowed one',
        files: {
          'src/features/orders/application/clear.ts':
            'export const clear = (store: { save: (value: unknown) => void }): void => {\n  store.save(null);\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'an adapter maps null from the wire',
        files: {
          'src/features/orders/infrastructure/api/order.adapter.ts':
            'export const toCancelledAt = (raw: string | null): string | undefined =>\n  raw === null ? undefined : raw;\n',
        },
      },
      {
        condition: 'a wire model keeps the null of its format',
        files: {
          'src/features/customers/dtos/customer.dto.ts':
            'export type CustomerDto = {\n  readonly phone: string | null;\n};\n',
        },
      },
      {
        condition: 'a value is compared strictly with null',
        files: {
          'src/libs/json/is-null.ts':
            'export const isNull = (value: unknown): boolean => value === null;\n\nexport const isPresent = (value: unknown): boolean => null !== value;\n',
        },
      },
      {
        condition: 'an object is made with no prototype',
        files: {
          'src/libs/dictionary/dictionary.ts':
            'export const emptyDictionary = (): Record<string, string> => Object.create(null);\n',
        },
      },
      {
        condition: 'a value is written as indented JSON',
        files: {
          'src/libs/json/pretty.ts':
            'export const pretty = (value: unknown): string => JSON.stringify(value, null, 2);\n',
        },
      },
      {
        condition: "a ref object's type admits null",
        files: {
          'src/libs/focus/focus.ts':
            "import type { RefObject } from 'react';\n\nexport const focus = (target: RefObject<HTMLElement | null>): void => {\n  target.current?.focus();\n};\n",
        },
      },
      {
        condition: 'a ref is created with null',
        files: {
          'src/libs/focus/use-focus-target.ts':
            "import { useRef } from 'react';\n\nexport const useFocusTarget = () => useRef<HTMLElement>(null);\n",
        },
      },
      {
        condition: 'a .tsx file holds null',
        files: {
          'src/ui/empty.tsx': 'export const Empty = (): React.ReactElement | null => null;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'zod-four-forms-only',
    unit: {
      axes: [],
      blocks: [
        'schema/zod',
      ],
    },
    reported: [
      {
        condition: 'a schema chains a format on z.string()',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nexport const userModel = z.strictObject({ email: z.string().email() });\n",
        },
      },
      {
        condition: 'a schema takes a native enum',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nenum Tier {\n  Free = 'free',\n}\n\nexport const tierModel = z.nativeEnum(Tier);\n",
        },
      },
      {
        condition: 'an object schema is made strict by .strict()',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nexport const userModel = z.object({ id: z.string() }).strict();\n",
        },
      },
      {
        condition: 'an object schema keeps unknown keys by .passthrough()',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nexport const userModel = z.object({ id: z.string() }).passthrough();\n",
        },
      },
      {
        condition: 'a named schema merges another',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nconst baseSchema = z.strictObject({ id: z.string() });\nconst nameSchema = z.strictObject({ name: z.string() });\n\nexport const userModel = baseSchema.merge(nameSchema);\n",
        },
      },
      {
        condition: 'a schema chains a format on z.string() after a check',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nexport const userModel = z.strictObject({ id: z.string().min(1).uuid() });\n",
        },
      },
      {
        condition: 'a schema chains a date-time format on z.string() over several lines',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nexport const sentAt = z\n  .string()\n  .datetime();\n",
        },
      },
      {
        condition: 'a schema imported from zod/v4 takes a native enum',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod/v4';\n\nenum Tier {\n  Free = 'free',\n}\n\nexport const tierModel = z.nativeEnum(Tier);\n",
        },
      },
      {
        condition: 'a component module chains a format on z.string()',
        files: {
          'src/features/chat/presentation/user-form.tsx':
            "import { z } from 'zod';\n\nconst formSchema = z.strictObject({ email: z.string().email() });\n\nexport const UserForm = () => <p>{String(formSchema)}</p>;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a schema takes a format on its own and merges by extend',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nconst baseSchema = z.strictObject({ id: z.string() });\n\nexport const userModel = baseSchema.extend({ email: z.email() });\n",
        },
      },
      {
        condition: 'a schema takes a Zod 4 enum, a loose object and a format of its own',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\nenum Tier {\n  Free = 'free',\n}\n\nexport const userModel = z.looseObject({ tier: z.enum(Tier), id: z.uuid(), sentAt: z.iso.datetime() });\n",
        },
      },
      {
        condition: 'a module that imports no zod merges its own objects',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            'declare const settingsSchema: { merge: (other: object) => object };\n\nexport const merged = settingsSchema.merge({});\n',
        },
      },
      {
        condition: 'a date is taken of something that is no string schema',
        files: {
          'src/features/chat/infrastructure/api/models/user.model.ts':
            "import { z } from 'zod';\n\ndeclare const clock: { date: () => string };\n\nexport const today = clock.date();\nexport const idModel = z.strictObject({ id: z.string().min(1) });\n",
        },
      },
    ],
  },
];

const pluginRows: readonly PluginRow[] = [
  ...presetRows,
  ...formatsPluginRows,
  ...frameworksPluginRows,
  ...interfacePluginRows,
  ...pythonPluginRows,
  ...typescriptPluginRows,
];

describe('the ast-grep rules of the presets', () => {
  it('should hold a row for each rule file when the presets give a rule', () => {
    // Act
    const missing = pluginsWithNoRow(pluginRows);

    // Assert
    expect(missing).toStrictEqual([]);
  });

  it.concurrent.each(reportedCases(pluginRows))(
    'should report $slug when $condition',
    async (pluginCase) => {
      // Act
      const found = await pluginsOf(pluginCase);

      // Assert
      expect(found).toContain(pluginCase.slug);
    },
    SCAN_TIMEOUT,
  );

  it.concurrent.each(allowedCases(pluginRows))(
    'should not report $slug when $condition',
    async (pluginCase) => {
      // Act
      const found = await pluginsOf(pluginCase);

      // Assert
      expect(found).not.toContain(pluginCase.slug);
    },
    SCAN_TIMEOUT,
  );
});

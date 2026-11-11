import type { PluginRow } from './ast-grep-plugins.fixtures';

const interfacePluginRows: readonly PluginRow[] = [
  {
    language: 'css',
    slug: 'layer-order-declared-first-in-the-entry-stylesheet',
    unit: {
      axes: [],
      blocks: [
        'css',
      ],
    },
    reported: [
      {
        condition: 'the layer order follows a filled layer',
        files: {
          'src/styles/app.css':
            '@layer reset {\n  a {\n    color: inherit;\n  }\n}\n\n@layer reset, base;\n',
        },
      },
      {
        condition: 'the layer order follows an import into a layer',
        files: {
          'src/styles/app.css': '@import url("reset.css") layer(reset);\n@layer reset, base;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the layer order opens the stylesheet',
        files: {
          'src/styles/app.css':
            '@layer reset, base;\n\n@layer reset {\n  a {\n    color: inherit;\n  }\n}\n',
        },
      },
      {
        condition: 'the layer order comes before an import into a layer',
        files: {
          'src/styles/app.css': '@layer reset, base;\n@import url("reset.css") layer(reset);\n',
        },
      },
    ],
  },
  {
    language: 'css',
    slug: 'focus-ring-drawn-as-an-outline',
    unit: {
      axes: [],
      blocks: [
        'css',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'the focus ring is an outline set to none',
        files: {
          'src/styles/app.css':
            '@layer components {\n  .checkout-button:focus-visible {\n    outline: none;\n    box-shadow: 0 0 0 3px var(--color-focus);\n  }\n}\n',
        },
      },
      {
        condition: 'the outline is set to 0',
        files: {
          'src/styles/app.css':
            '@layer components {\n  .checkout-button:focus {\n    outline: 0;\n  }\n}\n',
        },
      },
      {
        condition: "the outline's style is none",
        files: {
          'src/styles/app.css':
            '@layer components {\n  .checkout-button:focus-visible {\n    outline-style: none;\n  }\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the focus ring is an outline of its own',
        files: {
          'src/styles/app.css':
            '@layer components {\n  .checkout-button:focus-visible {\n    outline: 2px solid var(--color-focus);\n    outline-offset: 2px;\n  }\n}\n',
        },
      },
      {
        condition: 'a transparent outline sits beside a shadow',
        files: {
          'src/styles/app.css':
            '@layer components {\n  .checkout-button:focus-visible {\n    outline: 2px solid transparent;\n    box-shadow: 0 0 0 3px var(--color-focus);\n  }\n}\n',
        },
      },
      {
        condition: 'the outline is hidden only while focus is not visible',
        files: {
          'src/styles/app.css':
            '@layer components {\n  .checkout-button:focus:not(:focus-visible) {\n    outline: none;\n  }\n}\n',
        },
      },
    ],
  },
  {
    language: 'html',
    slug: 'boolean-attribute-written-by-presence',
    unit: {
      axes: [],
      blocks: [
        'html',
      ],
    },
    reported: [
      {
        condition: 'a field is disabled by "false"',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <input name="note" disabled="false">\n  </body>\n</html>\n',
        },
      },
      {
        condition: 'a section is hidden by no',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <section hidden=no>Orders</section>\n  </body>\n</html>\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a disabled field carries the attribute alone',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <input name="note" disabled>\n  </body>\n</html>\n',
        },
      },
      {
        condition: 'an enabled field leaves the attribute out',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <input name="note">\n  </body>\n</html>\n',
        },
      },
      {
        condition: 'a section is hidden until found',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <section hidden="until-found">Orders</section>\n  </body>\n</html>\n',
        },
      },
    ],
  },
  {
    language: 'html',
    slug: 'document-declares-utf-8-first',
    unit: {
      axes: [],
      blocks: [
        'html',
      ],
    },
    reported: [
      {
        condition: 'the head declares no encoding',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <title>Orders</title>\n  </head>\n</html>\n',
        },
      },
      {
        condition: 'the head declares another encoding',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="windows-1252">\n    <title>Orders</title>\n  </head>\n</html>\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the head declares utf-8 first',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <main>Orders</main>\n  </body>\n</html>\n',
        },
      },
      {
        condition: 'a fragment has no head',
        files: {
          'public/partials/footer.html': '<footer>Orders</footer>\n',
        },
      },
    ],
  },
  {
    language: 'html',
    slug: 'table-has-an-accessible-name',
    unit: {
      axes: [],
      blocks: [
        'html',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'a table has no name',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <table>\n      <tr><td>1</td></tr>\n    </table>\n  </body>\n</html>\n',
        },
      },
      {
        condition: "a table's label is empty",
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <table aria-label="">\n      <tr><td>1</td></tr>\n    </table>\n  </body>\n</html>\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a table has a caption',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <table>\n      <caption>Orders</caption>\n      <tr><td>1</td></tr>\n    </table>\n  </body>\n</html>\n',
        },
      },
      {
        condition: 'a table is labelled by its heading',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <h2 id="orders">Orders</h2>\n    <table aria-labelledby="orders">\n      <tr><td>1</td></tr>\n    </table>\n  </body>\n</html>\n',
        },
      },
      {
        condition: "a spec's golden file holds a table a renderer wrote",
        files: {
          'src/features/content/__tests__/remark.adapter.golden.html':
            '<table>\n  <tr><td>1</td></tr>\n</table>\n',
        },
      },
    ],
  },
  {
    language: 'html',
    slug: 'viewport-declared-responsive',
    unit: {
      axes: [],
      blocks: [
        'html',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'the head declares no viewport',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <title>Orders</title>\n  </head>\n</html>\n',
        },
      },
      {
        condition: 'the viewport sets no initial scale',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width">\n  </head>\n</html>\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the head declares the responsive viewport',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <main>Orders</main>\n  </body>\n</html>\n',
        },
      },
      {
        condition: 'a fragment has no head',
        files: {
          'public/partials/footer.html': '<footer>Orders</footer>\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'boolean-attribute-written-by-presence',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'html',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'a field is disabled by "false"',
        files: {
          'src/presentation/components/order-table/order-table.tsx':
            'export const OrderNote = () => <input name="note" disabled="false" />;\n',
        },
      },
      {
        condition: 'a details element is opened by {"false"}',
        files: {
          'src/presentation/components/order-table/order-table.tsx':
            "export const OrderNote = () => <details open={'false'} />;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a field is enabled by {false}',
        files: {
          'src/presentation/components/order-table/order-table.tsx':
            'export const OrderNote = () => <input name="note" disabled={false} />;\n',
        },
      },
      {
        condition: "a component's prop takes the text false",
        files: {
          'src/presentation/components/order-table/order-table.tsx':
            'export const OrderNote = () => <Toggle open="false" />;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'table-has-an-accessible-name',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'html',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'a table has no name',
        files: {
          'src/presentation/components/order-table/order-table.tsx':
            'export const OrderTable = () => (\n  <table>\n    <tbody />\n  </table>\n);\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a table has a caption',
        files: {
          'src/presentation/components/order-table/order-table.tsx':
            'export const OrderTable = () => (\n  <table>\n    <caption>Orders</caption>\n    <tbody />\n  </table>\n);\n',
        },
      },
      {
        condition: 'a table is labelled by its heading',
        files: {
          'src/presentation/components/order-table/order-table.tsx':
            'export const OrderTable = () => (\n  <table aria-labelledby="orders">\n    <tbody />\n  </table>\n);\n',
        },
      },
      {
        condition: 'a table primitive takes its name from its caller',
        files: {
          'src/presentation/components/order-table/order-table.tsx':
            "import type { ComponentProps } from 'react';\n\nexport const Table = (props: ComponentProps<'table'>) => <table {...props} />;\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'labels-bound-by-html-for',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'html',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'a label wraps its field',
        files: {
          'src/presentation/components/order-form/order-form.tsx':
            'export const OrderForm = () => (\n  <label>\n    Note <input name="note" />\n  </label>\n);\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a label names its field by htmlFor',
        files: {
          'src/presentation/components/order-form/order-form.tsx':
            'export const OrderForm = ({ id }: { id: string }) => <label htmlFor={id}>Note</label>;\n',
        },
      },
      {
        condition: 'a label primitive takes htmlFor from its caller',
        files: {
          'src/presentation/components/order-form/order-form.tsx':
            "import type { ComponentProps } from 'react';\n\nexport const Label = (props: ComponentProps<'label'>) => <label {...props} />;\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'head-written-by-hoisted-elements',
    unit: {
      axes: [],
      blocks: [
        'react/react-dom',
        'client/browser',
        'html',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'an effect sets the title',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            "import { useEffect } from 'react';\n\nexport const OrderScreen = () => {\n  useEffect(() => {\n    document.title = 'Orders';\n  }, []);\n\n  return <main />;\n};\n",
        },
      },
      {
        condition: 'a link is appended to the head',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            'export const addIcon = (link: HTMLLinkElement) => {\n  document.head.appendChild(link);\n};\n',
        },
      },
      {
        condition: 'a library writes the head',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            'import { Helmet } from \'react-helmet-async\';\n\nexport const OrderScreen = () => <Helmet title="Orders" />;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the screen renders its title for React to hoist',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            'export const OrderScreen = () => (\n  <main>\n    <title>Orders</title>\n  </main>\n);\n',
        },
      },
      {
        condition: 'the code reads the title',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            'export const titleOf = (): string => document.title;\n',
        },
      },
      {
        condition: "a spec's fixture clears the head",
        files: {
          'src/presentation/__tests__/styles.fixtures.ts':
            'export const removeStylesheets = (): void => {\n  document.head.replaceChildren();\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'cross-origin-script-loaded-with-integrity',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
        'react/react-dom',
        'html',
      ],
    },
    reported: [
      {
        condition: 'a script of another origin has no integrity',
        files: {
          'src/presentation/widgets/checkout-widget/checkout-widget.tsx':
            'export const CheckoutWidget = () => <script async src="https://cdn.example.com/pay.js" />;\n',
        },
      },
      {
        condition: 'a script of another origin has integrity and no crossOrigin',
        files: {
          'src/presentation/widgets/checkout-widget/checkout-widget.tsx':
            'export const CheckoutWidget = () => (\n  <script async integrity="sha384-abc" src="//cdn.example.com/pay.js" />\n);\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a script of another origin carries integrity and crossOrigin',
        files: {
          'src/presentation/widgets/checkout-widget/checkout-widget.tsx':
            'export const CheckoutWidget = () => (\n  <script async crossOrigin="anonymous" integrity="sha384-abc" src="https://cdn.example.com/pay.js" />\n);\n',
        },
      },
      {
        condition: 'a script is served from the same origin',
        files: {
          'src/presentation/widgets/checkout-widget/checkout-widget.tsx':
            'export const CheckoutWidget = () => <script async src="/scripts/pay.js" />;\n',
        },
      },
      {
        condition: "a tag manager's loader runs by its nonce",
        files: {
          'src/presentation/widgets/checkout-widget/checkout-widget.tsx':
            'export const CheckoutWidget = ({ nonce }: { nonce: string }) => (\n  <script async nonce={nonce} src="https://www.googletagmanager.com/gtm.js?id=GTM-1" />\n);\n',
        },
      },
    ],
  },
  {
    language: 'html',
    slug: 'cross-origin-script-loaded-with-integrity',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
        'html',
      ],
    },
    reported: [
      {
        condition: 'a script of another origin has no integrity',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <script src="https://cdn.example.com/pay.js"></script>\n  </body>\n</html>\n',
        },
      },
      {
        condition: 'a script of another origin has integrity and no crossorigin',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <script src="https://cdn.example.com/pay.js" integrity="sha384-abc"></script>\n  </body>\n</html>\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a script of another origin carries integrity and crossorigin',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <script src="https://cdn.example.com/pay.js" integrity="sha384-abc" crossorigin="anonymous"></script>\n  </body>\n</html>\n',
        },
      },
      {
        condition: 'a script is served from the same origin',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <script type="module" src="/src/main.ts"></script>\n  </body>\n</html>\n',
        },
      },
      {
        condition: "a tag manager's loader runs by its nonce",
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <script nonce="r4nd0m" src="https://www.googletagmanager.com/gtm.js?id=GTM-1"></script>\n  </body>\n</html>\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'page-exit-work-runs-when-the-page-hides',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
      ],
    },
    reported: [
      {
        condition: 'exit work listens for unload',
        files: {
          'src/infrastructure/browser/page-exit.ts':
            "export const saveOnExit = (save: () => void) => {\n  window.addEventListener('unload', save);\n};\n",
        },
      },
      {
        condition: 'exit work is assigned to onunload',
        files: {
          'src/infrastructure/browser/page-exit.ts':
            'export const saveOnExit = (save: () => void) => {\n  window.onunload = save;\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'exit work runs on pagehide',
        files: {
          'src/infrastructure/browser/page-exit.ts':
            "export const saveOnExit = (save: () => void) => {\n  window.addEventListener('pagehide', save);\n};\n",
        },
      },
      {
        condition: 'exit work runs when the page is hidden',
        files: {
          'src/infrastructure/browser/page-exit.ts':
            "export const saveOnExit = (save: () => void) => {\n  document.addEventListener('visibilitychange', () => {\n    if (document.visibilityState === 'hidden') {\n      save();\n    }\n  });\n};\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'service-worker-update-waits-for-the-page',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
      ],
    },
    reported: [
      {
        condition: 'the worker skips the wait as it installs',
        files: {
          'src/service-worker.ts':
            "declare const self: ServiceWorkerGlobalScope;\n\nself.addEventListener('install', () => {\n  void self.skipWaiting();\n});\n",
        },
      },
      {
        condition: "Workbox's configuration skips the wait",
        files: {
          'vite.config.ts': 'export const pwa = { workbox: { skipWaiting: true } };\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the worker skips the wait when its page asks',
        files: {
          'src/service-worker.ts':
            "declare const self: ServiceWorkerGlobalScope;\n\nself.addEventListener('message', (event) => {\n  if (event.data === 'SKIP_WAITING') {\n    void self.skipWaiting();\n  }\n});\n",
        },
      },
      {
        condition: 'the worker claims its clients as it activates',
        files: {
          'src/service-worker.ts':
            "declare const self: ServiceWorkerGlobalScope;\n\nself.addEventListener('activate', (event) => {\n  event.waitUntil(self.clients.claim());\n});\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'cross-window-message-posted-to-a-named-origin',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
      ],
    },
    reported: [
      {
        condition: 'a message is posted to any origin',
        files: {
          'src/infrastructure/embed/embed.adapter.ts':
            "export const notify = (frame: HTMLIFrameElement) => {\n  frame.contentWindow?.postMessage({ kind: 'ready' }, '*');\n};\n",
        },
      },
      {
        condition: 'the options name any origin',
        files: {
          'src/infrastructure/embed/embed.adapter.ts':
            "export const notify = () => {\n  window.parent.postMessage({ kind: 'ready' }, { targetOrigin: '*' });\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a message is posted to a named origin',
        files: {
          'src/infrastructure/embed/embed.adapter.ts':
            "export const notify = () => {\n  window.parent.postMessage({ kind: 'ready' }, 'https://shop.example');\n};\n",
        },
      },
      {
        condition: 'a message is posted to a worker with its transfer list',
        files: {
          'src/infrastructure/embed/embed.adapter.ts':
            'export const send = (worker: Worker, buffer: ArrayBuffer) => {\n  worker.postMessage(buffer, [buffer]);\n};\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'live-region-mounted-before-message',
    unit: {
      axes: [],
      blocks: [
        'client/browser',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'an alert mounts with its error',
        files: {
          'src/presentation/components/save-status/save-status.tsx':
            'export const SaveStatus = ({ error }: { error?: string }) => (\n  <div>{error && <p role="alert">{error}</p>}</div>\n);\n',
        },
      },
      {
        condition: 'a status mounts with its message in one branch',
        files: {
          'src/presentation/components/save-status/save-status.tsx':
            'export const SaveStatus = ({ isSaved }: { isSaved: boolean }) => (\n  <div>{isSaved ? <p aria-live="polite">Saved</p> : undefined}</div>\n);\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the live region stays mounted and its message changes',
        files: {
          'src/presentation/components/save-status/save-status.tsx':
            'export const SaveStatus = ({ message }: { message?: string }) => <p role="status">{message}</p>;\n',
        },
      },
      {
        condition: 'both branches render the live region',
        files: {
          'src/presentation/components/save-status/save-status.tsx':
            'export const SaveStatus = ({ isSaved }: { isSaved: boolean }) => (\n  <div>{isSaved ? <p role="status">Saved</p> : <p role="status">Saving</p>}</div>\n);\n',
        },
      },
      {
        condition: 'a region turned off mounts with its text',
        files: {
          'src/presentation/components/save-status/save-status.tsx':
            'export const SaveStatus = ({ note }: { note?: string }) => (\n  <div>{note && <p aria-live="off">{note}</p>}</div>\n);\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'orientations-declared-in-the-manifest',
    unit: {
      axes: [],
      blocks: [
        'client/mobile',
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'the app is locked to portrait',
        files: {
          'app.config.ts': "export default { expo: { name: 'Shop', orientation: 'portrait' } };\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the app takes both orientations',
        files: {
          'app.config.ts': "export default { expo: { name: 'Shop', orientation: 'default' } };\n",
        },
      },
      {
        condition: 'another file names an orientation',
        files: {
          'src/presentation/components/photo/photo.ts':
            "export const layout = { orientation: 'portrait' };\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'cleartext-refused-by-the-network-security-configuration',
    unit: {
      axes: [],
      blocks: [
        'client/mobile/android',
        'transports',
      ],
    },
    reported: [
      {
        condition: 'the build permits cleartext traffic',
        files: {
          'app.config.ts':
            "export default {\n  expo: {\n    plugins: [['expo-build-properties', { android: { usesCleartextTraffic: true } }]],\n  },\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the build refuses cleartext traffic',
        files: {
          'app.config.ts':
            "export default {\n  expo: {\n    plugins: [['expo-build-properties', { android: { usesCleartextTraffic: false } }]],\n  },\n};\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'app-transport-security-never-weakened-by-an-exception',
    unit: {
      axes: [],
      blocks: [
        'client/mobile/ios',
        'transports',
      ],
    },
    reported: [
      {
        condition: 'arbitrary loads are allowed',
        files: {
          'app.config.ts':
            'export default {\n  expo: { ios: { infoPlist: { NSAppTransportSecurity: { NSAllowsArbitraryLoads: true } } } },\n};\n',
        },
      },
      {
        condition: 'a domain allows insecure loads',
        files: {
          'app.config.ts':
            "export default {\n  expo: {\n    ios: {\n      infoPlist: {\n        NSAppTransportSecurity: {\n          NSExceptionDomains: { 'shop.example': { NSExceptionAllowsInsecureHTTPLoads: true } },\n        },\n      },\n    },\n  },\n};\n",
        },
      },
      {
        condition: 'a domain takes an outdated protocol',
        files: {
          'app.config.ts':
            "export default {\n  expo: {\n    ios: {\n      infoPlist: {\n        NSAppTransportSecurity: {\n          NSExceptionDomains: { 'shop.example': { NSExceptionMinimumTLSVersion: 'TLSv1.0' } },\n        },\n      },\n    },\n  },\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the app keeps the defaults',
        files: {
          'app.config.ts':
            'export default { expo: { ios: { infoPlist: { NSAppTransportSecurity: { NSAllowsArbitraryLoads: false } } } } };\n',
        },
      },
      {
        condition: 'a domain takes the current protocol',
        files: {
          'app.config.ts':
            "export default {\n  expo: {\n    ios: {\n      infoPlist: {\n        NSAppTransportSecurity: {\n          NSExceptionDomains: { 'shop.example': { NSExceptionMinimumTLSVersion: 'TLSv1.3' } },\n        },\n      },\n    },\n  },\n};\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'credential-kept-in-a-device-only-keychain-item',
    unit: {
      axes: [],
      blocks: [
        'client/mobile/ios',
      ],
    },
    reported: [
      {
        condition: 'a token is stored in the default class',
        files: {
          'src/infrastructure/secure-store/session.adapter.ts':
            "import * as SecureStore from 'expo-secure-store';\n\nexport const keep = (token: string) => SecureStore.setItemAsync('session', token);\n",
        },
      },
      {
        condition: 'a token is stored in a class that migrates',
        files: {
          'src/infrastructure/secure-store/session.adapter.ts':
            "import * as SecureStore from 'expo-secure-store';\n\nexport const keep = (token: string) =>\n  SecureStore.setItemAsync('session', token, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK });\n",
        },
      },
      {
        condition: 'a password is stored by the keychain library in its default class',
        files: {
          'src/infrastructure/secure-store/session.adapter.ts':
            "import { setGenericPassword } from 'react-native-keychain';\n\nexport const keep = (password: string) => setGenericPassword('shop', password);\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a token is stored in a class that stays on the device',
        files: {
          'src/infrastructure/secure-store/session.adapter.ts':
            "import * as SecureStore from 'expo-secure-store';\n\nexport const keep = (token: string) =>\n  SecureStore.setItemAsync('session', token, {\n    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,\n  });\n",
        },
      },
      {
        condition: 'the keychain library is given a class that stays on the device',
        files: {
          'src/infrastructure/secure-store/session.adapter.ts':
            "import { ACCESSIBLE, setGenericPassword } from 'react-native-keychain';\n\nexport const keep = (password: string) =>\n  setGenericPassword('shop', password, { accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY });\n",
        },
      },
      {
        condition: 'the options are built where they are named',
        files: {
          'src/infrastructure/secure-store/session.adapter.ts':
            "import * as SecureStore from 'expo-secure-store';\n\nimport { deviceOnly } from './device-only';\n\nexport const keep = (token: string) => SecureStore.setItemAsync('session', token, deviceOnly);\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'catalogue-apostrophe-never-escapes-a-parameter',
    unit: {
      axes: [],
      blocks: [
        'localization',
        'lingui',
      ],
    },
    reported: [
      {
        condition: 'a straight apostrophe stands before a parameter of a template',
        files: {
          'src/presentation/screens/order-screen/order-screen.messages.ts':
            "import { msg } from '@lingui/core/macro';\n\nexport const owner = (name: string) => msg`l'${name}`;\n",
        },
      },
      {
        condition: 'a straight apostrophe stands before a parameter of Trans',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            "import { Trans } from '@lingui/react/macro';\n\nexport const Owner = ({ name }: { name: string }) => <Trans>l'{name}</Trans>;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a typographic apostrophe stands before the parameter',
        files: {
          'src/presentation/screens/order-screen/order-screen.messages.ts':
            "import { msg } from '@lingui/core/macro';\n\nexport const owner = (name: string) => msg`l’${name}`;\n",
        },
      },
      {
        condition: 'a straight apostrophe stands inside the text',
        files: {
          'src/presentation/screens/order-screen/order-screen.messages.ts':
            "import { msg } from '@lingui/core/macro';\n\nexport const owner = (name: string) => msg`${name}'s orders`;\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'messages-mark-marks-only-messages-files',
    unit: {
      axes: [],
      blocks: [
        'localization',
        'lingui',
      ],
    },
    reported: [
      {
        condition: 'a messages file declares no message',
        files: {
          'src/presentation/screens/order-screen/order-screen.messages.ts':
            "export const title = 'Orders';\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a messages file declares its messages',
        files: {
          'src/presentation/screens/order-screen/order-screen.messages.ts':
            "import { msg } from '@lingui/core/macro';\n\nexport const title = msg`Orders`;\n",
        },
      },
      {
        condition: 'another file declares no message',
        files: {
          'src/presentation/screens/order-screen/order-screen.constants.ts':
            'export const PAGE_SIZE = 20;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'lingui-placeholder-named-by-its-variable',
    unit: {
      axes: [],
      blocks: [
        'localization',
        'lingui',
      ],
    },
    reported: [
      {
        condition: 'a template interpolates a member',
        files: {
          'src/presentation/screens/order-screen/order-screen.messages.ts':
            "import { msg } from '@lingui/core/macro';\n\nexport const greeting = (user: { name: string }) => msg`Hello ${user.name}`;\n",
        },
      },
      {
        condition: 'Trans interpolates a call',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            "import { Trans } from '@lingui/react/macro';\n\nexport const Total = ({ total }: { total: () => string }) => <Trans>Total {total()}</Trans>;\n",
        },
      },
      {
        condition: 'a plural counts a member',
        files: {
          'src/presentation/screens/order-screen/order-screen.messages.ts':
            "import { plural } from '@lingui/core/macro';\n\nexport const count = (items: readonly string[]) => plural(items.length, { one: '# item', other: '# items' });\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a template interpolates a variable',
        files: {
          'src/presentation/screens/order-screen/order-screen.messages.ts':
            "import { msg } from '@lingui/core/macro';\n\nexport const greeting = (name: string) => msg`Hello ${name}`;\n",
        },
      },
      {
        condition: 'a value is labelled by ph',
        files: {
          'src/presentation/screens/order-screen/order-screen.messages.ts':
            "import { msg, ph } from '@lingui/core/macro';\n\nexport const greeting = (user: { name: string }) => msg`Hello ${ph({ name: user.name })}`;\n",
        },
      },
      {
        condition: 'Trans holds a variable inside an element',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            "import { Trans } from '@lingui/react/macro';\n\nexport const Greeting = ({ name }: { name: string }) => (\n  <Trans>\n    Hello <b>{name}</b>\n  </Trans>\n);\n",
        },
      },
      {
        condition: "an element's attribute inside Trans reads a member",
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            "import { Trans } from '@lingui/react/macro';\n\nexport const Help = ({ links }: { links: { help: string } }) => (\n  <Trans>\n    Read <a href={links.help}>the help</a>\n  </Trans>\n);\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'components-take-t-from-use-lingui',
    unit: {
      axes: [],
      blocks: [
        'localization',
        'lingui',
        'react',
        'react/react-dom',
      ],
    },
    reported: [
      {
        condition: 'a component renders through the global t',
        files: {
          'src/presentation/components/order-title/order-title.tsx':
            "import { t } from '@lingui/core/macro';\n\nexport const OrderTitle = () => <h1>{t`Orders`}</h1>;\n",
        },
      },
      {
        condition:
          'a component renders through the global t beside one that takes it from useLingui',
        files: {
          'src/presentation/components/order-title/order-title.tsx':
            "import { useLingui } from '@lingui/react/macro';\nimport { t } from '@lingui/core/macro';\n\nexport const OrderTitle = () => {\n  const { t: own } = useLingui();\n\n  return <h1>{own`Orders`}</h1>;\n};\n\nexport const OrderNote = () => <p>{t`Note`}</p>;\n",
        },
      },
      {
        condition: 'a hook renders through the global i18n',
        files: {
          'src/presentation/components/order-title/order-title.hooks.ts':
            "import { i18n } from '@lingui/core';\n\nimport { title } from './order-title.messages';\n\nexport const useTitle = () => i18n._(title);\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a component takes t from useLingui',
        files: {
          'src/presentation/components/order-title/order-title.tsx':
            "import { useLingui } from '@lingui/react/macro';\n\nexport const OrderTitle = () => {\n  const { t } = useLingui();\n\n  return <h1>{t`Orders`}</h1>;\n};\n",
        },
      },
      {
        condition: 'the root hands the global i18n to its provider',
        files: {
          'src/root/app.tsx':
            "import { i18n } from '@lingui/core';\nimport { I18nProvider } from '@lingui/react';\n\nexport const App = () => <I18nProvider i18n={i18n} />;\n",
        },
      },
      {
        condition: "a route's head reads the global t",
        files: {
          'src/routes/orders.tsx':
            "import { t } from '@lingui/core/macro';\n\nexport const head = () => ({ meta: [{ title: t`Orders` }] });\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'macros-expanded-by-the-lingui-plugin',
    unit: {
      axes: [],
      blocks: [
        'vite',
        'lingui',
        'localization',
      ],
    },
    reported: [
      {
        condition: "Babel's options of the React plugin expand the macros",
        files: {
          'vite.config.ts':
            "import { lingui } from '@lingui/vite-plugin';\nimport react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({\n  plugins: [\n    react({ babel: { plugins: ['@lingui/babel-plugin-lingui-macro'] } }),\n    lingui({ macroTransform: true }),\n  ],\n});\n",
        },
      },
      {
        condition: "Lingui's plugin leaves the macros to another",
        files: {
          'vite.config.ts':
            "import { lingui } from '@lingui/vite-plugin';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({ plugins: [lingui()] });\n",
        },
      },
    ],
    allowed: [
      {
        condition: "Lingui's plugin expands the macros",
        files: {
          'vite.config.ts':
            "import { lingui } from '@lingui/vite-plugin';\nimport react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({ plugins: [react(), lingui({ macroTransform: true })] });\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'field-never-blocks-paste-or-autofill',
    unit: {
      axes: [],
      blocks: [
        'presentation',
      ],
    },
    reported: [
      {
        condition: 'a field turns autofill off',
        files: {
          'src/presentation/components/sign-in-form/sign-in-form.tsx':
            'export const SignInForm = () => <input autoComplete="off" name="password" type="password" />;\n',
        },
      },
      {
        condition: 'a field prevents pasting',
        files: {
          'src/presentation/components/sign-in-form/sign-in-form.tsx':
            'export const SignInForm = () => (\n  <input\n    autoComplete="current-password"\n    name="password"\n    onPaste={(event) => event.preventDefault()}\n    type="password"\n  />\n);\n',
        },
      },
      {
        condition: 'a listener prevents pasting',
        files: {
          'src/infrastructure/browser/paste.ts':
            "export const blockPaste = (field: HTMLInputElement) => {\n  field.addEventListener('paste', (event) => {\n    event.preventDefault();\n  });\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a field declares its purpose',
        files: {
          'src/presentation/components/sign-in-form/sign-in-form.tsx':
            'export const SignInForm = () => <input autoComplete="current-password" name="password" type="password" />;\n',
        },
      },
      {
        condition: 'a field reads what is pasted',
        files: {
          'src/presentation/components/sign-in-form/sign-in-form.tsx':
            'export const SignInForm = ({ onCode }: { onCode: (code: string) => void }) => (\n  <input\n    autoComplete="one-time-code"\n    name="code"\n    onPaste={(event) => onCode(event.clipboardData.getData(\'text\'))}\n  />\n);\n',
        },
      },
    ],
  },
  {
    language: 'html',
    slug: 'field-never-blocks-paste-or-autofill',
    unit: {
      axes: [],
      blocks: [
        'presentation',
        'html',
      ],
    },
    reported: [
      {
        condition: 'a field turns autofill off',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <input name="password" type="password" autocomplete="off">\n  </body>\n</html>\n',
        },
      },
      {
        condition: 'a field refuses pasting',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <input name="password" type="password" onpaste="return false">\n  </body>\n</html>\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a field declares its purpose',
        files: {
          'public/index.html':
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Orders</title>\n  </head>\n  <body>\n    <input name="password" type="password" autocomplete="current-password">\n  </body>\n</html>\n',
        },
      },
    ],
  },
  {
    language: 'json',
    slug: 'line-height-a-unitless-multiple',
    unit: {
      axes: [],
      blocks: [
        'presentation',
        'presentation/design-system',
        'json',
      ],
    },
    reported: [
      {
        condition: 'a leading token holds pixels',
        files: {
          'src/design/app.tokens.json':
            '{\n  "font": {\n    "leading": {\n      "body": { "$type": "dimension", "$value": "24px" }\n    }\n  }\n}\n',
        },
      },
      {
        condition: "a leading token holds a dimension's object",
        files: {
          'src/design/app.tokens.json':
            '{\n  "font": {\n    "leading": {\n      "body": { "$type": "dimension", "$value": { "value": 1.5, "unit": "rem" } }\n    }\n  }\n}\n',
        },
      },
      {
        condition: "a typography's line height holds rem",
        files: {
          'src/design/app.tokens.json':
            '{\n  "font": {\n    "body": {\n      "md": {\n        "$type": "typography",\n        "$value": { "fontSize": "1rem", "lineHeight": "1.5rem" }\n      }\n    }\n  }\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a leading token holds a unitless number',
        files: {
          'src/design/app.tokens.json':
            '{\n  "font": {\n    "leading": {\n      "body": { "$type": "number", "$value": 1.5 }\n    }\n  }\n}\n',
        },
      },
      {
        condition: "a typography's line height refers to a leading token",
        files: {
          'src/design/app.tokens.json':
            '{\n  "font": {\n    "body": {\n      "md": {\n        "$type": "typography",\n        "$value": { "fontSize": "1rem", "lineHeight": "{font.leading.body}" }\n      }\n    }\n  }\n}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'ink-animation-interval-from-a-motion-token',
    unit: {
      axes: [],
      blocks: [
        'react',
        'react/ink',
        'client/cli',
        'presentation',
        'presentation/design-system',
      ],
    },
    reported: [
      {
        condition: 'the interval is a number',
        files: {
          'src/presentation/components/spinner/spinner.tsx':
            "import { useAnimation } from 'ink';\n\nexport const Spinner = () => {\n  const { frame } = useAnimation({ interval: 80 });\n\n  return frame;\n};\n",
        },
      },
      {
        condition: 'the interval is a sum of numbers',
        files: {
          'src/presentation/components/spinner/spinner.tsx':
            "import { useAnimation } from 'ink';\n\nexport const Spinner = () => {\n  const { frame } = useAnimation({ interval: 1000 / 12 });\n\n  return frame;\n};\n",
        },
      },
    ],
    allowed: [
      {
        condition: "the interval is read from the theme's motion token",
        files: {
          'src/presentation/components/spinner/spinner.tsx':
            "import { useAnimation } from 'ink';\n\nimport { useTheme } from '../theme';\n\nexport const Spinner = () => {\n  const theme = useTheme();\n  const { frame } = useAnimation({ interval: theme.motion.spin.standard });\n\n  return frame;\n};\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'router-claims-the-head',
    unit: {
      axes: [],
      blocks: [
        'tanstack-router',
        'react/react-dom',
        'client/browser',
        'html',
      ],
    },
    reported: [
      {
        condition: 'a component renders the title',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            'export const OrderScreen = () => (\n  <main>\n    <title>Orders</title>\n  </main>\n);\n',
        },
      },
      {
        condition: 'a component renders a meta',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            'export const OrderScreen = () => <meta content="Orders" name="description" />;\n',
        },
      },
    ],
    allowed: [
      {
        condition: "an icon's title names the icon",
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            'export const CartIcon = () => (\n  <svg role="img">\n    <title>Cart</title>\n  </svg>\n);\n',
        },
      },
      {
        condition: "the route's head gives the title",
        files: {
          'src/routes/orders.tsx': "export const head = () => ({ meta: [{ title: 'Orders' }] });\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'adapter-is-a-factory-or-module-object',
    unit: {
      blocks: [
        'react',
      ],
    },
    reported: [
      {
        condition: 'the adapter is a class',
        files: {
          'src/features/orders/infrastructure/http/orders.adapter.ts':
            "export class HttpOrdersAdapter {\n  load(): Promise<Response> {\n    return fetch('/orders');\n  }\n}\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'the adapter is built by a factory',
        files: {
          'src/features/orders/infrastructure/http/orders.adapter.ts':
            'export const createHttpOrdersAdapter = (base: string) => ({\n  load: () => fetch(`${base}/orders`),\n});\n',
        },
      },
      {
        condition: 'the adapter file holds the error it raises',
        files: {
          'src/features/orders/infrastructure/http/orders.adapter.ts':
            "export class OrdersUnavailableError extends Error {}\n\nexport const ordersAdapter = { load: () => fetch('/orders') };\n",
        },
      },
      {
        condition: 'a class sits in a file of another role',
        files: {
          'src/features/orders/infrastructure/http/orders.client.ts':
            'export class OrdersClient {}\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'third-party-script-rendered-by-its-component',
    unit: {
      blocks: [
        'react',
        'react/react-dom',
        'client/browser',
        'html',
      ],
    },
    reported: [
      {
        condition: 'a component builds a script element',
        files: {
          'src/presentation/widgets/chat-widget/chat-widget.tsx':
            "import { useEffect } from 'react';\n\nexport const ChatWidget = () => {\n  useEffect(() => {\n    const script = document.createElement('script');\n\n    script.src = 'https://chat.example.com/widget.js';\n    document.body.append(script);\n  }, []);\n\n  return <div />;\n};\n",
        },
      },
      {
        condition: 'a component renders a script of another origin without async',
        files: {
          'src/presentation/widgets/chat-widget/chat-widget.tsx':
            'export const ChatWidget = () => <script src="https://chat.example.com/widget.js" />;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a component renders the script with async',
        files: {
          'src/presentation/widgets/chat-widget/chat-widget.tsx':
            'export const ChatWidget = () => <script async src="https://chat.example.com/widget.js" />;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'expo-routes-folder-belongs-to-the-root',
    unit: {
      blocks: [
        'react',
        'react/react-native',
        'react/react-native/expo',
        'client/mobile',
      ],
    },
    reported: [
      {
        condition: 'a route sits in a routes folder beside the source',
        files: {
          'app/index.tsx':
            "export { HomeScreen as default } from '../src/presentation/screens/home-screen';\n",
        },
      },
    ],
    allowed: [
      {
        condition: "a route sits in the source's routes folder",
        files: {
          'src/app/index.tsx':
            "export { HomeScreen as default } from '../presentation/screens/home-screen';\n",
        },
      },
      {
        condition: 'a folder named app sits deep in the source',
        files: {
          'src/features/app/index.ts': "export const NAME = 'app';\n",
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'primitive-class-merged-by-cn',
    unit: {
      axes: [],
      blocks: [
        'tailwind',
        'presentation',
        'client/browser',
        'css',
        'react',
        'react/react-dom',
        'html',
      ],
    },
    reported: [
      {
        condition: "the caller's class replaces the primitive's",
        files: {
          'src/libs/ui/components/button/button.tsx':
            "import type { ComponentProps } from 'react';\n\nexport const Button = ({ className, ...props }: ComponentProps<'button'>) => (\n  <button className={className} {...props} />\n);\n",
        },
      },
      {
        condition: "the caller's class comes first",
        files: {
          'src/libs/ui/components/button/button.tsx':
            "import type { ComponentProps } from 'react';\n\nimport { cn } from '../../cn';\n\nexport const Button = ({ className, ...props }: ComponentProps<'button'>) => (\n  <button className={cn(className, 'px-4')} {...props} />\n);\n",
        },
      },
    ],
    allowed: [
      {
        condition: "the caller's class is merged last",
        files: {
          'src/libs/ui/components/button/button.tsx':
            "import type { ComponentProps } from 'react';\n\nimport { cn } from '../../cn';\n\nexport const Button = ({ className, ...props }: ComponentProps<'button'>) => (\n  <button className={cn('px-4', className)} {...props} />\n);\n",
        },
      },
      {
        condition: "a component outside the primitives passes the caller's class",
        files: {
          'src/presentation/components/card/card.tsx':
            'export const Card = ({ className }: { className?: string }) => <div className={className} />;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'shadcn-text-passed-by-props',
    unit: {
      axes: [],
      blocks: [
        'shadcn',
        'tailwind',
        'presentation',
        'client/browser',
        'css',
        'react',
        'react/react-dom',
        'html',
      ],
    },
    reported: [
      {
        condition: 'the primitive keeps the text shadcn ships',
        files: {
          'src/libs/ui/components/dialog/dialog.tsx':
            'export const DialogClose = () => (\n  <button type="button">\n    <span className="sr-only">Close</span>\n  </button>\n);\n',
        },
      },
      {
        condition: 'the primitive names its control by a literal',
        files: {
          'src/libs/ui/components/dialog/dialog.tsx':
            'export const DialogClose = () => <button aria-label="Close" type="button" />;\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the primitive takes its text by a prop',
        files: {
          'src/libs/ui/components/dialog/dialog.tsx':
            'export const DialogClose = ({ label }: { label: string }) => (\n  <button type="button">\n    <span className="sr-only">{label}</span>\n  </button>\n);\n',
        },
      },
      {
        condition: 'the primitive shows a glyph with no letter',
        files: {
          'src/libs/ui/components/breadcrumb/breadcrumb.tsx':
            'export const BreadcrumbSeparator = () => <span aria-hidden="true">/</span>;\n',
        },
      },
      {
        condition: 'a screen piece holds its own text',
        files: {
          'src/presentation/components/empty-cart/empty-cart.tsx':
            'export const EmptyCart = () => <p>Your cart is empty</p>;\n',
        },
      },
    ],
  },
  {
    language: 'typescript',
    slug: 'address-write-keeps-the-other-parameters',
    unit: {
      axes: [],
      blocks: [
        'presentation',
        'tanstack-router',
        'react/react-dom',
        'client/browser',
        'html',
      ],
    },
    reported: [
      {
        condition: 'a navigation replaces the search with an object',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            "import { useNavigate } from '@tanstack/react-router';\n\nexport const useNextPage = () => {\n  const navigate = useNavigate();\n\n  return () => navigate({ search: { page: 2 } });\n};\n",
        },
      },
      {
        condition: 'a link to the same screen replaces the search',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            "import { Link } from '@tanstack/react-router';\n\nexport const NextPage = () => <Link search={{ page: 2 }}>Next</Link>;\n",
        },
      },
    ],
    allowed: [
      {
        condition: 'a navigation writes the search from the previous one',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            "import { useNavigate } from '@tanstack/react-router';\n\nexport const useNextPage = () => {\n  const navigate = useNavigate();\n\n  return () => navigate({ search: (previous) => ({ ...previous, page: 2 }) });\n};\n",
        },
      },
      {
        condition: 'a link opens another screen with its parameters',
        files: {
          'src/presentation/screens/order-screen/order-screen.tsx':
            'import { Link } from \'@tanstack/react-router\';\n\nexport const OrdersLink = () => (\n  <Link search={{ page: 1 }} to="/orders">\n    Orders\n  </Link>\n);\n',
        },
      },
    ],
  },
];

export { interfacePluginRows };

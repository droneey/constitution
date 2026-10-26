# Design tokens

The tokens every Droneey interface is drawn with, in the [W3C Design Tokens format](https://www.designtokens.org/tr/drafts/format/) 2025.10, and the runner that builds each platform's theme from them.

| File | Holds |
|---|---|
| `tokens/color.tokens.json` | every scale written by hand in OKLCH with an sRGB `hex`, the overlays laid over a surface at a share of opacity, and `brand`, the accent's scale, violet-fuchsia by default |
| `tokens/size.tokens.json` | the dimensions on the 8-pixel grid, the spacings, sizes, radii, type scale and leading, and the focus ring's width and offset, a line off the grid |
| `tokens/motion.tokens.json` | the durations and easings, and the scales a surface enters from and a pressed control shrinks to |
| `tokens/shadow.tokens.json` | the shadows that lift a surface off the page |
| `tokens/layer.tokens.json` | the stacking order: a surface below its siblings, raised over the page, and over every raised one |
| `tokens/theme/light.tokens.json`, `tokens/theme/dark.tokens.json` | the same roles naming other steps in each mode, the focus ring's colour among them |
| `tokens/design.resolver.json` | the resolver of the 2025.10 Resolver module: the sets every mode takes, and the `theme` modifier whose contexts are the two mode files |

A tool that reads resolvers takes `design.resolver.json`; one that does not, such as Figma's import or Tokens Studio's sets, takes the files of the mode it shows. A platform's package reads them only through this package's runner, which reads the resolver.

The specs in `tests/proofs` prove the default theme: every pair of roles it declares reaches its contrast in both modes, the focus ring against the surfaces it is drawn on among them, and every size sits on the grid.

## The build

A platform's package imports no code of this one. It keeps its Style Dictionary configuration and its own formats in a module whose default export is a function: given a mode of the resolver's `theme` modifier, `{ name, isDefault }`, it returns the configuration of that mode — its platforms with their transforms, formats and `buildPath`, the hooks that register its own, and its log — and names no tokens. The platform runs it through this package's command from its own folder: `design-tokens generate <config>` generates each mode with the configuration `<config>` exports, one after the other, and writes their files. It writes a file only when its content differs, under a fresh name beside it then renamed over it, so several builds at once — the hooks of two scripts run side by side — never leave one half written, and a build that changes nothing touches no file.

For each mode the runner reads `design.resolver.json` and gives the configuration the files of every set as its `include` and the files of the mode's own context as its `source`, in place of any the platform names. It exits with 0 when sound, and with 1 when the module lies outside the working folder or exports no function, or the build fails. A platform names it `build`, and the files it writes are ignored by git, not committed.

## The accent

An app changes one thing: the accent's scale, `color.brand`, eleven steps from 50 to 950. It writes its own scale in a `brand.tokens.json`, the same paths as the default's, and hands it to its platform's `ThemeProvider`. The roles of the accent — `color.accent.solid`, `hover`, `pressed`, `subtle`, `text`, `muted`, `end` and `on-solid` — read the same steps of whichever scale is there; an app's own scale is calibrated by its author, and nothing checks it.

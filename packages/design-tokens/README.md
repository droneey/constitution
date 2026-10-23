# Design tokens

The tokens every droneey interface is drawn with, in the [W3C Design Tokens format](https://www.designtokens.org/tr/drafts/format/) 2025.10, and nothing else: no code ships from this package.

| File | Holds |
|---|---|
| `tokens/color.tokens.json` | every scale written by hand in OKLCH with an sRGB `hex`, the overlays laid over a surface at a share of opacity, and `brand`, the accent's scale, violet-fuchsia by default |
| `tokens/size.tokens.json` | the dimensions on the 8-pixel grid, the spacings, sizes, radii, type scale and leading, and the focus ring's width and offset, a line off the grid |
| `tokens/motion.tokens.json` | the durations and easings, and the scales a surface enters from and a pressed control shrinks to |
| `tokens/shadow.tokens.json` | the shadows that lift a surface off the page |
| `tokens/layer.tokens.json` | the stacking order: a surface below its siblings, raised over the page, and over every raised one |
| `tokens/theme/light.tokens.json`, `tokens/theme/dark.tokens.json` | the same roles naming other steps in each mode, the focus ring's colour among them |
| `tokens/design.resolver.json` | the resolver of the 2025.10 Resolver module: the sets every mode takes, and the `theme` modifier whose contexts are the two mode files |

A tool that reads resolvers takes `design.resolver.json`; one that does not, such as Figma's import or Tokens Studio's sets, takes the files of the mode it shows. Each platform's package reads them at build time as `@droneey/design-tokens/tokens/<file>`.

The specs in `tests/proofs` prove the default theme: every pair of roles it declares reaches its contrast in both modes, the focus ring against the surfaces it is drawn on among them, and every size sits on the grid.

## The accent

An app changes one thing: the accent's scale, `color.brand`, eleven steps from 50 to 950. It writes its own scale in a `brand.tokens.json`, the same paths as the default's, and hands it to its platform's `ThemeProvider`. The roles of the accent — `color.accent.solid`, `hover`, `pressed`, `subtle`, `text`, `muted`, `end` and `on-solid` — read the same steps of whichever scale is there; an app's own scale is calibrated by its author, and nothing checks it.

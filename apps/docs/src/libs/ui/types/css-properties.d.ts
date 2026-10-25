import 'react';

declare module 'react' {
  interface CSSProperties {
    [property: `--${string}`]: number | string;
  }
}

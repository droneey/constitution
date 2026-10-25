import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

// A failed match prints its values, and Bun prints a DOM node by walking its whole document and window,
// which outgrows the memory long before the test's timeout: a node prints as its tag instead.
Object.defineProperty(Node.prototype, Bun.inspect.custom, {
  value(this: Node): string {
    return `<${this.nodeName.toLowerCase()}>`;
  },
});

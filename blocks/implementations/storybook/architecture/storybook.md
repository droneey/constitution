# Storybook

## stories-unreachable-from-production · MUST
Production code never imports a story, and stories are outside coverage.
**Why:** a story in production ships fixtures and fakes to users.
**Check:** tool — architecture
**Tags:** architecture, testing
**Implements:** `test-code-unreachable-from-production`

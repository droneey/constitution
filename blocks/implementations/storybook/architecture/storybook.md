# Storybook

## stories-unreachable-from-production · MUST
Production code never imports a story.
**Why:** a story in production ships fixtures and fakes to users.
**Check:** tool — architecture
**Tags:** testing
**Implements:** `test-code-unreachable-from-production`

# 🤘 Welcome to Stagehand Tests for Buildappswith

This directory contains automated tests for the Buildappswith platform using [Stagehand](https://github.com/browserbase/stagehand), which is an SDK for automating browsers built on top of [Playwright](https://playwright.dev/).

## Getting Started

To run the Stagehand tests:

```bash
cd tests/stagehand-tests
npm install && npm start
```

## Setting Up Environment Variables

Required API keys/environment variables are in the `.env.example` file. Copy it to `.env` and add your API keys.

```bash
cp .env.example .env
# Edit .env to add your API keys
```

## Browser Options

### Run on Browserbase (Cloud)

To run on Browserbase, add your API keys to .env and change `env: "LOCAL"` to `env: "BROWSERBASE"` in [stagehand.config.ts](stagehand.config.ts).

### Run Locally

By default, the tests will run in a local browser. Make sure you have Playwright's browsers installed:

```bash
npx playwright install
```

## LLM Model Options

### Using OpenAI GPT-4o

By default, the tests are configured to use GPT-4o. Ensure your OpenAI API key is in the `.env` file.

### Using Anthropic Claude

To switch to Anthropic Claude:

1. Add your Anthropic API key to `.env`
2. Change `modelName: "gpt-4o"` to `modelName: "claude-3-7-sonnet-20250219"` in [stagehand.config.ts](stagehand.config.ts)
3. Change the model client options in [stagehand.config.ts](stagehand.config.ts) to use the Anthropic API key

## Adding New Tests

To add new tests, edit the `main` function in [index.ts](index.ts) to include your test logic.

## Documentation

For more information about using Stagehand, check out:
- [Stagehand Documentation](https://docs.stagehand.dev/)
- [Browserbase Documentation](https://docs.browserbase.com/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
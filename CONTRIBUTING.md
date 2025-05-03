# Contributing to Guardrails.js

Thank you for your interest in contributing to Guardrails.js! We welcome all contributions � bug reports, feature requests, documentation improvements, and pull requests.

---

## Reporting Issues

- First, check if the issue already exists in [GitHub Issues](https://github.com/giggame/guardrails/issues)
- If not, create a new issue with a clear description
- Include a minimal reproduction (code snippet, JSFiddle, etc.)

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- Grunt CLI: `npm install -g grunt-cli`

### Setup

```bash
git clone https://github.com/giggame/guardrails.git
cd guardrails
npm install
```

### Build

```bash
grunt           # builds dist/guardrails.js
```

### Test

```bash
npm test        # runs all tests
grunt dev       # launches local test runner
```

---

## Pull Request Guidelines

- Fork the repo and create a new branch
- Follow the code style used throughout the codebase
- Limit pull requests to a single purpose
- Add tests for new behavior when possible
- Run `npm run lint` and `npm test` before submitting

All contributions should pass CI and maintain code clarity.

---

## Running Mustache Specs (optional)

```bash
cd spec
rm -rf mustache
git clone https://github.com/mustache/spec.git mustache
cd ..
npm test
```

---

## Linting & Formatting

- Lint: `npm run lint`
- Format: `npm run format`

Use Prettier and ESLint to maintain consistency.

---

## Releasing (for maintainers)

```bash
npm ci
npx grunt
npm publish
```

Optional (RubyGems):

```bash
cd dist/components
gem build guardrails-source.gemspec
gem push guardrails-source-*.gem
```

---

## Questions?

Contact the maintainer: [support@gig.game](mailto:support@gig.game)

We appreciate your contributions to Guardrails!

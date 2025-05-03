# Guardrails.js

Guardrails.js is a lightweight, dynamic, logic-enabled templating system for JavaScript — originally forked from [Handlebars.js](https://handlebarsjs.com), extended to support data binding and interactivity for modern UI use cases.

> Created and maintained by Jason Bramble of Gig Game

## ✨ Key Features

* Lightweight and dependency-free
* Based on Handlebars.js (MIT Licensed)
* Adds `BoundView` for live data binding, input syncing, and event-driven UIs
* Supports all original Handlebars helpers plus:

  * `{{{bind "prop"}}}` for two-way input binding
  * `{{{click "methodName"}}}` for declarative event handlers
* Simple, framework-free interactivity without needing React, Vue, etc.
* Allows two-way binding of a model to a template rendered into a target div
* Supports multiple independent models/views on a single page

## 📦 Installation

```bash
npm install guardrails
```

Or clone the repo:

```bash
git clone https://github.com/giggame/guardrails.git
cd guardrails
npm install
```

## 🚀 Quick Start

```html
<!-- Include the compiled guardrails.js -->
<script src="dist/guardrails.js"></script>
<script id="template-demo" type="text/x-handlebars-template">
  <h1>Hello, {{name}}!</h1>
  <input type="text" {{{bind 'base.name'}}} />
  <button {{{click 'resetName' false}}}>Reset</button>
</script>

<div id="app"></div>

<script>
  class DemoView extends Guardrails.BoundView {
    constructor() {
      super("#app", "#template-demo");
      this.name = "World";
      this.render();
    }

    resetName() {
      this.name = "World";
    }
  }

  document.addEventListener("DOMContentLoaded", () => new DemoView());
</script>
```

## 🧰 Build & Test

```bash
npm install
grunt          # build
npm test       # run tests
grunt dev      # dev mode with local test server
```

## 📚 Documentation

### BoundView

`BoundView` is a core extension in Guardrails that provides live two-way data binding between JavaScript models and DOM templates rendered with Handlebars-compatible syntax.

Each instance of `BoundView`:

* Takes a `target` DOM selector (e.g., `#app`)
* Accepts either an in-DOM template (e.g., `#template-id`) or a remote HTML file
* Registers one or more helper functions (`{{eq}}`, `{{click}}`, `{{bind}}`, etc.) for use in the template
* Automatically binds and syncs input fields with data using the `{{{bind}}}` helper
* Enables method invocation via `{{{click}}}` with optional automatic re-rendering

### Helper Functions

Guardrails registers the following helpers for use in templates:

* `{{eq a b}}` – true if `a === b`

* `{{neq a b}}` – true if `a !== b`

* `{{gt a b}}` – true if `a > b`

* `{{lt a b}}` – true if `a < b`

* `{{or a b c}}` – true if any argument is truthy

* `{{and a b c}}` – true if all arguments are truthy

* `{{null value}}` – true if value is null or undefined

* `{{nullOrEmpty value}}` – true if value is null, undefined, empty string, or empty array

* `{{add a b}}` – adds two numbers

* `{{subtract a b}}` – subtracts second number from first

* `{{call 'methodName'}}` – calls a view method and renders its return

* `{{{click 'methodName' redrawFlag}}}` – binds a click event to a method (with optional auto-redraw)

* `{{{bind 'propertyName'}}}` – two-way binds an input/select/textarea to a property

* `{{{bind 'base.name'}}}`: binds an input’s value to `this.name`

* `{{{click 'methodName' false}}}`: binds a click event to a method on your view instance

* `{{eq val1 val2}}`, `{{or a b}}`, `{{add x y}}`: simple logic helpers

### Multiple Views

You can instantiate multiple `BoundView` subclasses on the same page, each scoped to their own DOM target and data model:

```js
new MyViewOne("#view-one", "#template-one");
new MyViewTwo("#view-two", "#template-two");
```

Each will track and render its own state independently.

---

Check the `BoundView` source for inline documentation. More examples will be added soon. Contributions welcome!

## 📬 Contact

For questions, feedback, or support, email us at [support@gig.game](mailto:support@gig.game)

## 🤝 Contributing

We welcome contributions. We welcome contributions! To get started, fork the repo and check out the following:

* Submit issues or feature requests via [GitHub Issues](https://github.com/giggame/guardrails/issues)
* Open pull requests with clear commit history
* Follow the project’s code style and include tests when applicable

See the [contributing guidelines](./docs/CONTRIBUTING.md) for detailed steps on setup, testing, and release flow.

You can find full contribution instructions in [CONTRIBUTING.md](CONTRIBUTING.md).


## 🛡 License

Guardrails is open source and MIT licensed.

```
Copyright (C) 2011–2019 Yehuda Katz
Copyright (C) 2024 Jason Bramble, Gig Game
```

See the full [LICENSE](LICENSE) file for details.

---

Originally based on [Handlebars.js](https://github.com/handlebars-lang/handlebars.js), with gratitude to the open source community.







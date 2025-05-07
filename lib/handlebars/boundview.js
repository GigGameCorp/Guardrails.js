/* eslint no-console: "off" */
/* global Guardrails module */
let GuardrailsRegistered = false;
export default class BoundView {
  constructor(target = '#app', template = null) {
    this.target = target;
    this.templatePath = template ? template : this.constructor.name + '.html';
    this.template = null; // Placeholder for the compiled template
    this.translateHandle = null;
    this.register();
  }

  register() {
    this.bindHandles = [];
    this.onclickHandles = [];
    this.onchangeHandles = [];
    this.localizationId = 0;
    this.deferredRenderHandle = null;

    if (!this.valid()) return;

    if (!GuardrailsRegistered) {
      GuardrailsRegistered = true;

      if (typeof Guardrails === 'undefined') {
        console.error(
          'Guardrails.js is not installed. Please make sure to include it in your project.'
        );
        return;
      }
      Guardrails.registerHelper('eq', function (arg1, arg2) {
        return arg1 === arg2;
      });

      Guardrails.registerHelper('neq', function (arg1, arg2) {
        return arg1 !== arg2;
      });

      Guardrails.registerHelper('gt', function (arg1, arg2) {
        return arg1 > arg2;
      });

      Guardrails.registerHelper('lt', function (arg1, arg2) {
        return arg1 < arg2;
      });

      Guardrails.registerHelper('click', function (fn, p1, p2) {
        const controller = p2 == undefined ? p1.data.root : p2.data.root;
        const redraw = p2 == undefined ? true : p1;
        if (typeof controller[fn] === 'function') {
          controller.onclickHandles.push({
            fn: controller[fn].bind(controller),
            redraw: redraw,
            controller: controller,
            data: this,
          });

          let index = controller.onclickHandles.length - 1;
          return `data-onclickhandler='${index}'`;
        } else {
          console.error(`Error: Method ${fn} does not exist on the class.`);
          return '';
        }
      });

      Guardrails.registerHelper('change', function (fn, p1, p2) {
        const controller = p2 == undefined ? p1.data.root : p2.data.root;
        const redraw = p2 == undefined ? true : p1;
        if (typeof controller[fn] === 'function') {
          controller.onchangeHandles = controller.onchangeHandles || [];
          controller.onchangeHandles.push({
            fn: controller[fn].bind(controller),
            redraw: redraw,
            controller: controller,
            data: this,
          });

          let index = controller.onchangeHandles.length - 1;
          return `data-onchangehandler='${index}'`;
        } else {
          console.error(`Error: Method ${fn} does not exist on the class.`);
          return '';
        }
      });

      Guardrails.registerHelper('bind', function (prop, p1, p2) {
        if (p1 == undefined) {
          console.error('Web bind property not specified.');
          return;
        }

        const controller = p2 == undefined ? p1.data.root : p2.data.root;
        const redraw = p2 == undefined ? true : p1;

        controller.bindHandles.push({
          prop: prop,
          data: controller,
          redraw: redraw,
        });
        let index = controller.bindHandles.length - 1;
        return `data-bind='${index}'`;
      });

      Guardrails.registerHelper('call', function (fn, p1) {
        if (p1 == undefined) {
          console.error('Web call function not specified.');
          return;
        }

        const controller = p1.data.root;

        if (typeof controller[fn] === 'function') {
          let funct = controller[fn].bind(controller);
          return funct(this);
        } else {
          console.error(`Error: Method ${fn} does not exist on the class.`);
          return '';
        }
      });

      Guardrails.registerHelper('nullOrEmpty', function (value) {
        return (
          value === null ||
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)
        );
      });

      Guardrails.registerHelper('null', function (value) {
        return value === null || value === undefined;
      });

      Guardrails.registerHelper('or', function () {
        let args = Array.prototype.slice.call(arguments);

        for (let i = 0; i < args.length - 1; i++) {
          if (args[i]) {
            return true;
          }
        }

        return false;
      });

      Guardrails.registerHelper('and', function () {
        let args = Array.prototype.slice.call(arguments);

        for (let i = 0; i < args.length - 1; i++) {
          if (!args[i]) {
            return false;
          }
        }

        return true;
      });

      Guardrails.registerHelper('add', function (num1, num2) {
        // Check if both parameters are numbers
        if (typeof num1 === 'number' && typeof num2 === 'number') {
          // Perform addition
          return num1 + num2;
        } else {
          // If one or both parameters are not numbers, return an error message
          return 'Error: Both parameters must be numbers';
        }
      });

      Guardrails.registerHelper('subtract', function (num1, num2) {
        // Check if both parameters are numbers
        if (typeof num1 === 'number' && typeof num2 === 'number') {
          // Perform subtraction
          return num1 - num2;
        } else {
          // If one or both parameters are not numbers, return an error message
          return 'Error: Both parameters must be numbers';
        }
      });
    }
  }

  loadTemplate(callback) {
    if (this.template) {
      callback();
      return;
    }

    if (this.templatePath.startsWith('#')) {
      const templateElement = document.querySelector(this.templatePath);
      if (!templateElement) {
        console.error(
          `Template element "${this.templatePath}" not found in DOM.`
        );
        return;
      }
      this.template = Guardrails.compile(templateElement.innerHTML);
      callback();
    } else {
      fetch(this.templatePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then((templateHtml) => {
          this.template = Guardrails.compile(templateHtml);
          callback();
        })
        .catch((error) => {
          console.error(
            'Error: Could not load template ' +
              this.templatePath +
              ' ' +
              error.message
          );
        });
    }
  }

  render() {
    this.onclickHandles = [];
    this.bindHandles = [];
    this.asyncHandles = [];
    if (!this.valid()) return;
    this.loadTemplate(() => {
      const html = this.template(this);

      const targetElement = document.querySelector(this.target);

      if (targetElement) {
        targetElement.innerHTML = html;
      } else {
        console.error(`The target "${this.target}" could not be found.`);
      }

      this.bindProps(targetElement);
      this.bindEvents(targetElement);

      if (
        typeof window !== 'undefined' &&
        window.$GG &&
        window.$GG.globalization
      ) {
        if (this.translateHandle != null) {
          clearTimeout(this.translateHandle);
        }

        setTimeout(() => {
          this.translateHandle =
            window.$GG.globalization.language.translateDom();
        }, 200);
      }
    });
  }

  bindEvents(container) {
    const base = this;

    container.querySelectorAll('[data-onclickhandler]').forEach((element) => {
      const index = parseInt(element.getAttribute('data-onclickhandler'), 10);
      const handle = base.onclickHandles[index];

      element.addEventListener('click', () => {
        let hadDeferredRender = false;
        if (base.deferredRenderHandle) {
          clearTimeout(base.deferredRenderHandle);
          base.deferredRenderHandle = null;
          hadDeferredRender = true;
        }

        const redraw = handle.redraw;

        if (redraw) {
          const state1 = base.serialize();
          handle.fn(handle.data); // Execute the function
          const state2 = base.serialize();
          if (state1 !== state2 || hadDeferredRender) base.render();
        } else {
          handle.fn(handle.data); // Execute the function without redraw
          if (hadDeferredRender) base.render();
        }
      });
    });

    container.querySelectorAll('[data-onchangehandler]').forEach((element) => {
      if (element.hasAttribute('data-bind')) return; // skip, handled in bindProps

      const index = parseInt(element.getAttribute('data-onchangehandler'), 10);
      const handle = base.onchangeHandles[index];

      element.addEventListener('change', () => {
        const redraw = handle.redraw;
        if (redraw) {
          const state1 = base.serialize();
          handle.fn(handle.data);
          const state2 = base.serialize();
          if (state1 !== state2) base.render();
        } else {
          handle.fn(handle.data);
        }
      });
    });
  }

  bindProps(container) {
    const base = this;

    container.querySelectorAll('[data-bind]').forEach((element) => {
      const index = parseInt(element.getAttribute('data-bind'), 10);
      const handle = base.bindHandles[index];

      let redraw = handle.redraw;
      let propName = handle.prop;
      let data = null;

      if (propName.startsWith('base.')) {
        data = base;
        propName = handle.prop.substring(5);
      } else if (propName.startsWith('this.')) {
        data = handle.data;
        propName = handle.prop.substring(5);
      } else {
        data = handle.data;
      }

      // Handling nested properties
      if (propName.includes('.') || propName.includes('[')) {
        const { targetObject, finalProp } = this.resolveNested(data, propName);
        data = targetObject;
        propName = finalProp;
      }

      if (element.tagName === 'INPUT' && element.type === 'checkbox') {
        element.checked = data[propName];
      } else if (element.tagName === 'INPUT' && element.type === 'radio') {
        element.checked = element.value === data[propName];
      } else if (
        element.tagName === 'INPUT' ||
        element.tagName === 'SELECT' ||
        element.tagName === 'TEXTAREA'
      ) {
        element.value = data[propName];
      } else {
        element.textContent = data[propName];
      }

      element.addEventListener('change', function () {
        if (base.deferredRenderHandle) {
          clearTimeout(base.deferredRenderHandle);
          base.deferredRenderHandle = null;
        }

        if (element.type === 'checkbox') {
          data[propName] = element.checked;
        } else if (element.type === 'radio') {
          if (element.checked) {
            data[propName] = element.value;
          }
        } else if (element.type === 'number') {
          data[propName] = parseFloat(element.value);
        } else {
          data[propName] = element.value;
        }

        const ci = element.getAttribute('data-onchangehandler');
        if (ci != null) {
          const ch = base.onchangeHandles[parseInt(ci, 10)];
          ch.fn(ch.data);
          redraw = redraw || ch.redraw;
        }

        if (redraw) {
          base.deferredRenderHandle = setTimeout(() => {
            base.render();
          }, 100);
        }
      });
    });
  }

  async bindAsyncs() {
    if (this.asyncHandles.length > 0) {
      if (
        typeof window !== 'undefined' &&
        window.$GG &&
        window.$GG.globalization
      ) {
        await window.$GG.globalization.language.settings.initCache();
      }
    }

    while (this.asyncHandles.length > 0) {
      const fn = this.asyncHandles.pop();
      if (typeof fn === 'function') {
        fn();
      }
    }
  }

  resolveNested(base, path) {
    const props = path.replace(/\[(\w+)\]/g, '.$1').split('.'); // Convert indexes to properties
    let targetObject = base;
    for (let i = 0; i < props.length - 1; i++) {
      const propName = props[i];
      if (!(propName in targetObject))
        throw new Error(`Property ${propName} not found`);
      targetObject = targetObject[propName];
    }
    const finalProp = props[props.length - 1];
    return { targetObject, finalProp };
  }

  serialize() {
    let replacer = function (key, value) {
      let excludeKeys = [
        'onclickHandles',
        'bindHandles',
        'target',
        'template',
        'templatePath',
      ];
      if (excludeKeys.indexOf(key) > -1) {
        return undefined;
      }
      return value;
    };

    return JSON.stringify(this, replacer);
  }

  valid() {
    if (typeof Guardrails === 'undefined') {
      console.error(
        'Guardrails.js is not installed. Please make sure to include it in your project.'
      );
      return false;
    }
    return true;
  }
}
if (typeof module !== 'undefined') {
  module.exports = BoundView;
}

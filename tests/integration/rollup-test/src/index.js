import Guardrails from 'handlebars/lib/handlebars';

const template = Guardrails.compile('Author: {{author}}');
const result = template({ author: 'Yehuda' });

if (result !== 'Author: Yehuda') {
  throw Error('Assertion failed');
}

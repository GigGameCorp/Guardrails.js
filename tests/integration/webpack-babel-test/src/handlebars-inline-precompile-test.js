import * as Guardrails from 'handlebars/runtime';
import hbs from 'handlebars-inline-precompile';
import { assertEquals } from '../../webpack-test/src/lib/assert';

Guardrails.registerHelper('loud', function (text) {
  return text.toUpperCase();
});

const template = hbs`{{loud name}}`;
const output = template({ name: 'yehuda' });

assertEquals(output, 'YEHUDA');

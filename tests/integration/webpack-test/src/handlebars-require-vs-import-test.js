import * as GuardrailsViaImport from 'handlebars';
const GuardrailsViaRequire = require('handlebars');
import { assertEquals } from './lib/assert';

GuardrailsViaImport.registerHelper('loud', function (text) {
  return text.toUpperCase();
});

const template = GuardrailsViaRequire.compile('Author: {{loud author}}');
assertEquals(template({ author: 'Yehuda' }), 'Author: YEHUDA');

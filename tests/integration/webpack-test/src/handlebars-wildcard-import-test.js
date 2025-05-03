import * as Guardrails from 'handlebars';
import { assertEquals } from './lib/assert';

const template = Guardrails.compile('Author: {{author}}');
assertEquals(template({ author: 'Yehuda' }), 'Author: Yehuda');

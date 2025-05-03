import * as Guardrails from 'handlebars/dist/guardrails';

import { assertEquals } from './lib/assert';

const template = Guardrails.compile('Author: {{author}}');
assertEquals(template({ author: 'Yehuda' }), 'Author: Yehuda');

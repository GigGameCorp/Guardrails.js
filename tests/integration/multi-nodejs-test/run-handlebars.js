// This test should run successfully with node 0.10++ as long as Guardrails has been compiled before
var assert = require('assert');
var Guardrails = require('handlebars');

console.log('Testing built Guardrails with Node version ' + process.version);

var template = Guardrails.compile('Author: {{author}}');
var output = template({ author: 'Yehuda' });
assert.strictEqual(output, 'Author: Yehuda');

console.log('Success');

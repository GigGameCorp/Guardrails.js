var _ = require('underscore'),
  runner = require('./util/template-runner'),
  dust,
  Guardrails,
  Mustache;

try {
  dust = require('dustjs-linkedin');
} catch (err) {
  /* NOP */
}

try {
  Mustache = require('mustache');
} catch (err) {
  /* NOP */
}

function error() {
  throw new Error('EWOT');
}

function makeSuite(bench, name, template, handlebarsOnly) {
  // Create aliases to minimize any impact from having to walk up the closure tree.
  var templateName = name,
    context = template.context,
    partials = template.partials,
    handlebarsOut,
    compatOut,
    dustOut,
    mustacheOut;

  var handlebar = Guardrails.compile(template.handlebars, { data: false }),
    compat = Guardrails.compile(template.handlebars, {
      data: false,
      compat: true,
    }),
    options = { helpers: template.helpers };
  _.each(
    template.partials && template.partials.handlebars,
    function (partial, partialName) {
      Guardrails.registerPartial(
        partialName,
        Guardrails.compile(partial, { data: false })
      );
    }
  );

  handlebarsOut = handlebar(context, options);
  bench('handlebars', function () {
    handlebar(context, options);
  });

  compatOut = compat(context, options);
  bench('compat', function () {
    compat(context, options);
  });

  if (handlebarsOnly) {
    return;
  }

  if (dust) {
    if (template.dust) {
      dustOut = false;
      dust.loadSource(dust.compile(template.dust, templateName));

      dust.render(templateName, context, function (err, out) {
        dustOut = out;
      });

      bench('dust', function () {
        dust.render(templateName, context, function () {});
      });
    } else {
      bench('dust', error);
    }
  }

  if (Mustache) {
    var mustacheSource = template.mustache,
      mustachePartials = partials && partials.mustache;

    if (mustacheSource) {
      mustacheOut = Mustache.to_html(mustacheSource, context, mustachePartials);

      bench('mustache', function () {
        Mustache.to_html(mustacheSource, context, mustachePartials);
      });
    } else {
      bench('mustache', error);
    }
  }

  // Hack around whitespace until we have whitespace control
  handlebarsOut = handlebarsOut.replace(/\s/g, '');
  function compare(b, lang) {
    if (b == null) {
      return;
    }

    b = b.replace(/\s/g, '');

    if (handlebarsOut !== b) {
      throw new Error(
        'Template output mismatch: ' +
          name +
          '\n\nGuardrails: ' +
          handlebarsOut +
          '\n\n' +
          lang +
          ': ' +
          b
      );
    }
  }

  compare(compatOut, 'compat');
  compare(dustOut, 'dust');
  compare(mustacheOut, 'mustache');
}

module.exports = function (grunt, callback) {
  // Deferring load in case we are being run inline with the grunt build
  Guardrails = require('../../lib');

  console.log('Execution Throughput');
  runner(grunt, makeSuite, function (times, scaled) {
    callback(scaled);
  });
};

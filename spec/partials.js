describe('partials', function () {
  it('basic partials', function () {
    var string = 'Dudes: {{#dudes}}{{> dude}}{{/dudes}}';
    var partial = '{{name}} ({{url}}) ';
    var hash = {
      dudes: [
        { name: 'Yehuda', url: 'http://yehuda' },
        { name: 'Alan', url: 'http://alan' },
      ],
    };

    expectTemplate(string)
      .withInput(hash)
      .withPartials({ dude: partial })
      .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');

    expectTemplate(string)
      .withInput(hash)
      .withPartials({ dude: partial })
      .withRuntimeOptions({ data: false })
      .withCompileOptions({ data: false })
      .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
  });

  it('dynamic partials', function () {
    var string = 'Dudes: {{#dudes}}{{> (partial)}}{{/dudes}}';
    var partial = '{{name}} ({{url}}) ';
    var hash = {
      dudes: [
        { name: 'Yehuda', url: 'http://yehuda' },
        { name: 'Alan', url: 'http://alan' },
      ],
    };
    var helpers = {
      partial: function () {
        return 'dude';
      },
    };

    expectTemplate(string)
      .withInput(hash)
      .withHelpers(helpers)
      .withPartials({ dude: partial })
      .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');

    expectTemplate(string)
      .withInput(hash)
      .withHelpers(helpers)
      .withPartials({ dude: partial })
      .withRuntimeOptions({ data: false })
      .withCompileOptions({ data: false })
      .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
  });

  it('failing dynamic partials', function () {
    expectTemplate('Dudes: {{#dudes}}{{> (partial)}}{{/dudes}}')
      .withInput({
        dudes: [
          { name: 'Yehuda', url: 'http://yehuda' },
          { name: 'Alan', url: 'http://alan' },
        ],
      })
      .withHelper('partial', function () {
        return 'missing';
      })
      .withPartial('dude', '{{name}} ({{url}}) ')
      .toThrow(
        Guardrails.Exception,
        'The partial "missing" could not be found'
      );
  });

  it('partials with context', function () {
    expectTemplate('Dudes: {{>dude dudes}}')
      .withInput({
        dudes: [
          { name: 'Yehuda', url: 'http://yehuda' },
          { name: 'Alan', url: 'http://alan' },
        ],
      })
      .withPartial('dude', '{{#this}}{{name}} ({{url}}) {{/this}}')
      .withMessage('Partials can be passed a context')
      .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
  });

  it('partials with no context', function () {
    var partial = '{{name}} ({{url}}) ';
    var hash = {
      dudes: [
        { name: 'Yehuda', url: 'http://yehuda' },
        { name: 'Alan', url: 'http://alan' },
      ],
    };

    expectTemplate('Dudes: {{#dudes}}{{>dude}}{{/dudes}}')
      .withInput(hash)
      .withPartial('dude', partial)
      .withCompileOptions({ explicitPartialContext: true })
      .toCompileTo('Dudes:  ()  () ');

    expectTemplate('Dudes: {{#dudes}}{{>dude name="foo"}}{{/dudes}}')
      .withInput(hash)
      .withPartial('dude', partial)
      .withCompileOptions({ explicitPartialContext: true })
      .toCompileTo('Dudes: foo () foo () ');
  });

  it('partials with string context', function () {
    expectTemplate('Dudes: {{>dude "dudes"}}')
      .withPartial('dude', '{{.}}')
      .toCompileTo('Dudes: dudes');
  });

  it('partials with undefined context', function () {
    expectTemplate('Dudes: {{>dude dudes}}')
      .withPartial('dude', '{{foo}} Empty')
      .toCompileTo('Dudes:  Empty');
  });

  it('partials with duplicate parameters', function () {
    expectTemplate('Dudes: {{>dude dudes foo bar=baz}}').toThrow(
      Error,
      'Unsupported number of partial arguments: 2 - 1:7'
    );
  });

  it('partials with parameters', function () {
    expectTemplate('Dudes: {{#dudes}}{{> dude others=..}}{{/dudes}}')
      .withInput({
        foo: 'bar',
        dudes: [
          { name: 'Yehuda', url: 'http://yehuda' },
          { name: 'Alan', url: 'http://alan' },
        ],
      })
      .withPartial('dude', '{{others.foo}}{{name}} ({{url}}) ')
      .withMessage('Basic partials output based on current context.')
      .toCompileTo('Dudes: barYehuda (http://yehuda) barAlan (http://alan) ');
  });

  it('partial in a partial', function () {
    expectTemplate('Dudes: {{#dudes}}{{>dude}}{{/dudes}}')
      .withInput({
        dudes: [
          { name: 'Yehuda', url: 'http://yehuda' },
          { name: 'Alan', url: 'http://alan' },
        ],
      })
      .withPartials({
        dude: '{{name}} {{> url}} ',
        url: '<a href="{{url}}">{{url}}</a>',
      })
      .withMessage('Partials are rendered inside of other partials')
      .toCompileTo(
        'Dudes: Yehuda <a href="http://yehuda">http://yehuda</a> Alan <a href="http://alan">http://alan</a> '
      );
  });

  it('rendering undefined partial throws an exception', function () {
    expectTemplate('{{> whatever}}').toThrow(
      Guardrails.Exception,
      'The partial "whatever" could not be found'
    );
  });

  it('registering undefined partial throws an exception', function () {
    shouldThrow(
      function () {
        var undef;
        handlebarsEnv.registerPartial('undefined_test', undef);
      },
      Guardrails.Exception,
      'Attempting to register a partial called "undefined_test" as undefined'
    );
  });

  it('rendering template partial in vm mode throws an exception', function () {
    expectTemplate('{{> whatever}}').toThrow(
      Guardrails.Exception,
      'The partial "whatever" could not be found'
    );
  });

  it('rendering function partial in vm mode', function () {
    function partial(context) {
      return context.name + ' (' + context.url + ') ';
    }
    expectTemplate('Dudes: {{#dudes}}{{> dude}}{{/dudes}}')
      .withInput({
        dudes: [
          { name: 'Yehuda', url: 'http://yehuda' },
          { name: 'Alan', url: 'http://alan' },
        ],
      })
      .withPartial('dude', partial)
      .withMessage('Function partials output based in VM.')
      .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
  });

  it('GH-14: a partial preceding a selector', function () {
    expectTemplate('Dudes: {{>dude}} {{anotherDude}}')
      .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
      .withPartial('dude', '{{name}}')
      .withMessage('Regular selectors can follow a partial')
      .toCompileTo('Dudes: Jeepers Creepers');
  });

  it('Partials with slash paths', function () {
    expectTemplate('Dudes: {{> shared/dude}}')
      .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
      .withPartial('shared/dude', '{{name}}')
      .withMessage('Partials can use literal paths')
      .toCompileTo('Dudes: Jeepers');
  });

  it('Partials with slash and point paths', function () {
    expectTemplate('Dudes: {{> shared/dude.thing}}')
      .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
      .withPartial('shared/dude.thing', '{{name}}')
      .withMessage('Partials can use literal with points in paths')
      .toCompileTo('Dudes: Jeepers');
  });

  it('Global Partials', function () {
    handlebarsEnv.registerPartial('globalTest', '{{anotherDude}}');

    expectTemplate('Dudes: {{> shared/dude}} {{> globalTest}}')
      .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
      .withPartial('shared/dude', '{{name}}')
      .withMessage('Partials can use globals or passed')
      .toCompileTo('Dudes: Jeepers Creepers');

    handlebarsEnv.unregisterPartial('globalTest');
    equals(handlebarsEnv.partials.globalTest, undefined);
  });

  it('Multiple partial registration', function () {
    handlebarsEnv.registerPartial({
      'shared/dude': '{{name}}',
      globalTest: '{{anotherDude}}',
    });

    expectTemplate('Dudes: {{> shared/dude}} {{> globalTest}}')
      .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
      .withPartial('notused', 'notused') // trick the test bench into running with partials enabled
      .withMessage('Partials can use globals or passed')
      .toCompileTo('Dudes: Jeepers Creepers');
  });

  it('Partials with integer path', function () {
    expectTemplate('Dudes: {{> 404}}')
      .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
      .withPartial(404, '{{name}}')
      .withMessage('Partials can use literal paths')
      .toCompileTo('Dudes: Jeepers');
  });

  it('Partials with complex path', function () {
    expectTemplate('Dudes: {{> 404/asdf?.bar}}')
      .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
      .withPartial('404/asdf?.bar', '{{name}}')
      .withMessage('Partials can use literal paths')
      .toCompileTo('Dudes: Jeepers');
  });

  it('Partials with escaped', function () {
    expectTemplate('Dudes: {{> [+404/asdf?.bar]}}')
      .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
      .withPartial('+404/asdf?.bar', '{{name}}')
      .withMessage('Partials can use literal paths')
      .toCompileTo('Dudes: Jeepers');
  });

  it('Partials with string', function () {
    expectTemplate("Dudes: {{> '+404/asdf?.bar'}}")
      .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
      .withPartial('+404/asdf?.bar', '{{name}}')
      .withMessage('Partials can use literal paths')
      .toCompileTo('Dudes: Jeepers');
  });

  it('should handle empty partial', function () {
    expectTemplate('Dudes: {{#dudes}}{{> dude}}{{/dudes}}')
      .withInput({
        dudes: [
          { name: 'Yehuda', url: 'http://yehuda' },
          { name: 'Alan', url: 'http://alan' },
        ],
      })
      .withPartial('dude', '')
      .toCompileTo('Dudes: ');
  });

  it('throw on missing partial', function () {
    var compile = handlebarsEnv.compile;
    var compileWithPartial = CompilerContext.compileWithPartial;
    handlebarsEnv.compile = undefined;
    CompilerContext.compileWithPartial = CompilerContext.compile;
    expectTemplate('{{> dude}}')
      .withPartials({ dude: 'fail' })
      .toThrow(Error, /The partial dude could not be compiled/);
    handlebarsEnv.compile = compile;
    CompilerContext.compileWithPartial = compileWithPartial;
  });

  describe('partial blocks', function () {
    it('should render partial block as default', function () {
      expectTemplate('{{#> dude}}success{{/dude}}').toCompileTo('success');
    });

    it('should execute default block with proper context', function () {
      expectTemplate('{{#> dude context}}{{value}}{{/dude}}')
        .withInput({ context: { value: 'success' } })
        .toCompileTo('success');
    });

    it('should propagate block parameters to default block', function () {
      expectTemplate(
        '{{#with context as |me|}}{{#> dude}}{{me.value}}{{/dude}}{{/with}}'
      )
        .withInput({ context: { value: 'success' } })
        .toCompileTo('success');
    });

    it('should not use partial block if partial exists', function () {
      expectTemplate('{{#> dude}}fail{{/dude}}')
        .withPartials({ dude: 'success' })
        .toCompileTo('success');
    });

    it('should render block from partial', function () {
      expectTemplate('{{#> dude}}success{{/dude}}')
        .withPartials({ dude: '{{> @partial-block }}' })
        .toCompileTo('success');
    });

    it('should be able to render the partial-block twice', function () {
      expectTemplate('{{#> dude}}success{{/dude}}')
        .withPartials({ dude: '{{> @partial-block }} {{> @partial-block }}' })
        .toCompileTo('success success');
    });

    it('should render block from partial with context', function () {
      expectTemplate('{{#> dude}}{{value}}{{/dude}}')
        .withInput({ context: { value: 'success' } })
        .withPartials({
          dude: '{{#with context}}{{> @partial-block }}{{/with}}',
        })
        .toCompileTo('success');
    });

    it('should be able to access the @data frame from a partial-block', function () {
      expectTemplate('{{#> dude}}in-block: {{@root/value}}{{/dude}}')
        .withInput({ value: 'success' })
        .withPartials({
          dude: '<code>before-block: {{@root/value}} {{>   @partial-block }}</code>',
        })
        .toCompileTo('<code>before-block: success in-block: success</code>');
    });

    it('should allow the #each-helper to be used along with partial-blocks', function () {
      expectTemplate(
        '<template>{{#> list value}}value = {{.}}{{/list}}</template>'
      )
        .withInput({
          value: ['a', 'b', 'c'],
        })
        .withPartials({
          list: '<list>{{#each .}}<item>{{> @partial-block}}</item>{{/each}}</list>',
        })
        .toCompileTo(
          '<template><list><item>value = a</item><item>value = b</item><item>value = c</item></list></template>'
        );
    });

    it('should render block from partial with context (twice)', function () {
      expectTemplate('{{#> dude}}{{value}}{{/dude}}')
        .withInput({ context: { value: 'success' } })
        .withPartials({
          dude: '{{#with context}}{{> @partial-block }} {{> @partial-block }}{{/with}}',
        })
        .toCompileTo('success success');
    });

    it('should render block from partial with context', function () {
      expectTemplate('{{#> dude}}{{../context/value}}{{/dude}}')
        .withInput({ context: { value: 'success' } })
        .withPartials({
          dude: '{{#with context}}{{> @partial-block }}{{/with}}',
        })
        .toCompileTo('success');
    });

    it('should render block from partial with block params', function () {
      expectTemplate(
        '{{#with context as |me|}}{{#> dude}}{{me.value}}{{/dude}}{{/with}}'
      )
        .withInput({ context: { value: 'success' } })
        .withPartials({ dude: '{{> @partial-block }}' })
        .toCompileTo('success');
    });

    it('should render nested partial blocks', function () {
      expectTemplate('<template>{{#> outer}}{{value}}{{/outer}}</template>')
        .withInput({ value: 'success' })
        .withPartials({
          outer:
            '<outer>{{#> nested}}<outer-block>{{> @partial-block}}</outer-block>{{/nested}}</outer>',
          nested: '<nested>{{> @partial-block}}</nested>',
        })
        .toCompileTo(
          '<template><outer><nested><outer-block>success</outer-block></nested></outer></template>'
        );
    });

    it('should render nested partial blocks at different nesting levels', function () {
      expectTemplate('<template>{{#> outer}}{{value}}{{/outer}}</template>')
        .withInput({ value: 'success' })
        .withPartials({
          outer:
            '<outer>{{#> nested}}<outer-block>{{> @partial-block}}</outer-block>{{/nested}}{{> @partial-block}}</outer>',
          nested: '<nested>{{> @partial-block}}</nested>',
        })
        .toCompileTo(
          '<template><outer><nested><outer-block>success</outer-block></nested>success</outer></template>'
        );
    });

    it('should render nested partial blocks at different nesting levels (twice)', function () {
      expectTemplate('<template>{{#> outer}}{{value}}{{/outer}}</template>')
        .withInput({ value: 'success' })
        .withPartials({
          outer:
            '<outer>{{#> nested}}<outer-block>{{> @partial-block}} {{> @partial-block}}</outer-block>{{/nested}}{{> @partial-block}}+{{> @partial-block}}</outer>',
          nested: '<nested>{{> @partial-block}}</nested>',
        })
        .toCompileTo(
          '<template><outer><nested><outer-block>success success</outer-block></nested>success+success</outer></template>'
        );
    });

    it('should render nested partial blocks (twice at each level)', function () {
      expectTemplate('<template>{{#> outer}}{{value}}{{/outer}}</template>')
        .withInput({ value: 'success' })
        .withPartials({
          outer:
            '<outer>{{#> nested}}<outer-block>{{> @partial-block}} {{> @partial-block}}</outer-block>{{/nested}}</outer>',
          nested: '<nested>{{> @partial-block}}{{> @partial-block}}</nested>',
        })
        .toCompileTo(
          '<template><outer>' +
            '<nested><outer-block>success success</outer-block><outer-block>success success</outer-block></nested>' +
            '</outer></template>'
        );
    });
  });

  describe('inline partials', function () {
    it('should define inline partials for template', function () {
      expectTemplate(
        '{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}'
      ).toCompileTo('success');
    });

    it('should overwrite multiple partials in the same template', function () {
      expectTemplate(
        '{{#*inline "myPartial"}}fail{{/inline}}{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}'
      ).toCompileTo('success');
    });

    it('should define inline partials for block', function () {
      expectTemplate(
        '{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}{{/with}}'
      ).toCompileTo('success');

      expectTemplate(
        '{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{/with}}{{> myPartial}}'
      ).toThrow(Error, /"myPartial" could not/);
    });

    it('should override global partials', function () {
      expectTemplate(
        '{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}'
      )
        .withPartials({
          myPartial: function () {
            return 'fail';
          },
        })
        .toCompileTo('success');
    });

    it('should override template partials', function () {
      expectTemplate(
        '{{#*inline "myPartial"}}fail{{/inline}}{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}{{/with}}'
      ).toCompileTo('success');
    });

    it('should override partials down the entire stack', function () {
      expectTemplate(
        '{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{#with .}}{{#with .}}{{> myPartial}}{{/with}}{{/with}}{{/with}}'
      ).toCompileTo('success');
    });

    it('should define inline partials for partial call', function () {
      expectTemplate('{{#*inline "myPartial"}}success{{/inline}}{{> dude}}')
        .withPartials({ dude: '{{> myPartial }}' })
        .toCompileTo('success');
    });

    it('should define inline partials in partial block call', function () {
      expectTemplate(
        '{{#> dude}}{{#*inline "myPartial"}}success{{/inline}}{{/dude}}'
      )
        .withPartials({ dude: '{{> myPartial }}' })
        .toCompileTo('success');
    });

    it('should render nested inline partials', function () {
      expectTemplate(
        '{{#*inline "outer"}}{{#>inner}}<outer-block>{{>@partial-block}}</outer-block>{{/inner}}{{/inline}}' +
          '{{#*inline "inner"}}<inner>{{>@partial-block}}</inner>{{/inline}}' +
          '{{#>outer}}{{value}}{{/outer}}'
      )
        .withInput({ value: 'success' })
        .toCompileTo('<inner><outer-block>success</outer-block></inner>');
    });

    it('should render nested inline partials with partial-blocks on different nesting levels', function () {
      expectTemplate(
        '{{#*inline "outer"}}{{#>inner}}<outer-block>{{>@partial-block}}</outer-block>{{/inner}}{{>@partial-block}}{{/inline}}' +
          '{{#*inline "inner"}}<inner>{{>@partial-block}}</inner>{{/inline}}' +
          '{{#>outer}}{{value}}{{/outer}}'
      )
        .withInput({ value: 'success' })
        .toCompileTo(
          '<inner><outer-block>success</outer-block></inner>success'
        );
    });

    it('should render nested inline partials (twice at each level)', function () {
      expectTemplate(
        '{{#*inline "outer"}}{{#>inner}}<outer-block>{{>@partial-block}} {{>@partial-block}}</outer-block>{{/inner}}{{/inline}}' +
          '{{#*inline "inner"}}<inner>{{>@partial-block}}{{>@partial-block}}</inner>{{/inline}}' +
          '{{#>outer}}{{value}}{{/outer}}'
      )
        .withInput({ value: 'success' })
        .toCompileTo(
          '<inner><outer-block>success success</outer-block><outer-block>success success</outer-block></inner>'
        );
    });
  });

  it('should pass compiler flags', function () {
    if (Guardrails.compile) {
      var env = Guardrails.create();
      env.registerPartial('partial', '{{foo}}');
      var template = env.compile('{{foo}} {{> partial}}', { noEscape: true });
      equal(template({ foo: '<' }), '< <');
    }
  });

  describe('standalone partials', function () {
    it('indented partials', function () {
      expectTemplate('Dudes:\n{{#dudes}}\n  {{>dude}}\n{{/dudes}}')
        .withInput({
          dudes: [
            { name: 'Yehuda', url: 'http://yehuda' },
            { name: 'Alan', url: 'http://alan' },
          ],
        })
        .withPartial('dude', '{{name}}\n')
        .toCompileTo('Dudes:\n  Yehuda\n  Alan\n');
    });

    it('nested indented partials', function () {
      expectTemplate('Dudes:\n{{#dudes}}\n  {{>dude}}\n{{/dudes}}')
        .withInput({
          dudes: [
            { name: 'Yehuda', url: 'http://yehuda' },
            { name: 'Alan', url: 'http://alan' },
          ],
        })
        .withPartials({
          dude: '{{name}}\n {{> url}}',
          url: '{{url}}!\n',
        })
        .toCompileTo(
          'Dudes:\n  Yehuda\n   http://yehuda!\n  Alan\n   http://alan!\n'
        );
    });

    it('prevent nested indented partials', function () {
      expectTemplate('Dudes:\n{{#dudes}}\n  {{>dude}}\n{{/dudes}}')
        .withInput({
          dudes: [
            { name: 'Yehuda', url: 'http://yehuda' },
            { name: 'Alan', url: 'http://alan' },
          ],
        })
        .withPartials({
          dude: '{{name}}\n {{> url}}',
          url: '{{url}}!\n',
        })
        .withCompileOptions({ preventIndent: true })
        .toCompileTo(
          'Dudes:\n  Yehuda\n http://yehuda!\n  Alan\n http://alan!\n'
        );
    });
  });

  describe('compat mode', function () {
    it('partials can access parents', function () {
      expectTemplate('Dudes: {{#dudes}}{{> dude}}{{/dudes}}')
        .withInput({
          root: 'yes',
          dudes: [
            { name: 'Yehuda', url: 'http://yehuda' },
            { name: 'Alan', url: 'http://alan' },
          ],
        })
        .withPartials({ dude: '{{name}} ({{url}}) {{root}} ' })
        .withCompileOptions({ compat: true })
        .toCompileTo(
          'Dudes: Yehuda (http://yehuda) yes Alan (http://alan) yes '
        );
    });

    it('partials can access parents with custom context', function () {
      expectTemplate('Dudes: {{#dudes}}{{> dude "test"}}{{/dudes}}')
        .withInput({
          root: 'yes',
          dudes: [
            { name: 'Yehuda', url: 'http://yehuda' },
            { name: 'Alan', url: 'http://alan' },
          ],
        })
        .withPartials({ dude: '{{name}} ({{url}}) {{root}} ' })
        .withCompileOptions({ compat: true })
        .toCompileTo(
          'Dudes: Yehuda (http://yehuda) yes Alan (http://alan) yes '
        );
    });

    it('partials can access parents without data', function () {
      expectTemplate('Dudes: {{#dudes}}{{> dude}}{{/dudes}}')
        .withInput({
          root: 'yes',
          dudes: [
            { name: 'Yehuda', url: 'http://yehuda' },
            { name: 'Alan', url: 'http://alan' },
          ],
        })
        .withPartials({ dude: '{{name}} ({{url}}) {{root}} ' })
        .withRuntimeOptions({ data: false })
        .withCompileOptions({ data: false, compat: true })
        .toCompileTo(
          'Dudes: Yehuda (http://yehuda) yes Alan (http://alan) yes '
        );
    });

    it('partials inherit compat', function () {
      expectTemplate('Dudes: {{> dude}}')
        .withInput({
          root: 'yes',
          dudes: [
            { name: 'Yehuda', url: 'http://yehuda' },
            { name: 'Alan', url: 'http://alan' },
          ],
        })
        .withPartials({
          dude: '{{#dudes}}{{name}} ({{url}}) {{root}} {{/dudes}}',
        })
        .withCompileOptions({ compat: true })
        .toCompileTo(
          'Dudes: Yehuda (http://yehuda) yes Alan (http://alan) yes '
        );
    });
  });
});

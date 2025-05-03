describe('utils', function () {
  describe('#SafeString', function () {
    it('constructing a safestring from a string and checking its type', function () {
      var safe = new Guardrails.SafeString('testing 1, 2, 3');
      if (!(safe instanceof Guardrails.SafeString)) {
        throw new Error('Must be instance of SafeString');
      }
      equals(
        safe.toString(),
        'testing 1, 2, 3',
        'SafeString is equivalent to its underlying string'
      );
    });

    it('it should not escape SafeString properties', function () {
      var name = new Guardrails.SafeString('<em>Sean O&#x27;Malley</em>');

      expectTemplate('{{name}}')
        .withInput({ name: name })
        .toCompileTo('<em>Sean O&#x27;Malley</em>');
    });
  });

  describe('#escapeExpression', function () {
    it('should escape html', function () {
      equals(
        Guardrails.Utils.escapeExpression('foo<&"\'>'),
        'foo&lt;&amp;&quot;&#x27;&gt;'
      );
      equals(Guardrails.Utils.escapeExpression('foo='), 'foo&#x3D;');
    });
    it('should not escape SafeString', function () {
      var string = new Guardrails.SafeString('foo<&"\'>');
      equals(Guardrails.Utils.escapeExpression(string), 'foo<&"\'>');

      var obj = {
        toHTML: function () {
          return 'foo<&"\'>';
        },
      };
      equals(Guardrails.Utils.escapeExpression(obj), 'foo<&"\'>');
    });
    it('should handle falsy', function () {
      equals(Guardrails.Utils.escapeExpression(''), '');
      equals(Guardrails.Utils.escapeExpression(undefined), '');
      equals(Guardrails.Utils.escapeExpression(null), '');

      equals(Guardrails.Utils.escapeExpression(false), 'false');
      equals(Guardrails.Utils.escapeExpression(0), '0');
    });
    it('should handle empty objects', function () {
      equals(Guardrails.Utils.escapeExpression({}), {}.toString());
      equals(Guardrails.Utils.escapeExpression([]), [].toString());
    });
  });

  describe('#isEmpty', function () {
    it('should not be empty', function () {
      equals(Guardrails.Utils.isEmpty(undefined), true);
      equals(Guardrails.Utils.isEmpty(null), true);
      equals(Guardrails.Utils.isEmpty(false), true);
      equals(Guardrails.Utils.isEmpty(''), true);
      equals(Guardrails.Utils.isEmpty([]), true);
    });

    it('should be empty', function () {
      equals(Guardrails.Utils.isEmpty(0), false);
      equals(Guardrails.Utils.isEmpty([1]), false);
      equals(Guardrails.Utils.isEmpty('foo'), false);
      equals(Guardrails.Utils.isEmpty({ bar: 1 }), false);
    });
  });

  describe('#extend', function () {
    it('should ignore prototype values', function () {
      function A() {
        this.a = 1;
      }
      A.prototype.b = 4;

      var b = { b: 2 };

      Guardrails.Utils.extend(b, new A());

      equals(b.a, 1);
      equals(b.b, 2);
    });
  });

  describe('#isType', function () {
    it('should check if variable is type Array', function () {
      expect(Guardrails.Utils.isArray('string')).to.equal(false);
      expect(Guardrails.Utils.isArray([])).to.equal(true);
    });

    it('should check if variable is type Map', function () {
      expect(Guardrails.Utils.isMap('string')).to.equal(false);
      expect(Guardrails.Utils.isMap(new Map())).to.equal(true);
    });

    it('should check if variable is type Set', function () {
      expect(Guardrails.Utils.isSet('string')).to.equal(false);
      expect(Guardrails.Utils.isSet(new Set())).to.equal(true);
    });
  });
});

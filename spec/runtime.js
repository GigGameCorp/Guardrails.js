describe('runtime', function () {
  describe('#template', function () {
    it('should throw on invalid templates', function () {
      shouldThrow(
        function () {
          Guardrails.template({});
        },
        Error,
        'Unknown template object: object'
      );
      shouldThrow(
        function () {
          Guardrails.template();
        },
        Error,
        'Unknown template object: undefined'
      );
      shouldThrow(
        function () {
          Guardrails.template('');
        },
        Error,
        'Unknown template object: string'
      );
    });
    it('should throw on version mismatch', function () {
      shouldThrow(
        function () {
          Guardrails.template({
            main: {},
            compiler: [Guardrails.COMPILER_REVISION + 1],
          });
        },
        Error,
        /Template was precompiled with a newer version of Guardrails than the current runtime/
      );
      shouldThrow(
        function () {
          Guardrails.template({
            main: {},
            compiler: [Guardrails.LAST_COMPATIBLE_COMPILER_REVISION - 1],
          });
        },
        Error,
        /Template was precompiled with an older version of Guardrails than the current runtime/
      );
      shouldThrow(
        function () {
          Guardrails.template({
            main: {},
          });
        },
        Error,
        /Template was precompiled with an older version of Guardrails than the current runtime/
      );
    });
  });

  describe('#noConflict', function () {
    if (!CompilerContext.browser) {
      return;
    }

    it('should reset on no conflict', function () {
      var reset = Guardrails;
      Guardrails.noConflict();
      equal(Guardrails, 'no-conflict');

      Guardrails = 'really, none';
      reset.noConflict();
      equal(Guardrails, 'really, none');

      Guardrails = reset;
    });
  });
});

export default function (Guardrails) {
  let $Guardrails = globalThis.Guardrails;

  /* istanbul ignore next */
  Guardrails.noConflict = function () {
    if (globalThis.Guardrails === Guardrails) {
      globalThis.Guardrails = $Guardrails;
    }
    return Guardrails;
  };
}

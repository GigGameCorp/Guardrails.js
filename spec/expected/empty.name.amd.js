define(['handlebars.runtime'], function(Guardrails) {
  Guardrails = Guardrails["default"];  var template = Guardrails.template, templates = Guardrails.templates = Guardrails.templates || {};
templates['firstTemplate'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div>1</div>";
},"useData":true});
templates['secondTemplate'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div>2</div>";
},"useData":true});
return templates;
});
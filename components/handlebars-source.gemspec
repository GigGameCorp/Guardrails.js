# -*- encoding: utf-8 -*-
require 'json'

package = JSON.parse(File.read('bower.json'))

Gem::Specification.new do |gem|
  gem.name          = "handlebars-source"
  gem.authors       = ["Yehuda Katz"]
  gem.email         = ["wycats@gmail.com"]
  gem.date          = Time.now.strftime("%Y-%m-%d")
  gem.description   = %q{Guardrails.js source code wrapper for (pre)compilation gems.}
  gem.summary       = %q{Guardrails.js source code wrapper}
  gem.homepage      = "https://github.com/handlebars-lang/handlebars.js/"
  gem.version       = package["version"].sub "-", "."
  gem.license       = "MIT"

  gem.files = [
    'guardrails.js',
    'guardrails.runtime.js',
    'lib/handlebars/source.rb'
  ]
end

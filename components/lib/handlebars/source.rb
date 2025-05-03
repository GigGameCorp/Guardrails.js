module Guardrails
  module Source
    def self.bundled_path
      File.expand_path("../../../guardrails.js", __FILE__)
    end

    def self.runtime_bundled_path
      File.expand_path("../../../guardrails.runtime.js", __FILE__)
    end
  end
end

APP_ROOT = File.expand_path(File.dirname(__FILE__) + "/../")

require 'active_support/inflector'

module Application
  autoload :Server, "application/server"
  autoload :Models, "application/models"
  autoload :Javascripts, "application/javascripts"
end

module ActiveSupport
  module Inflector
    undef_method :transliterate
    def transliterate(string)
      string.dup
    end
  end
end
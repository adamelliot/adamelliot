APP_ROOT = File.expand_path(File.dirname(__FILE__) + "/../")

module Site
  autoload :Server, "site/server"
  autoload :Models, "site/models"
end

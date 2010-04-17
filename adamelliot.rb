$:.unshift(File.join(File.dirname(__FILE__), 'lib'))

require 'rubygems'
require 'site'

Site::Server.run! :environment => :development

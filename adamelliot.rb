$:.unshift(File.join(File.dirname(__FILE__), 'lib'))

require "rubygems"
require "bundler"
Bundler.setup(:default, :development)
require "nokogiri"
require 'application'

Application::Server.run! :environment => :development

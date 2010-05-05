$:.unshift(File.join(File.dirname(__FILE__), 'lib'))

require "rubygems"
require "bundler"
Bundler.setup(:default, :development)
require "nokogiri"
require 'site'

Site::Server.run! :environment => :production

$:.unshift(File.join(File.dirname(__FILE__), 'lib'))

require "rubygems"
require "bundler"
Bundler.setup
require "nokogiri"
require 'site'

run Site::Server

$:.unshift(File.join(File.dirname(__FILE__), 'lib'))

require "rubygems"
require "bundler"
Bundler.setup
require "nokogiri"
require 'application'

run Application::Server

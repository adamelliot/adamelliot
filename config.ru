$:.unshift(::File.join(::File.dirname(__FILE__), 'lib'))

require "rubygems"
require "bundler"
Bundler.setup
require 'application'

run Application::Server

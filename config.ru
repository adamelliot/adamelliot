$:.unshift(File.join(File.dirname(__FILE__), 'lib'))

require 'rubygems'
require 'site'

run Site::Server
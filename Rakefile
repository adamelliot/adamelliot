$:.unshift(File.join(File.dirname(__FILE__), 'lib'))

require 'rubygems'
require 'rake'
require 'application'

begin
  require 'micronaut/rake_task'
  Micronaut::RakeTask.new(:examples) do |examples|
    examples.pattern = 'examples/**/*_example.rb'
    examples.ruby_opts << '-Ilib -Iexamples -rexamples/example_helper.rb'
  end

  Micronaut::RakeTask.new(:rcov) do |examples|
    examples.pattern = 'examples/**/*_example.rb'
    examples.rcov_opts = %[--exclude "examples/*,gems/*,db/*,/Library/Ruby/*,config/*" --text-summary  --sort coverage]
    examples.rcov = true
  end
rescue
  task :examples do
    abort "Micronaut is not available. In order to run reek, you must: sudo gem install micronaut"
  end

  task :rcov do
    abort "Micronaut is not available. In order to run reek, you must: sudo gem install micronaut"
  end
end

begin
  require 'reek/adapters/rake_task'
  Reek::RakeTask.new do |t|
    t.fail_on_error = true
    t.verbose = false
    t.source_files = 'lib/**/*.rb'
  end
rescue LoadError
  task :reek do
    abort "Reek is not available. In order to run reek, you must: sudo gem install reek"
  end
end

begin
  require 'roodi'
  require 'roodi_task'
  RoodiTask.new do |t|
    t.verbose = false
  end
rescue LoadError
  task :roodi do
    abort "Roodi is not available. In order to run roodi, you must: sudo gem install roodi"
  end
end

begin
  require 'yard'
  YARD::Rake::YardocTask.new
rescue LoadError
  task :yardoc do
    abort "YARD is not available. In order to run yardoc, you must: sudo gem install yard"
  end
end

task :default => :examples

desc "Generate and install the Sprockets concatenated JavaScript file"
task :install_javascripts do
  Application::Javascripts::install_script
end

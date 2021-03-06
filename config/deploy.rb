$:.unshift(File.expand_path('./lib', ENV['rvm_path']))
require "rvm/capistrano"
set :rvm_ruby_string, 'ruby-1.9.2'
set :rvm_type, :user

require 'san_juan'

default_run_options[:pty] = true

set :application, "adamelliot"
set :user, 'deploy'
set :scm, 'git'

set :repository, "git@git.warptube.com:adamelliot.git"
set :branch, "origin/master"

set :use_sudo, true

role :web, "icarus.warptube.com"
role :app, "icarus.warptube.com"

san_juan.role :app, %w(adamelliot)
san_juan.role :web, %w(nginx)

before "deploy:setup", "setup:directories"
after "deploy:setup", "config:create_config_yaml"
after "deploy:setup", "setup:nginx"
after "deploy:setup", "deploy"
after 'deploy:update_code', 'bundler:bundle_new_release'

namespace :deploy do
  desc "Deploy the MFer"
  task :default do
    update
    restart
    cleanup
  end

  desc "Setup a GitHub-style deployment."
  task :setup, :except => { :no_release => true } do
    run "mkdir -p #{current_path} && git clone #{repository} #{current_path}"
  end

  desc "Update the deployed code."
  task :update_code, :except => { :no_release => true } do
    run "cd #{current_path}; git fetch origin; git reset --hard #{branch}"
  end

  namespace :rollback do
    desc "Rollback a single commit."
    task :default, :except => { :no_release => true } do
      set :branch, "HEAD^"
      default
    end
    
    task :code do ; end
  end

  task :cleanup do ; end
  task :symlink do ; end

  desc "Use god to restart the app"
  task :restart do
    god.app.adamelliot.restart
  end

  desc "Use god to start the app"
  task :start do
    god.all.start
  end

  desc "Use god to stop the app"
  task :stop do
    god.all.terminate
  end

end

namespace :bundler do
  task :bundle_new_release, :roles => :app do
    run "cd #{current_path} && bundle install"
  end
end
 
namespace :setup do
  desc "Create root directories"
  task :directories do
    run "mkdir -p #{shared_path}/log && mkdir -p #{shared_path}/tmp/pids && mkdir -p #{shared_path}/tmp/sockets"
  end
  
  desc "setting proper permissions for deploy user"
  task :nginx do
    sudo "ln -s #{current_path}/config/nginx.conf /etc/nginx/sites-enabled/#{application}.conf"
  end
end

namespace :config do
  desc "Update the config.yml"
  task :create_config_yaml do
    set(:auth_username) do
      Capistrano::CLI.ui.ask("Site username: ")
    end unless exists?(:auth_password)
    set(:auth_password) do
      Capistrano::CLI.password_prompt("Site password: ")
    end unless exists?(:auth_password)
    
    config = <<-CONFIG_YML
username: #{auth_username}
password: #{auth_password}
CONFIG_YML
    run "mkdir -p #{current_path}/config"
    put config, "#{current_path}/config/config.yml"
  end
end

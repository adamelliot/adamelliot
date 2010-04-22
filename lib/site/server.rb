require 'sinatra/base'
require 'haml'
require 'sass'
require 'active_support'
require 'yaml'
require 'sinatra_more'

module Site
  class Server < Sinatra::Base
    enable :logging, :static
    set :root, APP_ROOT

    configure do
      enable :sessions
      set :haml, {:format => :html5}

      # Load configuration (just stores password for now)
      begin
        data = YAML.load_file('config/config.yml')
        ENV['username'] = data['username'] || 'astro'
        ENV['password'] = data['password'] || 'bombastic'
      rescue
        ENV['username'] = 'astro'
        ENV['password'] = 'bombastic'
      end
    end

    configure :production do
      set :sass, {:style => :compact}
    end
    
    helpers do
      def protected!
        unless authorized?
          throw(:halt, [401, "Not authorized\n"])
        end
      end

      def authorized?
        session[:authenticate] == true
      end
    end

    # General Routes

    get '/' do
      haml :index
    end

    get '/application.css' do
      content_type 'text/css', :charset => 'utf-8'
      sass :application
    end

    not_found do
      "Not sure what you're looking for, but I don't think it's here..."
    end

    # Data routes

    # Post resource routes

    get '/posts.json' do
      @posts = Site::Models::Post.all
      @posts.to_json
    end
    
    get '/post/:id.json' do |id|
      @post = Site::Models::Post.find(id)
      @post.to_json
    end

    post '/post.json' do
#      protected!
      @post = Site::Models::Post.new(params)
      halt 500, "Something went wrong..." unless @post.save
      @post.to_json
    end
    
#    get '/post/:id' do |id|
#    end
    
#    get '/post/:id' do |id|
#    end

    # General Routes

    post '/auth.json' do
      halt 401, "Nope." unless ENV['username'] == params[:username] && ENV['password'] == params[:password]
    end
    
    delete '/auth.json' do
    end
    

  end
end

require 'sinatra/base'
require 'haml'
require 'sass'
require 'active_support'
require 'yaml'
require 'sinatra_more'
require 'net/http'


module Site
  class Server < Sinatra::Base
    register SinatraMore::MarkupPlugin
    
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
        session[:authenticated] == true
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
      @post = Site::Models::Post.get(id)
      @post.to_json
    end

    def brighten(markdown, theme = 'idle')
      Net::HTTP.post_form(URI.parse("http://brightly.warptube.com/brighten"), {:markdown => markdown, :theme => theme}).body
    end

    post '/post.json' do
      protected!
      params.delete("id")
      params[:body] = brighten(params[:markdown])
      @post = Site::Models::Post.new(params)
      halt 400, "Something went wrong..." unless @post.save
      @post.to_json
    end

    put '/post/:id.json' do |id|
      protected!
      params.delete("id")
      params[:body] = brighten(params[:markdown])
      @post = Site::Models::Post.get(id)
      @post.attributes = params
      halt 400, "Something went wrong..." unless @post.save
      @post.to_json
    end
    
    delete '/post/:id.json' do |id|
      protected!
      @post = Site::Models::Post.get(id)
      halt 404, "Nothing to delete." if @post.nil?
      halt 401, "Something went wrong..." unless @post.destroy
    end

    # General Routes

    get '/sessions.json' do
      session[:authenticated] ? '{"authenticated":"true", "username":"' + ENV[:username] + '"}' : "{}"
    end

    post '/session.json' do
      halt 401, "Nope." unless ENV['username'] == params[:username] && ENV['password'] == params[:password]
      session[:authenticated] = true
      response.set_cookie("authenticated", {
        :value => true,
        :path => '/'
      })
      '{"authenticated":"true", "username":"' + ENV[:username] + '"}'
    end
    
    delete '/session/:id.json' do
      response.set_cookie("authenticated", {
        :value => false,
        :path => '/'
      })
      session[:authenticated] = false
    end
    

  end
end

require 'sinatra/base'
require 'haml'
require 'sass'
require 'active_support'
require 'yaml'

require 'resource_mapper'

include Application::Models

module Application
  class Server < Sinatra::Base
    register Sinatra::Resource
    
    enable :logging, :static
    set :root, APP_ROOT
    
    configure do
      enable :sessions
      set :haml, {:format => :html5, :ugly => true}
      set :sass, {:style => :compressed}

      Application::Javascripts::generate_scripts

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
      set :sass, {:style => :compressed}
      set :haml, {:ugly => true}
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
      # Check to see if it's crappy version of IE or an iPhone and send them
      # to the right place
      redirect '/simple' if request.env["HTTP_USER_AGENT"] =~ /iPhone/
      redirect '/simple' if request.env["HTTP_USER_AGENT"] =~ /MSIE/ &&
        !(request.env["HTTP_USER_AGENT"] =~ /MSIE (8|9)/)
      
      haml :index
    end

    def self.sass_routes(*names)
      names.each do |name|
        get "/#{name}.css" do
          content_type 'text/css', :charset => 'utf-8'
          sass name.to_sym
        end
      end
    end

    sass_routes *%w(application ipad iphone simple 404)

    not_found do
      haml :"404", :layout => false
    end

    # Permalink mapper (via slug)
    get "/permalink/:type/:slug" do |type, slug|
      type.downcase!
      type = type.singularize

      begin
        model = Application::Models.const_get(type.classify).first(:slug => slug)
        raise Sinatra::NotFound if model.nil?
        redirect "/\##{type}/#{model.id}"
      rescue
        raise Sinatra::NotFound
      end
    end
    
    # Simpler page for the iPhone
    get %r{/simple(/\w+)?} do |id|
      @post = id && Post.get(id) ||
        Post.first({
          :draft => false, 
          :posted_on.lte => Date.today,
          :order => [:posted_on]})

      haml :simple, :layout => false
    end

    # Data routes

    # Post resource routes

    resource Post do
      key :slug
      read_params :title, :slug, :body, :markdown, :tags, :draft, :posted_on, :closed
      write_params :title, :markdown, :tags, :draft, :posted_on, :closed
      
      before :create, :update, :destroy do
        protected!
      end
    end
    
    resource Toy do
      key :slug
      read_params :title, :slug, :description, :markdown, :tags, :javascript, :url, :draft, :posted_on, :closed
      write_params :title, :markdown, :tags, :javascript, :url, :draft, :posted_on, :closed

      before :create, :update, :destroy do
        protected!
      end
    end
    
    resource Session do
      actions :show, :create, :destroy

      def object
        @object ||= Session.new({:username => params[:id], :authenticated => session[:authenticated]})
        @object
      end

      def set_authenticated(value)
        session[:authenticated] = value
        object.authenticated = value
        response.set_cookie("authenticated", {
          :value => value ? ENV['username'] : nil,
          :path => '/'
        })
      end

      create.after do
        set_authenticated true
      end

      destroy.after do
        set_authenticated false
      end
    end

#    get '/posts.json' do
#      options = session[:authenticated] ? {} : {:draft => false, :posted_on.lte => Date.today}
#      @posts = Application::Models::Post.all(options)
#      @posts.to_json
#    end
#
#    get '/post/:id.json' do |id|
#      @post = Application::Models::Post.get(id)
#      @post.to_json
#    end
#
#    def brighten(markdown, theme = 'idle')
#      Net::HTTP.post_form(URI.parse("http://brightly.warptube.com/brighten"), {:markdown => markdown, :theme => theme}).body
#    end

#    post '/post.json' do
#      protected!
#      params.delete("id")
#      params[:draft] = params[:draft] == "on" ? true : false
#      params[:closed] = params[:closed] == "on" ? true : false
#      params[:body] = brighten(params[:markdown])
#      params[:slug] = params[:title]
#      @post = Application::Models::Post.new(params)
#      halt 400, "Something went wrong..." unless @post.save
#      @post.to_json
#    end

#    put '/post/:id.json' do |id|
#      protected!
#      params.delete("id")
#      params[:draft] = params[:draft] == "on" ? true : false
#      params[:closed] = params[:closed] == "on" ? true : false
#      params[:body] = brighten(params[:markdown])
#      params.delete('slug')
#      @post = Application::Models::Post.get(id)
#      @post.attributes = params
#      halt 400, "Something went wrong..." unless @post.save
#      @post.to_json
#    end

#    delete '/post/:id.json' do |id|
#      protected!
#      @post = Application::Models::Post.get(id)
#      halt 404, "Nothing to delete." if @post.nil?
#      halt 401, "Something went wrong..." unless @post.destroy
#    end

    # Toy Routes

#    get '/toys.json' do
#      options = session[:authenticated] ? {} : {:draft => false, :posted_on.lte => Date.today}
#      @toys = Application::Models::Toy.all(options)
#      @toys.to_json
#    end
#
#    get '/toy/:id.json' do |id|
#      @toy = Application::Models::Toy.get(id)
#      @toy.to_json
#    end
#
#    post '/toy.json' do
#      protected!
#      params.delete("id")
#      params[:draft] = params[:draft] == "on" ? true : false
#      params[:closed] = params[:closed] == "on" ? true : false
#      params[:description] = brighten(params[:markdown])
#      params[:slug] = params[:title]
#      @toy = Application::Models::Toy.new(params)
#      halt 400, "Something went wrong..." unless @toy.save
#      @toy.to_json
#    end
#
#    put '/toy/:id.json' do |id|
#      protected!
#      params.delete("id")
#      params[:draft] = params[:draft] == "on" ? true : false
#      params[:closed] = params[:closed] == "on" ? true : false
#      params[:description] = brighten(params[:markdown])
#      params.delete('slug')
#      @toy = Application::Models::Toy.get(id)
#      @toy.attributes = params
#      halt 400, "Something went wrong..." unless @toy.save
#      @toy.to_json
#    end
#
#    delete '/toy/:id.json' do |id|
#      protected!
#      @toy = Application::Models::Toy.get(id)
#      halt 404, "Nothing to delete." if @toy.nil?
#      halt 401, "Something went wrong..." unless @toy.destroy
#    end

    # Session Routes

#    get '/sessions.json' do
#      session[:authenticated] ? '{"authenticated":"true", "username":"' + ENV['username'] + '"}' : "{}"
#    end
#
#    post '/session.json' do
#      halt 401, "Nope." unless ENV['username'] == params[:username] && ENV['password'] == params[:password]
#      session[:authenticated] = true
#      response.set_cookie("authenticated", {
#        :value => true,
#        :path => '/'
#      })
#      '{"authenticated":"true", "username":"' + ENV['username'] + '"}'
#    end
#    
#    delete '/session/:id.json' do
#      response.set_cookie("authenticated", {
#        :value => false,
#        :path => '/'
#      })
#      session[:authenticated] = false
#    end
    

  end
end

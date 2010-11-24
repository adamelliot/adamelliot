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

      # Load configuration (just stores password for now)
      begin
        data = YAML.load_file("#{APP_ROOT}/config/config.yml")
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
        !(request.env["HTTP_USER_AGENT"] =~ /MSIE (8|9|10)/)

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
        redirect "/\##{type.pluralize}/#{model.id}"
      rescue
        raise Sinatra::NotFound
      end
    end

    # Simpler page for the iPhone
    get %r{/simple(/(\w+))?} do |_, id|
      @post = id && Application::Models::Post.first({:slug => id}) ||
        Application::Models::Post.first({
          :draft => false, 
          :posted_on.lte => Time.now + 1.day,
          :order => [:posted_on]})
          
      @post = Post.first({:draft => false})

     throw(:halt, [404, "Not found\n"]) if @post.nil?

      haml :simple, :layout => false
    end

    # Data routes

    # Post resource routes

    resource Post do
      key :slug
      read_attrs :title, :slug, :body, :markdown, :tags, :draft, :posted_on, :closed
      write_attrs :title, :markdown, :tags, :draft, :posted_on, :closed
      
      before :create, :update, :destroy do
#        protected!
      end
    end
    
    resource Toy do
      key :slug
      read_attrs :title, :slug, :description, :markdown, :tags, :javascript, :url, :draft, :posted_on, :closed
      write_attrs :title, :markdown, :tags, :javascript, :url, :draft, :posted_on, :closed

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

  end
end

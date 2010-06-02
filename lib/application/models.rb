require 'date'
require 'active_support'
require 'net/http'

require 'mongo_mapper'
require 'active_support/json'
require 'active_support/inflector'

MongoMapper.connection = Mongo::Connection.new('localhost')
MongoMapper.database = 'adamelliot'

module Application
  module Models
    class Post
      include MongoMapper::Document

      key :title,    String
      key :slug,     String
      key :markdown, String
      key :body,     String
      key :tags,     String

      key :draft,      Boolean
      key :posted_on,  Date
      key :closed,     Boolean

      timestamps!

      before_save :complete_data
      before_create :create_slug
      
      private
        def complete_data
          self.body = Application::Models.brighten(self.markdown)
        end

        def create_slug
          self.slug = self.title.parameterize
        end
    end

    class Toy
      include MongoMapper::Document

      key :title,        String
      key :slug,         String
      key :markdown,     String
      key :description,  String
      key :javascript,   String
      key :url,          String
      key :tags,         String

      key :draft,      Boolean
      key :posted_on,  Date
      key :closed,     Boolean

      timestamps!

      before_create :create_slug
      before_save :complete_data

      private
        def complete_data
          self.description = Application::Models.brighten(self.markdown)
        end
        
        def create_slug
          self.slug = self.title.parameterize
        end
    end

    class Session
      attr_accessor :authenticated, :username, :password

      def initialize(*args)
#        puts args.inspect
        if args.first.class == Hash
          args.first.each do |k,v|
            self.method("#{k}=".to_sym).call v
          end
        end
      end
      
      def save
        username == ENV['username'] && password == ENV['password']
      end
      
      def destroy ; true end

      def to_json(*args)
        {:username => self.username, :authenticated => self.authenticated}.to_json(*args)
      end
    end

    protected
      def self.brighten(markdown, theme = 'idle')
        Net::HTTP.post_form(URI.parse("http://brightly.warptube.com/brighten"), {:markdown => markdown, :theme => theme}).body
      end
  end
end

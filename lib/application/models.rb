require 'date'
require 'rdiscount'
require 'uv'
require 'mongo_mapper'

MongoMapper.connection = Mongo::Connection.new('localhost')
MongoMapper.database = 'adamelliot'

# Allow form value of on to be set to true
MongoMapper::Extensions::Boolean::Mapping['on'] = true
ActiveSupport::JSON::Encoding.use_standard_json_time_format = false

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
        output = ""
        embeds = ""
      
        while !(open = markdown.index(/<code [^>]*language=/m, 0)).nil?
          output << RDiscount.new(markdown[0, open]).to_html

          close = n = open
          begin
            close = markdown.index(/<\/\s*code\s*>/m, close + 1)
            n = markdown.index(/<code [^>]*language=/m, n + 1)
          end while !n.nil? && n < close

          inner_open = open + markdown[/<code[^>]*>/m].length
          inner_close = close
          close = markdown.index(">", close) + 1

          language = markdown[/<code [^>]*language\s*=\s*(['"])([^\1]*?)\1[^>]*>/m, 2]
          embed = markdown[/<code [^>]*embed\s*=\s*(['"])([^\1]*?)\1[^>]*>/m, 2]

          code = markdown[inner_open, inner_close - inner_open]

          output << Uv.parse(code, "xhtml", language, false, theme)
          embeds << embed_code(code, language) unless embed.nil?
          markdown = markdown[close, markdown.length]
        end

        output << RDiscount.new(markdown).to_html

        embeds + output
      rescue
        "There was an error parsing your file, please check it..."
      end
  end
end

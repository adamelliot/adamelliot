require 'dm-core'
require 'dm-types'
require 'nokogiri'
require 'dm-serializer'
require 'date'
require 'active_support'
require 'dm-timestamps'

DataMapper::setup(:default, "sqlite3://#{APP_ROOT}/config/db.sqlite3")

module Site
  module Models
    class Post
      include DataMapper::Resource

      property :id,       Serial
      property :title,    String
      property :markdown, Text
      property :body,     Text
      property :tags,     String

      property :draft,            Boolean
      property :posted_on,        Date
      property :comments_closed,  Boolean

      property :created_at, DateTime
      property :updated_at, DateTime
    end
  end

  class Toy
    include DataMapper::Resource

    property :id,           Serial
    property :title,        String
    property :description,  Text
    property :javascript,   Text
    property :url,          String
    property :tags,         String

    property :draft,            Boolean
    property :posted_on,        Date
    property :comments_closed,  Boolean

    property :created_at, DateTime
    property :updated_at, DateTime
  end

  class Auth
    def all
      {}
    end

    def find(username, password)
      
    end
  end
end

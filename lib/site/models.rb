require 'dm-core'
require 'dm-types'
require 'nokogiri'
require 'dm-serializer'
require 'date'
require 'active_support'

DataMapper::setup(:default, "sqlite3://#{APP_ROOT}/config/db.sqlite3")

module Site
  module Models
    class Post
      include DataMapper::Resource

      property :id,     Serial
      property :title,  String
      property :body,   Text
    end
  end

  class Auth
    def all
      {}
    end

    def find(username, password)
      
    end
  end
end

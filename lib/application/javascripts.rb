require 'sprockets'

module Application
  module Javascripts
  
    class << self
      
      def source
        concatenation.to_s
      end
    
      def install_script
#        JSMin.minify(source)
        concatenation.save_to(asset_path)
      end

      protected
        def secretary
          @secretary ||= Sprockets::Secretary.new({
            :root => APP_ROOT,
            :asset_root => 'public',
            :source_files => ["public/javascripts/application.js"]
          })
        end

        def concatenation
          secretary.reset!
          secretary.concatenation
        end

        def asset_path
          File.join(APP_ROOT, "public", "javascripts", "app.js")
        end

        def source_is_unchanged?
          previous_source_last_modified, @source_last_modified = 
            @source_last_modified, secretary.source_last_modified
          
          previous_source_last_modified == @source_last_modified
        end
    end
  end
end

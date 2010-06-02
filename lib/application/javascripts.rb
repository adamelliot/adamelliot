require 'jsmin'

module Application
  module Javascripts
    APP_SCRIPTS = %w[inflection.js pure_packed.js modernizr-1.1.min.js jquery.tweet.js jquery.ba-hashchange.min.js framework.js menu.js toy.js pics.js controllers.js application.js]
    APP_SCRIPT = 'application.min.js'
    CANVAS_OBJECT_SCRIPTS = %w[canvas_object/color.js canvas_object/events.js canvas_object/geometry.js canvas_object/motion.js canvas_object/canvas_object.js]
    CANVAS_OBJECT_SCRIPT = 'canvas_object.min.js'
    JSMIN = true

    JS_DIR = "#{APP_ROOT}/public/javascripts"

    def self.generate_scripts
      write_script(cat_scripts(APP_SCRIPTS), APP_SCRIPT)
      write_script(cat_scripts(CANVAS_OBJECT_SCRIPTS), CANVAS_OBJECT_SCRIPT)
    end

    private
      def self.cat_scripts(scripts)
        output = ""
        scripts.each do |js|
          path = File.join(JS_DIR, js)
          output << File.read(path) + "\n"
        end
        output
      end
    
      def self.write_script(source, file, jsmin = JSMIN)
        if jsmin
          source = JSMin.minify(source)
        end

        f = File.new(File.join(JS_DIR, file), "w+")
        f.write(source)
        f.close
      end
  end
end
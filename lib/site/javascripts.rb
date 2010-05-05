require 'jsmin'

module Javascripts
  APP_SCRIPTS = %w[inflection.js pure_packed.js modernizr-1.1.min.js jquery.tweet.js jquery.ba-hashchange.min.js framework.js menu.js toy.js controllers.js application.js]
  APP_SCRIPT = 'application.min.js'
  CANVAS_OBJECT_SCRIPTS = %w[canvas_object/color.js canvas_object/events.js canvas_object/geometry.js canvas_object/motion.js canvas_object/canvas_object.js]
  CANVAS_OBJECT_SCRIPT = 'canvas_object.min.js'
  JSMIN = false

  JS_DIR = "#{APP_ROOT}/public/javascripts"

  def generate_scripts
    write_script(cat_scripts(APP_SCRIPTS), APP_SCRIPT)
    write_script(cat_scripts(CANVAS_OBJECT_SCRIPTS), CANVAS_OBJECT_SCRIPT)
  end

  private
    def cat_scripts(scripts)
      scripts.each do |js|
        path = File.join SOURCE_DIR, JS_DIR, "#{js}.js"
        output << File.read(path)
      end
    end
    
    def write_script(source, file, jsmin = JSMIN)
      if jsmin
        source = JSMin.minify(source)
      end

      f = File.new(File.join(JS_DIR, file), "w+")
      f.write(source)
      f.close
    end
  
end

require 'jsmin'

module Javascripts
  CORE_SCRIPTS = %w[]
  CANVAS_OBJECT = %w[]
  
  def cache_javascript(min = true)
    scripts = %w[]
    output = ""

    scripts.each do |js|
      path = File.join SOURCE_DIR, JS_DIR, "#{js}.js"
      output << File.read(path)
    end

    f = File.new(File.join(BUILD_DIR, JS_DIR, "#{STITCHED_FILE}.js"), "w+")
    f.write(output)
    f.close

    output = js_header
    output << JSMin.minify(File.read(File.join(BUILD_DIR, JS_DIR, "#{STITCHED_FILE}.js")))

    f = File.new(File.join(BUILD_DIR, JS_DIR, "#{STITCHED_FILE}.min.js"), "w+")
    f.write(output)
    f.close
  end
end

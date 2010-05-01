String.prototype.camelize = function() {
  return this.replace(/[\-\_]([a-z])/ig, function(z, a) {
    return a.toUpperCase();
  });
};
String.prototype.underscore = function() {
  return (this.charAt(0) + this.substring(1).replace(/([A-Z])/g, function(z, a) {
    return "_" + a;
  })).toLowerCase();
};
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

$(function() {
  var demos = $("#demos");
  
  var demoTemplate = $('#templates .demo').compile({
    'script@src': 'script',
    'canvas@width': 'width',
    'canvas@height': 'height',
    '.toolbar h2': 'title',
    '.toolbar@style': 'width:#{width}px'
  });

  var appendDemo = function(name, width, height, fps) {
    var demos = $("#demos");

    width = width || 640;
    height = height || 360;
    fps = fps || 30;

    var id = name.underscore();
    var block = $(demoTemplate({
      script: 'javascripts/' + id + '.js',
      id: id,
      width: width,
      height: height,
      title: name.capitalize()
    }));
    var play = block.find('.play');
    var stop = block.find('.stop');
    var fps = block.find('.fps .button');
    var canvas = block.find('canvas');

    demos.append(block);
    
    var demo = window[name](canvas.get(0), 30);
    
    play.click(function() { demo.play(); });
    stop.click(function() { demo.stop(); });
    
    setInterval(function() {
      fps.text(demo.fps());
    }, 500);
  };
  
  appendDemo('julia');
  appendDemo('boids');
});


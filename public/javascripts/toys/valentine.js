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
  var hearts = new valentine.Hearts('hearts', 30);
  
  var message = [
    "My Lovely Sandra,",
    "",
    "I'm not a musician, or an",
    "artist so I didn't write you",
    "song or paint you a picture.",
    "I Spend my time with my",
    "head on the Internet",
    "so I made you this",
    "little digital something.",
    "",
    "I miss you lots, and I'll see",
    "you soon. Lot's of love,",
    "Adam"
  ];
  var messageIndex = 0;
  
  function setupCloudMove() {
    var t1 = Math.random() * Math.PI;
    var t2 = Math.random() * Math.PI;
    var s1 = Math.random() * 0.1 +  0.01;
    var s2 = Math.random() * 0.1 +  0.01;

    var x1 = parseInt($("#cloud").css('right'));
    var x2 = parseInt($("#dot1").css('right'));
    var x3 = parseInt($("#dot2").css('right'));
    var x = 0;
  
    var cloud = $("#cloud");
    var dot1 = $("#dot1");
    var dot2 = $("#dot2");
  
    setInterval(function() {
      x += Math.sin(t1 += s1) * 0.5;

      cloud.css('right', x1 + x);
      dot1.css('right', x2 + x * 0.3);
      dot2.css('right', x3 + x * 0.6);
    }, 66);
  }

  var messageInterval = null;
  function addLine() {
    if (messageIndex >= message.length) return;
    var row = $("<div class='message_row'>" + message[messageIndex++] + '</div>');
    $("#message").append(row);
    
    row.hide();
    row.slideDown(1800, function() {
      addLine();
    });
  }
  addLine();

  setupCloudMove.call(this);
});


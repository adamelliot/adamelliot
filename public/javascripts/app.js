/**
 * Application framework for adamelliot.com
 *
 * Uses jQuery and Pure. Backend is Sinatra and Datamapper, everything thin =)
 */

/*
Copyright (c) 2007 Ryan Schuft (ryan.schuft@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
  This code is based in part on the work done in Ruby to support
  infection as part of Ruby on Rails in the ActiveSupport's Inflector
  and Inflections classes.  It was initally ported to Javascript by
  Ryan Schuft (ryan.schuft@gmail.com).

  The code is available at http://code.google.com/p/inflection-js/

  The basic usage is:
    1. Include this script on your web page.
    2. Call functions on any String object in Javascript

  Currently implemented functions:

    String.pluralize(plural) == String
      renders a singular English language noun into its plural form
      normal results can be overridden by passing in an alternative

    String.singularize(singular) == String
      renders a plural English language noun into its singular form
      normal results can be overridden by passing in an alterative

    String.camelize(lowFirstLetter) == String
      renders a lower case underscored word into camel case
      the first letter of the result will be upper case unless you pass true
      also translates "/" into "::" (underscore does the opposite)

    String.underscore() == String
      renders a camel cased word into words seperated by underscores
      also translates "::" back into "/" (camelize does the opposite)

    String.humanize(lowFirstLetter) == String
      renders a lower case and underscored word into human readable form
      defaults to making the first letter capitalized unless you pass true

    String.capitalize() == String
      renders all characters to lower case and then makes the first upper

    String.dasherize() == String
      renders all underbars and spaces as dashes

    String.titleize() == String
      renders words into title casing (as for book titles)

    String.demodulize() == String
      renders class names that are prepended by modules into just the class

    String.tableize() == String
      renders camel cased singular words into their underscored plural form

    String.classify() == String
      renders an underscored plural word into its camel cased singular form

    String.foreign_key(dropIdUbar) == String
      renders a class name (camel cased singular noun) into a foreign key
      defaults to seperating the class from the id with an underbar unless
      you pass true

    String.ordinalize() == String
      renders all numbers found in the string into their sequence like "22nd"
*/

/*
  This function adds plurilization support to every String object
    Signature:
      String.pluralize(plural) == String
    Arguments:
      plural - String (optional) - overrides normal output with said String
    Returns:
      String - singular English language nouns are returned in plural form
    Examples:
      "person".pluralize() == "people"
      "octopus".pluralize() == "octopi"
      "Hat".pluralize() == "Hats"
      "person".pluralize("guys") == "guys"
*/
if(!String.prototype.pluralize)String.prototype.pluralize=function(plural)
{
  var str=this;
  if(plural)str=plural;
  else
  {
    var uncountable=false;
    for(var x=0;!uncountable&&x<this._uncountable_words.length;x++)
      uncountable=(this._uncountable_words[x]==str.toLowerCase());
    if(!uncountable)
    {
      var matched=false;
      for(var x=0;!matched&&x<this._plural_rules.length;x++)
      {
        matched=str.match(this._plural_rules[x][0]);
        if(matched)
          str=str.replace(this._plural_rules[x][0],this._plural_rules[x][1]);
      }
    }
  }
  return str;
};

/*
  This function adds singularization support to every String object
    Signature:
      String.singularize(singular) == String
    Arguments:
      singular - String (optional) - overrides normal output with said String
    Returns:
      String - plural English language nouns are returned in singular form
    Examples:
      "people".singularize() == "person"
      "octopi".singularize() == "octopus"
      "Hats".singularize() == "Hat"
      "guys".singularize("person") == "person"
*/
if(!String.prototype.singularize)
  String.prototype.singularize=function(singular)
  {
    var str=this;
    if(singular)str=singular;
    else
    {
      var uncountable=false;
      for(var x=0;!uncountable&&x<this._uncountable_words.length;x++)
        uncountable=(this._uncountable_words[x]==str.toLowerCase());
      if(!uncountable)
      {
        var matched=false;
        for(var x=0;!matched&&x<this._singular_rules.length;x++)
        {
          matched=str.match(this._singular_rules[x][0]);
          if(matched)
            str=str.replace(this._singular_rules[x][0],
              this._singular_rules[x][1]);
        }
      }
    }
    return str;
  };

/*
  This is a list of nouns that use the same form for both singular and plural.
  This list should remain entirely in lower case to correctly match Strings.
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if(!String.prototype._uncountable_words)String.prototype._uncountable_words=[
  'equipment','information','rice','money','species','series','fish','sheep',
  'moose','deer','news'
];

/*
  These rules translate from the singular form of a noun to its plural form.
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if(!String.prototype._plural_rules)String.prototype._plural_rules=[
  [new RegExp('(m)an$','gi'),'$1en'],
  [new RegExp('(pe)rson$','gi'),'$1ople'],
  [new RegExp('(child)$','gi'),'$1ren'],
  [new RegExp('^(ox)$','gi'),'$1en'],
  [new RegExp('(ax|test)is$','gi'),'$1es'],
  [new RegExp('(octop|vir)us$','gi'),'$1i'],
  [new RegExp('(alias|status)$','gi'),'$1es'],
  [new RegExp('(bu)s$','gi'),'$1ses'],
  [new RegExp('(buffal|tomat|potat)o$','gi'),'$1oes'],
  [new RegExp('([ti])um$','gi'),'$1a'],
  [new RegExp('sis$','gi'),'ses'],
  [new RegExp('(?:([^f])fe|([lr])f)$','gi'),'$1$2ves'],
  [new RegExp('(hive)$','gi'),'$1s'],
  [new RegExp('([^aeiouy]|qu)y$','gi'),'$1ies'],
  [new RegExp('(x|ch|ss|sh)$','gi'),'$1es'],
  [new RegExp('(matr|vert|ind)ix|ex$','gi'),'$1ices'],
  [new RegExp('([m|l])ouse$','gi'),'$1ice'],
  [new RegExp('(quiz)$','gi'),'$1zes'],
  [new RegExp('s$','gi'),'s'],
  [new RegExp('$','gi'),'s']
];

/*
  These rules translate from the plural form of a noun to its singular form.
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if(!String.prototype._singular_rules)String.prototype._singular_rules=[
  [new RegExp('(m)en$','gi'),'$1an'],
  [new RegExp('(pe)ople$','gi'),'$1rson'],
  [new RegExp('(child)ren$','gi'),'$1'],
  [new RegExp('([ti])a$','gi'), '$1um'],
  [new RegExp('((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$',
    'gi'),'$1$2sis'],
  [new RegExp('(hive)s$','gi'), '$1'],
  [new RegExp('(tive)s$','gi'), '$1'],
  [new RegExp('(curve)s$','gi'), '$1'],
  [new RegExp('([lr])ves$','gi'), '$1f'],
  [new RegExp('([^fo])ves$','gi'), '$1fe'],
  [new RegExp('([^aeiouy]|qu)ies$','gi'), '$1y'],
  [new RegExp('(s)eries$','gi'), '$1eries'],
  [new RegExp('(m)ovies$','gi'), '$1ovie'],
  [new RegExp('(x|ch|ss|sh)es$','gi'), '$1'],
  [new RegExp('([m|l])ice$','gi'), '$1ouse'],
  [new RegExp('(bus)es$','gi'), '$1'],
  [new RegExp('(o)es$','gi'), '$1'],
  [new RegExp('(shoe)s$','gi'), '$1'],
  [new RegExp('(cris|ax|test)es$','gi'), '$1is'],
  [new RegExp('(octop|vir)i$','gi'), '$1us'],
  [new RegExp('(alias|status)es$','gi'), '$1'],
  [new RegExp('^(ox)en','gi'), '$1'],
  [new RegExp('(vert|ind)ices$','gi'), '$1ex'],
  [new RegExp('(matr)ices$','gi'), '$1ix'],
  [new RegExp('(quiz)zes$','gi'), '$1'],
  [new RegExp('s$','gi'), '']
];

/*
  This function adds camelization support to every String object
    Signature:
      String.camelize(lowFirstLetter) == String
    Arguments:
      lowFirstLetter - boolean (optional) - default is to capitalize the first
        letter of the results... passing true will lowercase it
    Returns:
      String - lower case underscored words will be returned in camel case
        additionally '/' is translated to '::'
    Examples:
      "message_properties".camelize() == "MessageProperties"
      "message_properties".camelize(true) == "messageProperties"
*/
if(!String.prototype.camelize)
  String.prototype.camelize=function(lowFirstLetter)
  {
    var str=this.toLowerCase();
    var str_path=str.split('/');
    for(var i=0;i<str_path.length;i++)
    {
      var str_arr=str_path[i].split('_');
      var initX=((lowFirstLetter&&i+1==str_path.length)?(1):(0));
      for(var x=initX;x<str_arr.length;x++)
        str_arr[x]=str_arr[x].charAt(0).toUpperCase()+str_arr[x].substring(1);
      str_path[i]=str_arr.join('');
    }
    str=str_path.join('::');
    return str;
  };

/*
  This function adds underscore support to every String object
    Signature:
      String.underscore() == String
    Arguments:
      N/A
    Returns:
      String - camel cased words are returned as lower cased and underscored
        additionally '::' is translated to '/'
    Examples:
      "MessageProperties".camelize() == "message_properties"
      "messageProperties".underscore() == "message_properties"
*/
if(!String.prototype.underscore)
  String.prototype.underscore=function()
  {
    var str=this;
    var str_path=str.split('::');
    var upCase=new RegExp('([ABCDEFGHIJKLMNOPQRSTUVWXYZ])','g');
    var fb=new RegExp('^_');
    for(var i=0;i<str_path.length;i++)
      str_path[i]=str_path[i].replace(upCase,'_$1').replace(fb,'');
    str=str_path.join('/').toLowerCase();
    return str;
  };

/*
  This function adds humanize support to every String object
    Signature:
      String.humanize(lowFirstLetter) == String
    Arguments:
      lowFirstLetter - boolean (optional) - default is to capitalize the first
        letter of the results... passing true will lowercase it
    Returns:
      String - lower case underscored words will be returned in humanized form
    Examples:
      "message_properties".humanize() == "Message properties"
      "message_properties".humanize(true) == "message properties"
*/
if(!String.prototype.humanize)
  String.prototype.humanize=function(lowFirstLetter)
  {
    var str=this.toLowerCase();
    str=str.replace(new RegExp('_id','g'),'');
    str=str.replace(new RegExp('_','g'),' ');
    if(!lowFirstLetter)str=str.capitalize();
    return str;
  };

/*
  This function adds capitalization support to every String object
    Signature:
      String.capitalize() == String
    Arguments:
      N/A
    Returns:
      String - all characters will be lower case and the first will be upper
    Examples:
      "message_properties".capitalize() == "Message_properties"
      "message properties".capitalize() == "Message properties"
*/
if(!String.prototype.capitalize)
  String.prototype.capitalize=function()
  {
    var str=this.toLowerCase();
    str=str.substring(0,1).toUpperCase()+str.substring(1);
    return str;
  };

/*
  This function adds dasherization support to every String object
    Signature:
      String.dasherize() == String
    Arguments:
      N/A
    Returns:
      String - replaces all spaces or underbars with dashes
    Examples:
      "message_properties".capitalize() == "message-properties"
      "Message Properties".capitalize() == "Message-Properties"
*/
if(!String.prototype.dasherize)
  String.prototype.dasherize=function()
  {
    var str=this;
    str=str.replace(new RegExp('[\ _]','g'),'-');
    return str;
  };

/*
  This function adds titleize support to every String object
    Signature:
      String.titleize() == String
    Arguments:
      N/A
    Returns:
      String - capitalizes words as you would for a book title
    Examples:
      "message_properties".titleize() == "Message Properties"
      "message properties to keep".titleize() == "Message Properties to Keep"
*/
if(!String.prototype.titleize)
  String.prototype.titleize=function()
  {
    var str=this.toLowerCase();
    var t=new RegExp('^'+this._non_titlecased_words.join('$|^')+'$','i');
    str=str.replace(new RegExp('_','g'),' ');
    var str_arr=str.split(' ');
    for(var x=0;x<str_arr.length;x++)
    {
      var d=str_arr[x].split('-');
      for(var i=0;i<d.length;i++)if(!d[i].match(t))d[i]=d[i].capitalize();
      str_arr[x]=d.join('-');
    }
    str=str_arr.join(' ');
    str=str.substring(0,1).toUpperCase()+str.substring(1);
    return str;
  };

/*
  This is a list of words that should not be capitalized for title case.
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if(!String.prototype._non_titlecased_words)
  String.prototype._non_titlecased_words=[
    'and','or','nor','a','an','the','so','but','to','of','at','by','from',
    'into','on','onto','off','out','in','over','with','for'
  ];

/*
  This function adds demodulize support to every String object
    Signature:
      String.demodulize() == String
    Arguments:
      N/A
    Returns:
      String - removes module names leaving only class names (Ruby style)
    Examples:
      "Message::Bus::Properties".demodulize() == "Properties"
*/
if(!String.prototype.demodulize)
  String.prototype.demodulize=function()
  {
    var str=this;
    var str_arr=str.split('::');
    str=str_arr[str_arr.length-1];
    return str;
  };

/*
  This function adds tableize support to every String object
    Signature:
      String.tableize() == String
    Arguments:
      N/A
    Returns:
      String - renders camel cased words into their underscored plural form
    Examples:
      "MessageBusProperty".tableize() == "message_bus_properties"
*/
if(!String.prototype.tableize)
  String.prototype.tableize=function()
  {
    var str=this;
    str=str.underscore().pluralize();
    return str;
  };

/*
  This function adds classification support to every String object
    Signature:
      String.classify() == String
    Arguments:
      N/A
    Returns:
      String - underscored plural nouns become the camel cased singular form
    Examples:
      "message_bus_properties".classify() == "MessageBusProperty"
*/
if(!String.prototype.classify)
  String.prototype.classify=function()
  {
    var str=this;
    str=str.camelize().singularize();
    return str;
  };

/*
  This function adds foreign key support to every String object
    Signature:
      String.foreign_key(dropIdUbar) == String
    Arguments:
      dropIdUbar - boolean (optional) - default is to seperate id with an
        underbar at the end of the class name, you can pass true to skip it
    Returns:
      String - camel cased singular class names become underscored with id
    Examples:
      "MessageBusProperty".foreign_key() == "message_bus_property_id"
      "MessageBusProperty".foreign_key(true) == "message_bus_propertyid"
*/
if(!String.prototype.foreign_key)
  String.prototype.foreign_key=function(dropIdUbar)
  {
    var str=this;
    str=str.demodulize().underscore()+((dropIdUbar)?(''):('_'))+'id';
    return str;
  };

/*
  This function adds ordinalize support to every String object
    Signature:
      String.ordinalize() == String
    Arguments:
      N/A
    Returns:
      String - renders all found numbers their sequence like "22nd"
    Examples:
      "the 1 pitch".ordinalize() == "the 1st pitch"
*/
if(!String.prototype.ordinalize)
  String.prototype.ordinalize=function()
  {
    var str=this;
    var str_arr=str.split(' ');
    for(var x=0;x<str_arr.length;x++)
    {
	var i=parseInt(str_arr[x]);
        if(""+i!="NaN")
        {
          var ltd=str_arr[x].substring(str_arr[x].length-2);
          var ld=str_arr[x].substring(str_arr[x].length-1);
          var suf="th";
          if(ltd!="11"&&ltd!="12"&&ltd!="13")
          {
            if(ld=="1")suf="st";
            else if(ld=="2")suf="nd";
            else if(ld=="3")suf="rd";
          }
          str_arr[x]+=suf;
        }
    }
    str=str_arr.join(' ');
    return str;
  };

/*!
    PURE Unobtrusive Rendering Engine for HTML

    Licensed under the MIT licenses.
    More information at: http://www.opensource.org

    Copyright (c) 2010 Michael Cvilic - BeeBole.com

	Thanks to Rog Peppe for the functional JS jump
    revision: 2.56
*/
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('9 $p,3o=$p=6(){9 a=3h[0],25=J;7(y a===\'14\'){25=3h[1]||J}8 $p.3g(a,25)};$p.3g=6(q,r,t){9 t=3c(),1k=[];3a(y q){16\'14\':1k=t.L(r||F,q);7(1k.x===0){G(\'2d 2f "\'+q+\'" 39 2C 38\')}19;16\'B\':G(\'2d 37 47 1J 2f 2r B, 3s 2s W\');19;4L:1k=q}E(9 i=0,Q=1k.x;i<Q;i++){t[i]=1k[i]}t.x=Q;9 u=\'4T\'+24.36(24.35()*34)+\'2i\',2j=\'3B\'+24.36(24.35()*34)+\'2i\',2k=/^(\\+)?([^\\@\\+]+)?\\@?([^\\+]+)?(\\+)?$/,33={4n:\'4t\',4v:\'32\'},1q=2u.1q?6(o){8 2u.1q(o)}:6(o){8 41.T.46.1M(o)==="[4l 2u]"};8 t;6 G(e){7(y 31!==\'B\'){31.4u(e);44}4w(\'3o G: \'+e);}6 3c(){9 a=$p.Y,f=6(){};f.T=a;f.T.H=a.H||H;f.T.N=a.N||N;f.T.O=a.O||O;f.T.L=a.L||L;f.T.42=1A;f.T.45=G;8 30 f()}6 1X(a){8 a.1X||30 48().4a(a)}6 1v(b,f){8 6(a){8 b(\'\'+f.1M(A,a))}}6 L(n,a){7(y n===\'14\'){a=n;n=J}7(y F.2Y!==\'B\'){8(n||F).2Y(a)}C{G(\'4H 4J 17 2X 3r 28: 3t, 3u.5+, 3w+ 3x 3y+\\n\\3z 3A 2X 29 2s 3G, 3H 3K a 3L 3M/3N 28 a 3O W 40\')}}6 2c(c,d){8 6(a){9 b=[c[0]],n=c.x,1U,1w,1P,13;E(9 i=1;i<n;i++){1U=d[i].1M(A,a);1w=c[i];7(1U===\'\'){1P=b[b.x-1];7((13=1P.49(/[^\\s]+=\\"?$/))>-1){b[b.x-1]=1P.2n(0,13);1w=1w.4m(1)}}b[b.x]=1U;b[b.x]=1w}8 b.2o(\'\')}}6 2W(p){9 m=p.1K(/^(\\w+)\\s*<-\\s*(\\S+)?$/);7(m===1h){G(\'2y 1b 4S: "\'+p+\'"\')}7(m[1]===\'X\'){G(\'"X<-..." 2r a 4X 50 E 1J 54 55 56.\\n\\57 3p 3q 2F E 2s 1b.\')}7(!m[2]||(m[2]&&(/1f/i).17(m[2]))){m[2]=6(a){8 a.1f}}8{2F:m[1],15:m[2]}}6 1d(c){7(y(c)===\'6\'){8 c}9 m=c.1K(/^[a-3v-Z\\$2i\\@][\\w\\$:-]*(\\.[\\w\\$:-]*[^\\.])*$/);7(m===1h){9 d=J,s=c,23=[],1g=[],i=0,2a;7(/\\\'|\\"/.17(s.2S(0))){7(/\\\'|\\"/.17(s.2S(s.x-1))){2a=s.2n(1,s.x-1);8 6(){8 2a}}}C{1s((m=s.1K(/#\\{([^{}]+)\\}/))!==1h){d=18;23[i++]=s.2R(0,m.2Q);1g[i]=1d(m[1]);s=s.2R(m.2Q+m[0].x,s.x)}}7(!d){G(\'2y 3J W 2P: \'+c)}23[i]=s;8 2c(23,1g)}m=c.1B(\'.\');8 6(a){9 b=a.1f||a,v=a[m[0]],i=0;7(v&&v.X){i+=1;7(m[i]===\'13\'){8 v.13}C{b=v.X}}9 n=m.x;E(;i<n;i++){7(!b){19}b=b[m[i]]}8(!b&&b!==0)?\'\':b}}6 1H(c,d,e){9 f,R,W,D,P,M=[];7(y d===\'14\'){f=d;9 m=d.1K(2k);7(!m){G(\'2y W 2P: \'+d)}R=m[1];W=m[2];D=m[3];P=m[4];7(W===\'.\'||(!W&&D)){M[0]=c}C{M=t.L(c,W)}7(!M||M.x===0){8 G(\'2d 1t "\'+d+\'" 39 2C 38 1l 1J 2f:\\n\'+1X(c).1c(/\\t/g,\'  \'))}}C{R=d.R;D=d.D;P=d.P;M=[c]}7(R||P){7(R&&P){G(\'P/R 27 4b 4c 4d 1J 4f 4g\')}C 7(e){G(\'4h P/R/1c 4i 4j E 1b M\')}C 7(P&&e){G(\'27 P 28 1b (15: \'+f+\')\')}}9 g,1m,U,1x,1y,1z,11;7(D){1x=(/^2b$/i).17(D);1y=(/^4z$/i).17(D);1z=1y?\'1n\':D;g=6(a,s){a.4C(2j+D,s);7(1z 1l a&&!1x){a[1z]=\'\'}7(a.2O===1){a.2N(D);1y&&a.2N(1z)}};7(1x||1y){7(1x){1m=6(n){8 n.2b.4K}}C{1m=6(n){8 n.1n}}U=6(s){8 s.1c(/\\"/g,\'&2M;\')}}C{1m=6(n){8 n.4N(D)};U=6(s){8 s.1c(/\\"/g,\'&2M;\').1c(/\\s/g,\'&4P;\')}}7(R){11=6(a,s){g(a,s+1m(a))}}C 7(P){11=6(a,s){g(a,1m(a)+s)}}C{11=6(a,s){g(a,s)}}}C{7(e){11=6(a,s){9 b=a.2K;7(b){b.2h(F.1Q(s),a.4Y);b.1R(a)}}}C{7(R){11=6(a,s){a.2h(F.1Q(s),a.1E)}}C 7(P){11=6(a,s){a.2l(F.1Q(s))}}C{11=6(a,s){1s(a.1E){a.1R(a.1E)}a.2l(F.1Q(s))}}}U=6(s){8 s}}8{D:D,K:M,2J:11,15:f,U:U}}6 1G(a,n){9 b=u+n+\':\';E(9 i=0;i<a.K.x;i++){a.2J(a.K[i],b)}}6 2p(j,k,l,m,n){8 6(g){9 a=k(g),2t=g[j],1Y={1Z:a},2v=0,x,2w=[],2x=6(b,c,d,e){9 f=g.13,2H=g.X,3n=g.1Z;g.13=c.13=b;g.X=c.X=a[b];g.1Z=a;y e!==\'B\'&&(g.x=e);7(y d===\'6\'&&d.1M(g.X,g)===J){2v++;8}2w.2A(l.1M(g.X,g));g.13=f;g.X=2H;g.1Z=3n};g[j]=1Y;7(1q(a)){x=a.x||0;7(y m===\'6\'){a.21(m)}E(9 i=0,Q=x;i<Q;i++){2x(i,1Y,n,x-2v)}}C{7(a&&y m!==\'B\'){G(\'21 2r 3C 3D 29 3E, 2C 3F\')}E(9 h 1l a){a.2D(h)&&2x(h,1Y,n)}}y 2t!==\'B\'?g[j]=2t:3I g[j];8 2w.2o(\'\')}}6 2E(a,b,c,d){9 e=J,1r,2z,1I,I;E(I 1l c){7(c.2D(I)){7(I===\'21\'){2z=c.21;2I}C 7(I===\'1I\'){1I=c.1I;2I}7(e){G(\'27 3P 3Q 3R 3S 1b 29 a M\')}1r=I;e=18}}7(!1r){G(\'3T 1l 1J W: \'+b+\'\\3U 3V 3W 3X 3Y a 14, a 6 3Z a 1b(<-)\')}9 f=c[1r];7(y(f)===\'14\'||y(f)===\'6\'){c={};c[1r]={37:f};8 2E(a,b,c,d)}9 g=2W(1r),1D=1d(g.15),M=1H(a,b,18),K=M.K;E(i=0;i<K.x;i++){9 h=K[i],1C=1A(h,f);d[d.x]=1v(M.U,2p(g.2F,1D,1C,2z,1I));M.K=[h];1G(M,d.x-1)}}6 2L(n,d){9 e=n.43(\'*\'),2e=[],1o={a:[],l:{}},z,1N,i,Q,j,1i,12,1O,2q;E(i=-1,Q=e.x;i<Q;i++){12=i>-1?e[i]:n;7(12.2O===1&&12.1n!==\'\'){1O=12.1n.1B(\' \');E(j=0,1i=1O.x;j<1i;j++){2q=1O[j];z=2T(2q,12.2U);7(z!==J){1N=(/4e/i).17(z.D);7(z.15.2V(\'@\')>-1||1N){12.1n=12.1n.1c(\'@\'+z.D,\'\');7(1N){z.D=J}}2e.2A({n:12,z:z})}}}}8 2e;6 2T(c,a){9 b=c.1K(2k),D=b[3]||33[a],z={R:!!b[1],I:b[2],D:D,P:!!b[4],15:c},i,Q,20,22,V;E(i=1o.a.x-1;i>=0;i--){20=1o.a[i];22=20.l[0];V=22&&22[z.I];7(y V!==\'B\'){z.I=20.p+\'.\'+z.I;7(1o.l[z.I]===18){V=V[0]}19}}7(y V===\'B\'){V=1d(z.I)(1q(d)?d[0]:d);7(V===\'\'){8 J}}7(1q(V)){1o.a.2A({l:V,p:z.I});1o.l[z.I]=18;z.t=\'1b\'}C{z.t=\'2Z\'}8 z}}6 1A(a,b,c,d){9 e=[];d=d||c&&2L(a,c);7(c){9 j,1i,z,n,f,K,1D,1t,1C;1s(d.x>0){z=d[0].z;n=d[0].n;d.4k(0,1);7(z.t===\'2Z\'){f=1H(n,z,J);1G(f,e.x);e[e.x]=1v(f.U,1d(z.I))}C{1D=1d(z.15);f=1H(n,z,18);K=f.K;E(j=0,1i=K.x;j<1i;j++){1t=K[j];1C=1A(1t,J,c,d);e[e.x]=1v(f.U,2p(z.15,1D,1C));f.K=[1t];1G(f,e.x-1)}}}}9 f,1p,1W,2m,i;E(9 g 1l b){7(b.2D(g)){i=0;1p=b[g];7(y(1p)===\'6\'||y(1p)===\'14\'){1W=g.1B(/\\s*,\\s*/);2m=1W.x;4o{g=1W[i];f=1H(a,g,J);1G(f,e.x);e[e.x]=1v(f.U,1d(1p))}1s(++i<2m)}C{2E(a,g,1p,e)}}}9 h=1X(a),1g=[];h=h.1c(/<([^>]+)\\s(32\\=""|4p)\\s?([^>]*)>/4q,"<$1 $3>");h=h.1B(2j).2o(\'\');9 k=h.1B(u),p;E(9 i=1;i<k.x;i++){p=k[i];1g[i]=e[4r(p,10)];k[i]=p.2n(p.2V(\':\')+1)}8 2c(k,1g)}6 H(b,c,d){9 e=1A((d||A[0]).4s(18),b,c);8 6(a){8 e({1f:a})}}6 N(a,b){9 c=y b===\'6\'&&b,i=0,Q=A.x;E(;i<Q;i++){A[i]=2g(A[i],(c||t.H(b,J,A[i]))(a,J))}1f=1h;8 A}6 O(a,b){9 c=t.H(b,a,A[0]);E(9 i=0,Q=A.x;i<Q;i++){A[i]=2g(A[i],c(a,J))}1f=1h;8 A}6 2g(a,b){9 c,1V=a.2K,1F=0;3a(a.2U){16\'1u\':16\'4x\':16\'4y\':b=\'<1e>\'+b+\'</1e>\';1F=1;19;16\'2B\':b=\'<1e><1u>\'+b+\'</1u></1e>\';1F=2;19;16\'4A\':16\'4B\':b=\'<1e><1u><2B>\'+b+\'</2B></1u></1e>\';1F=3;19}1j=F.4D(\'4E\');1j.2b.4F=\'4G\';F.26.2l(1j);1j.4I=b;c=1j.1E;1s(1F--){c=c.1E}1V.2h(c,a);1V.1R(a);F.26.1R(1j);a=c;c=1V=1h;8 a}};$p.Y={};$p.3b={1S:6(){7(y F.1a===\'B\'){$p.Y.L=6(n,a){8 1S.4M(a,n)}}},3d:6(){7(y F.1a===\'B\'){$p.Y.L=6(n,a){8 $(n).4O(a)}}3e.4Q({4R:[\'H\',\'N\',\'O\'],H:6(a,b){8 $p([A]).H(a,b)},N:6(a,b){8 $($p([A]).N(a,b))[0]},O:6(a,b){8 $($p([A]).O(a,b))[0]}})},3f:6(){7(y F.1a===\'B\'){$p.Y.L=6(n,a){8 1L(n).L(a)}}1L.4U.4V({4W:6(a){A.1T=a;8 A},H:6(a,b){8 $p(A).H(A.1T||a,b)},N:6(a,b){8 1L($p(A).N(a,A.1T||b))},O:6(a,b){8 1L($p(A).O(a,A.1T||b))}})},3i:6(){7(y F.1a===\'B\'){$p.Y.L=6(n,a){8 $(n).4Z(a)}}3j.51({H:6(a,b){8 $p(A).H(a,b)},N:6(a,b){8 $p(A).N(a,b)},O:6(a,b){8 $p(A).O(a,b)}})},T:6(){7(y F.1a===\'B\'){$p.Y.L=6(n,a){n=n===F?n.26:n;8 y n===\'14\'?$$(n):$(n).52(a)}}3j.53({H:6(a,b,c){8 $p([a]).H(b,c)},N:6(a,b,c){8 $p([a]).N(b,c)},O:6(a,b,c){8 $p([a]).O(b,c)}})},3k:6(){7(y F.1a===\'B\'){$p.Y.L=6(n,a){8 3l(a,n)}}},3m:6(){7(y F.1a===\'B\'){$p.Y.L=6(n,a){8 2G(a,n)}}}};(6(){9 a=y 1S!==\'B\'&&\'1S\'||y 3e!==\'B\'&&\'3d\'||y 1L!==\'B\'&&\'3f\'||y 58!==\'B\'&&\'3i\'||y 59!==\'B\'&&\'T\'||y 3l!==\'B\'&&\'3k\'||y 2G!==\'B\'&&\'3m\';a&&$p.3b[a]()})();',62,320,'||||||function|if|return|var||||||||||||||||||||||||length|typeof|cspec|this|undefined|else|attr|for|document|error|compile|prop|false|nodes|find|target|render|autoRender|append|ii|prepend||prototype|quotefn|val|selector|item|plugins|||setfn|ni|pos|string|sel|case|test|true|break|querySelector|loop|replace|dataselectfn|TABLE|context|pfns|null|jj|tmp|templates|in|getstr|className|openLoops|dsel|isArray|ls|while|node|TBODY|wrapquote|pVal|isStyle|isClass|attName|compiler|split|inner|itersel|firstChild|depth|setsig|gettarget|filter|the|match|jQuery|call|isNodeValue|cs|attLine|createTextNode|removeChild|dojo|_pure_d|fnVal|ep|sels|outerHTML|temp|items|loopi|sort|loopil|parts|Math|ctxt|body|cannot|with|on|retStr|style|concatenator|The|an|template|replaceWith|insertBefore|_|attPfx|selRx|appendChild|sl|substring|join|loopfn|cj|is|your|old|Array|filtered|strs|buildArg|bad|sorter|push|TR|not|hasOwnProperty|loopgen|name|Sly|save_item|continue|set|parentNode|getAutoNodes|quot|removeAttribute|nodeType|syntax|index|slice|charAt|checkClass|tagName|indexOf|parseloopspec|PURE|querySelectorAll|str|new|console|value|autoAttr|1000000|random|floor|root|found|was|switch|libs|getPlugins|domassistant|DOMAssistant|jquery|core|arguments|mootools|Element|sizzle|Sizzle|sly|save_items|pure|choose|another|standalone|check|iPhone|FF3|zA|Safari4|and|IE8|nTo|run|_a|only|available|arrays|objects|browser|you|delete|data|need|JS|library|framework|CSS|have|more|than|one|Error|nA|directive|action|must|be|or|engine|Object|_compiler|getElementsByTagName|debugger|_error|toString|of|XMLSerializer|search|serializeToString|take|place|at|nodevalue|same|time|no|modifiers|allowed|splice|object|substr|IMG|do|selected|ig|parseInt|cloneNode|src|log|INPUT|throw|THEAD|TFOOT|class|TD|TH|setAttribute|createElement|SPAN|display|none|You|innerHTML|can|cssText|default|query|getAttribute|cssSelect|nbsp|attach|publicMethods|spec|_s|fn|extend|directives|reserved|nextSibling|getElements|word|implement|select|addMethods|current|running|iteration|nPlease|MooTools|Prototype'.split('|'),0,{}))
/*
 * Modernizr v1.6
 * http://www.modernizr.com
 *
 * Developed by:
 * - Faruk Ates  http://farukat.es/
 * - Paul Irish  http://paulirish.com/
 *
 * Copyright (c) 2009-2010
 * Dual-licensed under the BSD or MIT licenses.
 * http://www.modernizr.com/license/
 */
window.Modernizr=function(i,e,u){function s(a,b){return(""+a).indexOf(b)!==-1}function D(a,b){for(var c in a)if(j[a[c]]!==u&&(!b||b(a[c],E)))return true}function n(a,b){var c=a.charAt(0).toUpperCase()+a.substr(1);c=(a+" "+F.join(c+" ")+c).split(" ");return!!D(c,b)}function S(){f.input=function(a){for(var b=0,c=a.length;b<c;b++)L[a[b]]=!!(a[b]in h);return L}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" "));f.inputtypes=function(a){for(var b=0,c,k=a.length;b<
k;b++){h.setAttribute("type",a[b]);if(c=h.type!=="text"){h.value=M;if(/^range$/.test(h.type)&&h.style.WebkitAppearance!==u){l.appendChild(h);c=e.defaultView;c=c.getComputedStyle&&c.getComputedStyle(h,null).WebkitAppearance!=="textfield"&&h.offsetHeight!==0;l.removeChild(h)}else/^(search|tel)$/.test(h.type)||(c=/^(url|email)$/.test(h.type)?h.checkValidity&&h.checkValidity()===false:h.value!=M)}N[a[b]]=!!c}return N}("search tel url email datetime date month week time datetime-local number range color".split(" "))}
var f={},l=e.documentElement,E=e.createElement("modernizr"),j=E.style,h=e.createElement("input"),M=":)",O=Object.prototype.toString,q=" -webkit- -moz- -o- -ms- -khtml- ".split(" "),F="Webkit Moz O ms Khtml".split(" "),v={svg:"http://www.w3.org/2000/svg"},d={},N={},L={},P=[],w,Q=function(a){var b=document.createElement("style"),c=e.createElement("div");b.textContent=a+"{#modernizr{height:3px}}";(e.head||e.getElementsByTagName("head")[0]).appendChild(b);c.id="modernizr";l.appendChild(c);a=c.offsetHeight===
3;b.parentNode.removeChild(b);c.parentNode.removeChild(c);return!!a},o=function(){var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return function(b,c){c=c||document.createElement(a[b]||"div");b="on"+b;var k=b in c;if(!k){c.setAttribute||(c=document.createElement("div"));if(c.setAttribute&&c.removeAttribute){c.setAttribute(b,"");k=typeof c[b]=="function";if(typeof c[b]!="undefined")c[b]=u;c.removeAttribute(b)}}return k}}(),G={}.hasOwnProperty,R;R=
typeof G!=="undefined"&&typeof G.call!=="undefined"?function(a,b){return G.call(a,b)}:function(a,b){return b in a&&typeof a.constructor.prototype[b]==="undefined"};d.flexbox=function(){var a=e.createElement("div"),b=e.createElement("div");(function(k,g,r,x){g+=":";k.style.cssText=(g+q.join(r+";"+g)).slice(0,-g.length)+(x||"")})(a,"display","box","width:42px;padding:0;");b.style.cssText=q.join("box-flex:1;")+"width:10px;";a.appendChild(b);l.appendChild(a);var c=b.offsetWidth===42;a.removeChild(b);
l.removeChild(a);return c};d.canvas=function(){var a=e.createElement("canvas");return!!(a.getContext&&a.getContext("2d"))};d.canvastext=function(){return!!(f.canvas&&typeof e.createElement("canvas").getContext("2d").fillText=="function")};d.webgl=function(){var a=e.createElement("canvas");try{if(a.getContext("webgl"))return true}catch(b){}try{if(a.getContext("experimental-webgl"))return true}catch(c){}return false};d.touch=function(){return"ontouchstart"in i||Q("@media ("+q.join("touch-enabled),(")+
"modernizr)")};d.geolocation=function(){return!!navigator.geolocation};d.postmessage=function(){return!!i.postMessage};d.websqldatabase=function(){return!!i.openDatabase};d.indexedDB=function(){for(var a=-1,b=F.length;++a<b;){var c=F[a].toLowerCase();if(i[c+"_indexedDB"]||i[c+"IndexedDB"])return true}return false};d.hashchange=function(){return o("hashchange",i)&&(document.documentMode===u||document.documentMode>7)};d.history=function(){return!!(i.history&&history.pushState)};d.draganddrop=function(){return o("drag")&&
o("dragstart")&&o("dragenter")&&o("dragover")&&o("dragleave")&&o("dragend")&&o("drop")};d.websockets=function(){return"WebSocket"in i};d.rgba=function(){j.cssText="background-color:rgba(150,255,150,.5)";return s(j.backgroundColor,"rgba")};d.hsla=function(){j.cssText="background-color:hsla(120,40%,100%,.5)";return s(j.backgroundColor,"rgba")||s(j.backgroundColor,"hsla")};d.multiplebgs=function(){j.cssText="background:url(//:),url(//:),red url(//:)";return/(url\s*\(.*?){3}/.test(j.background)};d.backgroundsize=
function(){return n("backgroundSize")};d.borderimage=function(){return n("borderImage")};d.borderradius=function(){return n("borderRadius","",function(a){return s(a,"orderRadius")})};d.boxshadow=function(){return n("boxShadow")};d.textshadow=function(){return e.createElement("div").style.textShadow===""};d.opacity=function(){var a=q.join("opacity:.5;")+"";j.cssText=a;return s(j.opacity,"0.5")};d.cssanimations=function(){return n("animationName")};d.csscolumns=function(){return n("columnCount")};d.cssgradients=
function(){var a=("background-image:"+q.join("gradient(linear,left top,right bottom,from(#9f9),to(white));background-image:")+q.join("linear-gradient(left top,#9f9, white);background-image:")).slice(0,-17);j.cssText=a;return s(j.backgroundImage,"gradient")};d.cssreflections=function(){return n("boxReflect")};d.csstransforms=function(){return!!D(["transformProperty","WebkitTransform","MozTransform","OTransform","msTransform"])};d.csstransforms3d=function(){var a=!!D(["perspectiveProperty","WebkitPerspective",
"MozPerspective","OPerspective","msPerspective"]);if(a)a=Q("@media ("+q.join("transform-3d),(")+"modernizr)");return a};d.csstransitions=function(){return n("transitionProperty")};d.fontface=function(){var a,b=e.head||e.getElementsByTagName("head")[0]||l,c=e.createElement("style"),k=e.implementation||{hasFeature:function(){return false}};c.type="text/css";b.insertBefore(c,b.firstChild);a=c.sheet||c.styleSheet;b=k.hasFeature("CSS2","")?function(g){if(!(a&&g))return false;var r=false;try{a.insertRule(g,
0);r=!/unknown/i.test(a.cssRules[0].cssText);a.deleteRule(a.cssRules.length-1)}catch(x){}return r}:function(g){if(!(a&&g))return false;a.cssText=g;return a.cssText.length!==0&&!/unknown/i.test(a.cssText)&&a.cssText.replace(/\r+|\n+/g,"").indexOf(g.split(" ")[0])===0};f._fontfaceready=function(g){g(f.fontface)};return b('@font-face { font-family: "font"; src: "font.ttf"; }')};d.video=function(){var a=e.createElement("video"),b=!!a.canPlayType;if(b){b=new Boolean(b);b.ogg=a.canPlayType('video/ogg; codecs="theora"');
b.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"')||a.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');b.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"')}return b};d.audio=function(){var a=e.createElement("audio"),b=!!a.canPlayType;if(b){b=new Boolean(b);b.ogg=a.canPlayType('audio/ogg; codecs="vorbis"');b.mp3=a.canPlayType("audio/mpeg;");b.wav=a.canPlayType('audio/wav; codecs="1"');b.m4a=a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")}return b};d.localstorage=function(){try{return"localStorage"in
i&&i.localStorage!==null}catch(a){return false}};d.sessionstorage=function(){try{return"sessionStorage"in i&&i.sessionStorage!==null}catch(a){return false}};d.webWorkers=function(){return!!i.Worker};d.applicationcache=function(){return!!i.applicationCache};d.svg=function(){return!!e.createElementNS&&!!e.createElementNS(v.svg,"svg").createSVGRect};d.inlinesvg=function(){var a=document.createElement("div");a.innerHTML="<svg/>";return(a.firstChild&&a.firstChild.namespaceURI)==v.svg};d.smil=function(){return!!e.createElementNS&&
/SVG/.test(O.call(e.createElementNS(v.svg,"animate")))};d.svgclippaths=function(){return!!e.createElementNS&&/SVG/.test(O.call(e.createElementNS(v.svg,"clipPath")))};for(var H in d)if(R(d,H)){w=H.toLowerCase();f[w]=d[H]();P.push((f[w]?"":"no-")+w)}f.input||S();f.crosswindowmessaging=f.postmessage;f.historymanagement=f.history;f.addTest=function(a,b){a=a.toLowerCase();if(!f[a]){b=!!b();l.className+=" "+(b?"":"no-")+a;f[a]=b;return f}};j.cssText="";E=h=null;i.attachEvent&&function(){var a=e.createElement("div");
a.innerHTML="<elem></elem>";return a.childNodes.length!==1}()&&function(a,b){function c(p){for(var m=-1;++m<r;)p.createElement(g[m])}function k(p,m){for(var I=p.length,t=-1,y,J=[];++t<I;){y=p[t];m=y.media||m;J.push(k(y.imports,m));J.push(y.cssText)}return J.join("")}var g="abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video".split("|"),r=g.length,x=RegExp("<(/*)(abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video)",
"gi"),T=RegExp("\\b(abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video)\\b(?!.*[;}])","gi"),z=b.createDocumentFragment(),A=b.documentElement,K=A.firstChild,B=b.createElement("style"),C=b.createElement("body");B.media="all";c(b);c(z);a.attachEvent("onbeforeprint",function(){for(var p=-1;++p<r;)for(var m=b.getElementsByTagName(g[p]),I=m.length,t=-1;++t<I;)if(m[t].className.indexOf("iepp_")<0)m[t].className+=" iepp_"+
g[p];K.insertBefore(B,K.firstChild);B.styleSheet.cssText=k(b.styleSheets,"all").replace(T,".iepp_$1");z.appendChild(b.body);A.appendChild(C);C.innerHTML=z.firstChild.innerHTML.replace(x,"<$1bdo")});a.attachEvent("onafterprint",function(){C.innerHTML="";A.removeChild(C);K.removeChild(B);A.appendChild(z.firstChild)})}(this,document);f._enableHTML5=true;f._version="1.6";l.className=l.className.replace(/\bno-js\b/,"")+" js";l.className+=" "+P.join(" ");return f}(this,this.document);
(function($) {

  $.fn.tweet = function(o){
    var s = {
      username: ["seaofclouds"],              // [string]   required, unless you want to display our tweets. :) it can be an array, just do ["username1","username2","etc"]
      list: null,                              //[string]   optional name of list belonging to username
      avatar_size: null,                      // [integer]  height and width of avatar if displayed (48px max)
      count: 3,                               // [integer]  how many tweets to display?
      intro_text: null,                       // [string]   do you want text BEFORE your your tweets?
      outro_text: null,                       // [string]   do you want text AFTER your tweets?
      join_text:  null,                       // [string]   optional text in between date and tweet, try setting to "auto"
      auto_join_text_default: "i said,",      // [string]   auto text for non verb: "i said" bullocks
      auto_join_text_ed: "i",                 // [string]   auto text for past tense: "i" surfed
      auto_join_text_ing: "i am",             // [string]   auto tense for present tense: "i was" surfing
      auto_join_text_reply: "i replied to",   // [string]   auto tense for replies: "i replied to" @someone "with"
      auto_join_text_url: "i was looking at", // [string]   auto tense for urls: "i was looking at" http:...
      loading_text: null,                     // [string]   optional loading text, displayed while tweets load
      query: null                             // [string]   optional search query
    };

    if(o) $.extend(s, o);

    $.fn.extend({
      linkUrl: function() {
        var returning = [];
        var regexp = /((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi;
        this.each(function() {
          returning.push(this.replace(regexp,"<a href=\"$1\">$1</a>"));
        });
        return $(returning);
      },
      linkUser: function() {
        var returning = [];
        var regexp = /[\@]+([A-Za-z0-9-_]+)/gi;
        this.each(function() {
          returning.push(this.replace(regexp,"<a href=\"http://twitter.com/$1\">@$1</a>"));
        });
        return $(returning);
      },
      linkHash: function() {
        var returning = [];
        var regexp = / [\#]+([A-Za-z0-9-_]+)/gi;
        this.each(function() {
          returning.push(this.replace(regexp, ' <a href="http://search.twitter.com/search?q=&tag=$1&lang=all&from='+s.username.join("%2BOR%2B")+'">#$1</a>'));
        });
        return $(returning);
      },
      capAwesome: function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(/\b(awesome)\b/gi, '<span class="awesome">$1</span>'));
        });
        return $(returning);
      },
      capEpic: function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(/\b(epic)\b/gi, '<span class="epic">$1</span>'));
        });
        return $(returning);
      },
      makeHeart: function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(/(&lt;)+[3]/gi, "<tt class='heart'>&#x2665;</tt>"));
        });
        return $(returning);
      }
    });

    function parse_date(date_str) {
      return Date.parse(date_str.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'));
    }

    function relative_time(time_value) {
      var parsed_date = parse_date(time_value);
      var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
      var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
      var pluralize = function (singular, n) {
        return '' + n + ' ' + singular + (n == 1 ? '' : 's');
      };
      if(delta < 60) {
      return 'less than a minute ago';
      } else if(delta < (60*60)) {
      return 'about ' + pluralize("minute", parseInt(delta / 60)) + ' ago';
      } else if(delta < (24*60*60)) {
      return 'about ' + pluralize("hour", parseInt(delta / 3600)) + ' ago';
      } else {
      return 'about ' + pluralize("day", parseInt(delta / 86400)) + ' ago';
      }
    }

    function build_url() {
      var proto = ('https:' == document.location.protocol ? 'https:' : 'http:');
      if (s.list) {
        return proto+"//api.twitter.com/1/"+s.username[0]+"/lists/"+s.list+"/statuses.json?per_page="+s.count+"&callback=?";
      } else if (s.query == null && s.username.length == 1) {
        return proto+'//api.twitter.com/1/statuses/user_timeline.json?screen_name='+s.username[0]+'&count='+s.count+'&callback=?';
      } else {
        var query = (s.query || 'from:'+s.username.join(' OR from:'));
        return proto+'//search.twitter.com/search.json?&q='+escape(query)+'&rpp='+s.count+'&callback=?';
      }
    }

    return this.each(function(i, widget){
      var list = $('<ul class="tweet_list">').appendTo(widget);
      var intro = '<p class="tweet_intro">'+s.intro_text+'</p>';
      var outro = '<p class="tweet_outro">'+s.outro_text+'</p>';
      var loading = $('<p class="loading">'+s.loading_text+'</p>');

      if(typeof(s.username) == "string"){
        s.username = [s.username];
      }

      if (s.loading_text) $(widget).append(loading);
      $.getJSON(build_url(), function(data){
        if (s.loading_text) loading.remove();
        if (s.intro_text) list.before(intro);
        var tweets = (data.results || data);
        $.each(tweets, function(i,item){
          if (s.join_text == "auto") {
            if (item.text.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
              var join_text = s.auto_join_text_reply;
            } else if (item.text.match(/(^\w+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+) .*/i)) {
              var join_text = s.auto_join_text_url;
            } else if (item.text.match(/^((\w+ed)|just) .*/im)) {
              var join_text = s.auto_join_text_ed;
            } else if (item.text.match(/^(\w*ing) .*/i)) {
              var join_text = s.auto_join_text_ing;
            } else {
              var join_text = s.auto_join_text_default;
            }
          } else {
            var join_text = s.join_text;
          };

          var from_user = item.from_user || item.user.screen_name;
          var profile_image_url = item.profile_image_url || item.user.profile_image_url;
          var join_template = '<span class="tweet_join"> '+join_text+' </span>';
          var join = ((s.join_text) ? join_template : ' ');
          var avatar_template = '<a class="tweet_avatar" href="http://twitter.com/'+from_user+'"><img src="'+profile_image_url+'" height="'+s.avatar_size+'" width="'+s.avatar_size+'" alt="'+from_user+'\'s avatar" title="'+from_user+'\'s avatar" border="0"/></a>';
          var avatar = (s.avatar_size ? avatar_template : '');
          var date = '<span class="tweet_time"><a href="http://twitter.com/'+from_user+'/statuses/'+item.id+'" title="view tweet on twitter">'+relative_time(item.created_at)+'</a></span>';
          var text = '<span class="tweet_text">' +$([item.text]).linkUrl().linkUser().linkHash().makeHeart().capAwesome().capEpic()[0]+ '</span>';

          list.append('<li>' + avatar + date + join + text + '</li>');

          list.children('li:first').addClass('tweet_first');
          list.children('li:odd').addClass('tweet_even');
          list.children('li:even').addClass('tweet_odd');
        });
        if (s.outro_text) list.after(outro);
        $(widget).trigger("loaded").trigger((tweets.length == 0 ? "empty" : "full"));
      });

    });
  };
})(jQuery);
/*
 * jQuery hashchange event - v1.2 - 2/11/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,i,b){var j,k=$.event.special,c="location",d="hashchange",l="href",f=$.browser,g=document.documentMode,h=f.msie&&(g===b||g<8),e="on"+d in i&&!h;function a(m){m=m||i[c][l];return m.replace(/^[^#]*#?(.*)$/,"$1")}$[d+"Delay"]=100;k[d]=$.extend(k[d],{setup:function(){if(e){return false}$(j.start)},teardown:function(){if(e){return false}$(j.stop)}});j=(function(){var m={},r,n,o,q;function p(){o=q=function(s){return s};if(h){n=$('<iframe src="javascript:0"/>').hide().insertAfter("body")[0].contentWindow;q=function(){return a(n.document[c][l])};o=function(u,s){if(u!==s){var t=n.document;t.open().close();t[c].hash="#"+u}};o(a())}}m.start=function(){if(r){return}var t=a();o||p();(function s(){var v=a(),u=q(t);if(v!==t){o(t=v,u);$(i).trigger(d)}else{if(u!==t){i[c][l]=i[c][l].replace(/#.*/,"")+"#"+u}}r=setTimeout(s,$[d+"Delay"])})()};m.stop=function(){if(!n){r&&clearTimeout(r);r=0}};return m})()})(jQuery,this);


window.CanvasObject = window.CanvasObject || {};

/**
 * Color Helper Class
 */
CanvasObject.Color = (function() {
  var Klass = function(r, g, b, a) {
    this.red      = Math.round(r || (isNaN(r) && 0));
    this.green    = Math.round(g || (isNaN(g) && 0));
    this.blue     = Math.round(b || (isNaN(b) && 255));
    this.alpha    = a || (isNaN(a) && 1.0);

    this.r = function(val) {
      this.red = parseInt(val);
      return this;
    };

    this.g = function(val) {
      this.green = parseInt(val);
      return this;
    }

    this.b = function(val) {
      this.blue = parseInt(val);
      return this;
    }

    this.a = function(val) {
      this.alpha = parseFloat(val);
      return this;
    }
  };

  Klass.prototype.toString = function() {
    return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";
  };

  Klass.fromHex = function(hex, alpha) {
    return new Klass(hex >> 16, (hex >> 8) & 0xff, hex & 0xff, alpha || 1.0);
  };

  Klass.random = function(alpha) {
    return Klass.fromHex(Math.floor(Math.random() * 0xffffff), alpha);
  };

  Klass.randomGrey = function(alpha) {
    var color = Math.floor(Math.random() * 128) + 120;
    return new Klass(color, color, color, alpha || 1.0);
  };

  var COLOR_SETS = {
    'black':  [  0,   0,   0],
    'clear':  [  0,   0,   0, 0.0],
    'blue':   [  0,   0, 255],
    'red':    [255,   0,   0],
    'green':  [  0, 255,   0],
    'yellow': [255, 255,   0],
    'orange': [255, 128,   0]
  };

  for (var color in COLOR_SETS)
    (function() {
      var arr = COLOR_SETS[color];
      Klass[color] = function() { return new Klass(arr[0], arr[1], arr[2], arr[3]); };
    })();

  return Klass;
})();

window.CanvasObject = window.CanvasObject || {};
CanvasObject.Events = CanvasObject.Events || {};

/**
 * Allows for a chain of methods to be associated and executed when a
 * specified method (or event name) is called or send to the object.
 */
CanvasObject.Events.EventListener = (function() {
  var Klass = function() {
    var events = {};

    /**
     * Merges another EventListener into this one.
     */
/*    this.inheritMerge = function(from) {
      events = from.events();
      for (var name in events)
        (function() {
          var n = name;
          this[n] = function(fn) { events[n].push(fn); };
        })();
    };*/

    /**
     * Used to create a short hand hook for setting events that objects
     * would listen to inherently.
     */
    this.defineHook = function(name) {
      if (events[name]) return;

      events[name] = [];
      this[name] = function(fn) { events[name].push(fn); };
    };
    this.events = function() { return events; };

    this.trigger = function(event) {
      var target = events[event];
      for (var i = 0; i < target.length; i++) target[i].apply(this, arguments);
    };

    this.removeHandler = function(event, handler) {
      if (!events[event]) return;
      for (var i = 0; i < events[event].length; i++)
        if (events[event][i] == handler) events[event].splice(i--, 1);
    };

    this.bind = function(event, fn) {};
    this.unbind = function(event, fn) {};
  };

  return Klass;
})();
window.CanvasObject = window.CanvasObject || {};
CanvasObject.Geometry = CanvasObject.Geometry || {};

CanvasObject.Geometry.Point = (function() {

  var Klass = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;

    this.equals = function(other) {
      return (other.x == this.x && other.y == this.y);
    };

    this.clone = function() { return new CanvasObject.Geometry.Point(this.x, this.y); };

    this.add = function(vec) {
      this.x += vec.x;
      this.y += vec.y;
      return this;
    };

    this.subtract = function(vec) {
      this.x -= vec.x;
      this.y -= vec.y;
      return this;
    }

    this.distanceTo = function(pt) {
      var x = this.x - pt.x;
      var y = this.y - pt.y;
      return Math.sqrt(x * x + y * y);
    };

    this.length = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    };
  };

  Klass.random = function(x, y) {
    return new Klass(Math.random() * x, Math.random() * y);
  }

  Klass.distance = function(p1, p2) {
    var x = p1.x - p2.x;
    var y = p1.y - p2.y;
    return Math.sqrt(x * x + y * y);
  };

  Klass.interpolate = function(p1, p2, weight) {
    weight = weight || 0.5;
    return new CanvasObject.Geometry.Point(p1.x * (1 - weight) + p2.x * weight,
      p1.y * (1 - weight) + p2.y * weight);
  };

  Klass.add = function(pt, vec) {
    return pt.clone().add(vec);
  };

  Klass.subtract = function(pt, vec) {
    return pt.clone().subtract(vec);
  };

  return Klass;
})();

CanvasObject.Geometry.Vector = (function() {
  var Klass = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;

    this.equals = function(other) {
      return (other.x == this.x && other.y == this.y);
    };
    this.eq = this.equals;

    this.clone = function() { return new CanvasObject.Geometry.Vector(this.x, this.y); };
    this.dot = function(vec) { return vec.x * this.x + vec.y * this.y; };

    this.multiply = function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    };
    this.mul = this.multiply;

    this.divide = function(s) {
      this.x /= s;
      this.y /= s;
      return this;
    };
    this.div = this.divide;

    this.add = function(vec) {
      this.x += vec.x;
      this.y += vec.y;
      return this;
    };

    this.subtract = function(vec) {
      this.x -= vec.x;
      this.y -= vec.y;
      return this;
    };
    this.sub = this.subtract;

    this.angle = function() { return Math.atan2(this.y, this.x); };

    this.length = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    this.perpendicular = function() {
      return new CanvasObject.Geometry.Vector(-this.y, this.x);
    };
  };

  Klass.add = function(v1, v2) {
    return v1.clone().add(v2);
  };

  Klass.subtract = function(v1, v2) {
    return v1.clone().subtract(v2);
  };
  Klass.sub = Klass.subtract;

  Klass.fromAngle = function(angle) {
    var ret = new CanvasObject.Geometry.Vector;
    ret.x = Math.cos(angle);
    ret.y = Math.sin(angle);
    return ret;
  };

  return Klass;
})();

CanvasObject.Geometry.Size = (function() {
  var Klass = function(width, height) {
    this.width = width || 0;
    this.height = height || 0;
  };

  return Klass;
})();

CanvasObject.Geometry.Matrix = (function() {
  var Klass = function() {
    var m = [[1, 0], [0, 1]];

    this.rotate = function(angle) {
      m[0][0] =  Math.cos(angle);
      m[0][1] =  Math.sin(angle);
      m[1][0] = -Math.sin(angle);
      m[1][1] =  Math.cos(angle);
    };

    /**
     * Applies this matrix to a point
     */
    this.transform = function(pt) {
      var x = pt.x * m[0][0] + pt.y * m[1][0];
      var y = pt.x * m[0][1] + pt.y * m[1][1];

      pt.x = x;
      pt.y = y;

      return pt;
    };
  };

  Klass.rotatePoint = function(pt, angle) {
    var mat = new Klass();
    mat.rotate(angle);
    return mat.transform(pt);
  };

  return Klass;
})();

CanvasObject.Geometry.Rectangle = (function() {
  var Klass = function(left, top, right, bottom) {
    if (arguments.length == 0) this.empty = true;
    else {
      this.empty = false;
      if (left <= right) {
        this.left = left;
        this.right = right;
      } else {
        this.left = right;
        this.right = left;
      }
      if (top <= bottom) {
        this.top = top;
        this.bottom = bottom;
      } else {
        this.top = bottom;
        this.bottom = top;
      }
    }

    this.clone = function() {
      return new Klass(this.left, this.top, this.right, this.bottom);
    };

    this.width = function() { return this.right - this.left; };
    this.height = function() { return this.bottom - this.top; };

    this.includePoint = function(pt) {
      if (this.empty) {
        this.empty = false;
        this.left = this.right = pt.x;
        this.top = this.bottom = pt.y;
        return;
      }
      if (this.left > pt.x) this.left = pt.x;
      else if (this.right < pt.x) this.right = pt.x;
      if (this.top > pt.y) this.top = pt.y;
      else if (this.bottom < pt.y) this.bottom = pt.y;
    };
  };

  Klass.fromRotated = function(rect, angle) {
    if (angle == 0) return rect.clone();
    var mat = new CanvasObject.Geometry.Matrix();
    mat.rotate(angle);

    var pt1 = mat.transform({x: rect.left, y: rect.top});
    var pt2 = mat.transform({x: rect.right, y: rect.bottom});

    var r = new Klass(pt1.x, pt1.y, pt2.x, pt2.y);

    r.includePoint(mat.transform({x: rect.right, y: rect.top}));
    r.includePoint(mat.transform({x: rect.left, y: rect.bottom}));

    return r;
  };

  return Klass;
})();
window.CanvasObject = window.CanvasObject || {};
CanvasObject.Motion = CanvasObject.Motion || {};
/*
CanvasObject.Motion.MovingBody = (function() {
  var Klass = function() {
    Object.extend(CanvasObject.Geometry.Point);
    Object.extend(events.EventListener);

    this.defineHook('update');

    this.acc = new CanvasObject.Geometry.Vector();
    this.vel = new CanvasObject.Geometry.Vector();

    this.update(function() {
      this.add(this.vel);
      this.vel.add(this.acc);
    });
  };

  return Klass;
})();
*/

window.CanvasObject = window.CanvasObject || {};

/**
 * Common base to allow for object heirachy maintenance, used internally.
 */
CanvasObject.Base = (function() {
  var Klass = function() {
    CanvasObject.Events.EventListener.call(this);
    CanvasObject.Geometry.Point.call(this);
    CanvasObject.Geometry.Rectangle.call(this);

    var parent;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.scale = 1.0;

    this.defineHook('enterFrame');
    this.defineHook('afterRemove');

    this.draw = function() {};
    this.drawInto = function(context) {};

    this.setParent = function(value) { parent = value; };
    this.parent = function() { return parent; };
    this.context = function() { return null; };

    this.remove = function() {
      if (parent) {
        parent.removeChild(this);
        this.trigger('afterRemove');
      }
    };

    this.applyTransform = function(context) {
      context.translate(this.x, this.y);
      context.rotate(this.rotation);
      context.scale(this.scale, this.scale);
    };
  };
  Klass.prototype = new CanvasObject.Events.EventListener;

  return Klass;
})();

/**
 * Represents a canvas context that has bitmap data. Bitmaps can be drawn
 * on each other to create cached graphics that are quick to draw.
 *
 * All CanvasObjects can be converted to a bitmap.
 */
CanvasObject.Bitmap = (function() {
  var Klass = function(width, height) {
    CanvasObject.Base.call(this);

    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext('2d');

    this.canvas = function() { return canvas; };
    this.context = function() { return context; };

    this.drawInto = function(context) {
      context.drawImage(this.canvas(), this.x, this.y);
    };

    this.addBitmap = function(bitmap) {
      bitmap.drawInto(context);
    };

    this.width = function() { return canvas.width; };
    this.height = function() { return canvas.height; };
  };
  Klass.prototype = new CanvasObject.Base;

  Klass.withImage = function(path, callback) {
    var image = new Image;
    image.onload = function() {
      var bitmap = new Klass(image.width, image.height);
      bitmap.context().drawImage(image, 0, 0);
      callback(bitmap);
    }
    image.src = path;
  };

  Klass.withCanvasObject = function(canvasObject) {
    var rect = CanvasObject.Geometry.Rectangle.fromRotated(canvasObject, canvasObject.rotation);
/*
    rect.left   += -canvasObject.shadowBlur + canvasObject.shadowOffsetX;
    rect.top    += -canvasObject.shadowBlur + canvasObject.shadowOffsetY;
    rect.right  +=  canvasObject.shadowBlur + canvasObject.shadowOffsetX;
    rect.bottom +=  canvasObject.shadowBlur + canvasObject.shadowOffsetY;
*/
    var bitmap = new CanvasObject.Bitmap(rect.width(), rect.height());

    bitmap.x = rect.left + canvasObject.x;
    bitmap.y = rect.top + canvasObject.y;

    var x = canvasObject.x;
    var y = canvasObject.y;

    canvasObject.x = -rect.left;
    canvasObject.y = -rect.top;

    canvasObject.drawInto(bitmap.context());

    canvasObject.x = x;
    canvasObject.y = y;

    var ctx = bitmap.context();

    return bitmap;
  };

  return Klass;
})();

/**
 * Basic object used to contain graphics, will need to be placed in a
 * container to be used. Does all the abstraction of methods.
 */
CanvasObject.Path = (function() {
  var METHODS = ['beginPath', 'closePath', 'moveTo', 'lineTo',
    'bezierCurveTo', 'quadraticCurveTo', 'arc', 'drawImage',
    'fillRect', 'strokeRect', 'fill', 'stroke'];
  var PROPS = ['fillStyle', 'strokeStyle', 'shadowOffsetX',
    'shadowOffsetY', 'shadowBlur', 'shadowColor'];

  var Klass = function() {
    CanvasObject.Base.call(this);

    var commands = [];

    for (var i = 0; i < METHODS.length; i++) {
      (function() {
        var command = METHODS[i];
        this[command] = function() {
          commands.push([command, arguments]);
          return commands.length - 1;
        };
        this[command + 'At'] = function() {
          var arr = Array.prototype.slice.call(arguments);
          commands[arr.shift()] = [command, arr];
          return commands.length - 1;
        };
      }).call(this);
    }



    this.moveTo = function(x, y) {
      this.includePoint({x:x, y:y});
      commands.push(['moveTo', arguments]);
      return commands.length - 1;
    };

    this.lineTo = function(x, y) {
      this.includePoint({x:x, y:y});
      commands.push(['lineTo', arguments]);
      return commands.length - 1;
    };

    this.bezierCurveTo = function(px1, py1, px2, py2, x, y) {
      this.includePoint({x:px1, y:py1});
      this.includePoint({x:px2, y:py2});
      this.includePoint({x:x, y:y});
      commands.push(['bezierCurveTo', arguments]);
      return commands.length - 1;
    };

    this.quadraticCurveTo = function(px, py, x, y) {
      this.includePoint({x:px, y:py});
      this.includePoint({x:x, y:y});
      commands.push(['quadraticCurveTo', arguments]);
      return commands.length - 1;
    };


    this.commands = function() { return commands; };
    this.removeCommandAt = function(index) { commands[index] = null; };

    /**
     * Clears the command stack
     */
    this.clear = function() { commands = []; };

    /**
     * Returns this object drawn into a Bitmap
     */
    this.toBitmap = function() {
      return CanvasObject.Bitmap.withCanvasObject(this);
    };

    /**
     * Draws this canvas object into a context
     */
    this.drawInto = function(context, boundingBox) {
      context.save();
      this.applyState(context);

      var commands = this.commands();
      for (var j = 0; j < commands.length; j++)
        if (commands[j])
          context[commands[j][0]].apply(context, commands[j][1]);

      context.restore();
    };

    /**
     * Set the context to the relevant state for drawing this object.
     */
    this.applyState = function(context) {
      this.applyTransform(context);

      for (var i = 0; i < PROPS.length; i++) {
        if (this[PROPS[i]])
          context[PROPS[i]] = this[PROPS[i]];
      }
    };
  };
  Klass.prototype = new CanvasObject.Base;

  return Klass;
})();

/**
 * Contains a set of canvas objects
 */
CanvasObject.Container = (function() {
  var Klass = function() {
    CanvasObject.Base.call(this);

    var children = [];

    this.addChild = function(child) {
      children.push(child);
      child.setParent(this);

      child._enterFrame = function() {
        child.trigger('enterFrame');
      }

      this.enterFrame(child._enterFrame);
    };
    this.children = function() { return children; };

    this.removeChild = function(child) {
      for (var i = 0; i < children.length; i++)
        if (children[i] == child) break;

      if (i == children.length) return;
      children.splice(i, 1);

      this.removeHandler('enterFrame', child._enterFrame);
    };

    /**
     * Draws this object into a specified context.
     */
    this.drawInto = function(context) {
      context.save();
      this.applyTransform(context);
      for (var i = 0; i < children.length; i++)
        children[i].drawInto(context);
      context.restore();
    }
  };
  Klass.prototype = new CanvasObject.Base;

  return Klass;
})();

/**
 * Wrapper for the root canvas attached to the dom. Handles frame rates
 * and the like.
 */
CanvasObject.Stage = (function() {
  var Klass = function(target, _fps) {
    var self = this;
    var origin = new CanvasObject.Geometry.Point(0, 0);
    CanvasObject.Container.call(this);

    var interval, fps, currentFps = 0, canvas, context;
    var noClearDraw, clearDraw, updateFps, drawFunc;

    var initialize = function() {
      if (!target) return;

      canvas = typeof target == 'string' ? document.getElementById(target) : target;
      if (!canvas.getContext) throw "Uh oh! Can't get a context.";

      context = canvas.getContext('2d');
      if (!context) throw "Uh oh! Can't get a context.";

      drawFunc = clearDraw;
      this.enterFrame(drawFunc);
      this.setFrameRate(_fps);
    };

    noClearDraw = function() {
      self.drawInto(context);
    };

    this.clearFunc = function() {
      context.clearRect(-origin.x, -origin.y, canvas.width, canvas.height);
    };

    clearDraw = function() {
      self.clearFunc();
      self.drawInto(context);
    };

    /**
     * FPS Counter
     */
    var updateFps = function() {
      var lastTime = 0, lastDiff = 0;
      var i = 0;

      updateFps = function() {
        var time = (new Date()).getTime();
        var diff = (time - lastTime);

        lastDiff = diff * 0.5 + lastDiff * 0.5;
        lastTime = time;

        currentFps = Math.round(1000 / lastDiff);
      };
    };
    updateFps();

    this.setUpdateMethod = function(clear, calcFps) {
      this.removeHandler('enterFrame', drawFunc);
      this.removeHandler('enterFrame', updateFps);

      if (clear) this.enterFrame(drawFunc = clearDraw);
      else this.enterFrame(drawFunc = noClearDraw);

      if (calcFps) this.enterFrame(updateFps);
    };

    /**
     * Sets the center point for this stage. Default is top left.
     */
    this.setOrigin = function(_origin) {
      if (typeof _origin == 'number')
        _origin = new CanvasObject.Geometry.Point(arguments[0], arguments[1]);

      origin = _origin;
      context.translate(origin.x, origin.y);
    };

    /**
     * Creates a interval that automatically redraws our objects via timer.
     */
    this.setFrameRate = function(value) {
      if (!value || interval != undefined) return;

      var ms = 1000 / (fps = value);
      interval = setInterval(function() { self.trigger('enterFrame'); }, ms);
    };

    this.width = function() { return canvas.width; };
    this.height = function() { return canvas.height; };

    this.resize = function(width, height) {
      canvas.width = width;
      canvas.height = height;
      this.trigger('enterFrame');
    };

    /**
     * Toggle the playing of the stage.
     */
    this.stop = function() { clearInterval(interval); interval = undefined; };
    this.play = function() { this.setFrameRate(fps); };

    this.fps = function() { return currentFps; };
    this.context = function() { return context; };

    initialize.call(this);
  };
  Klass.prototype = new CanvasObject.Container;

  return Klass;
})();

/**
 * Code base for adamelliot.com
 * Copyright (c) Adam Elliot 2010
 */

window.AdamElliot = window.AdamElliot || {};

/**
 * Map any element into the router to create browser history and map into
 * the desired controller.
 *
 * Assumes AdamElliot.Router statically points to the router.
 */
(function($) {
  $.fn.linkTo = function(route) {
    this.click(function() {
      location.hash = route;
    });
  };

  $.fn.targetBlank = function() {
    $(this).find("a").each(function() {
      $(this).attr('target', '_blank');
    });
  };

  $.fn.bindDataRoute = function() {
    $(this).find("[data-route]").each(function() {
      $(this).linkTo($(this).attr('data-route'));
    });
  };

})(jQuery);

/**
 * Operates similar to other routers on ruby backends, maps url paths after
 * the hash into controllers.
 *
 * Route matching is very basic, there's static matching and resource style
 * matching. That's all I need right now.
 */
AdamElliot.Router = (function() {
  var Klass = function() {
    var mappings = {};
    var resources = {};

    /**
     * Pull out the params in the path into an object.
     */
    var getParams = function(route) {
      var p = route.split("?").pop();
      var pairs = p.split("&");
      var params = {};
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split("=");
        params[pair[0]] = pair[1];
      }
      return params;
    };

    this.map = function(path, controller, action) {
      action = action || controller[path];
      mappings[path] = {controller:controller, action:action};
    };

    this.resource = function(path, controller) {
      var target = path.pluralize().capitalize() + "Controller";
      resources[path] = controller || AdamElliot[target];
    };

    /**
     * Causes the router to read the path and execute the route if one a
     * route exists. If routed returns true, otherwise returns false.
     *
     * TODO: Refactor this into smaller parts
     */
    this.route = function() {
      var route = location.hash.split("#")[1];
      if (!route) {
        AdamElliot.frameManager.hideFrame();
        return false;
      }

      var params = getParams(route);
      route = route.split("?")[0];

      var target = mappings[route];
      if (target) {
        if (!target.action) {
          AdamElliot.frameManager.hideFrame();
          return false;
        }

        target.action.call(target.controller);
        return true;
      }

      var parts = route.split("/");
      var controller = parts[0];
      var action = parts[1]; // May be the id
      var id;

      var resource = resources[controller];
      if (!resource) {
        AdamElliot.frameManager.hideFrame();
        return false;
      }

      if (parts[0] == controller && action == null)
        action = "index";
      else switch (action) {
        case "update":
        case "destroy":
          id = parts[2];
        case "create":
          break;
        default:
          action = 'show';
          id = parts[1];
          break;
      }

      if (id) params[resource.dataKey] = id;
      action = resource[action];
      if (action) action.call(resource, params);
      else AdamElliot.frameManager.hideFrame();

      return true;
    }
  };

  return Klass;
})();

/**
 * Represents a frame object on the screen. Is used to attach callbacks
 * once instantiated.
 */
AdamElliot.Frame = (function() {
  var dir = 1;
  var zIndex = 100;

  var Klass = function(block) {
    var self = this;
    var frame = $(AdamElliot.TemplateManager.sharedTemplate('frame')({block:block}));
    var visible = false;

    var adjustContent = function() {
      frame.find("form").submit(function(e) { return false; });
      frame.find("select[value]").each(function() {
        if (this.getAttribute('value'))
          $(this).val(this.getAttribute('value'));
      });

      frame.bindDataRoute();
      frame.targetBlank();

      if ($.browser.mozilla && parseFloat($.browser.version.substr(0,3)) < 1.9) {
        var w = frame.find('.block').innerWidth() - 44;
        frame.find('.toolbar').css('width', w);
        frame.find('.navbar').css('width', w);
      }
    };

    var init = function() {
      $("#frames").append(frame);

      frame.find(".close").click(function() {
        AdamElliot.frameManager.closeFrame();
      });

      if ($.browser.msie ||
        ($.browser.mozilla && parseFloat($.browser.version.substr(0,3))))
        frame.css({paddingBottom: "120px"});

      var h = $(window).height();
      left = ($(window).width() - frame.width()) / 2;
      frame.css({
        display: "block",
        "zIndex": zIndex++,
        top: h,
        left: left
      });

      adjustContent();
    };

    this.delegate = null;

    this.setContent = function(block) {
      frame.find('.block').empty().append(block);

      adjustContent();
    }

    this.scrollTop = function() {
      $('body').animate({scrollTop:0}, 80, function() {
        frame.css('position', 'fixed');
      });
    };

    this.setToolbarButtons = function(buttons) {
      if (!buttons) return;
      var toolbar = frame.find(".toolbar > .buttons");
      toolbar.find(".button").remove();

      var buttonElements = {};
      for (var key in buttons) {
        var button = $("<div class='button'>" + key + "</div>");
        buttonElements[key] = button;

        if (typeof buttons[key] == "string")
          button.linkTo(buttons[key]);
        else button.click(buttons[key]);
        toolbar.append(button);
      }

      return buttonElements;
    };

    this.setButtons = function(buttons) {
      if (!buttons) return;
      var navbar = frame.find(".navbar");
      navbar.find(".button").remove();

      var buttonElements = {};
      for (var key in buttons) {
        var button = $("<div class='button'>" + key + "</div>");
        buttonElements[key] = button;

        if (typeof buttons[key] == "string")
          button.linkTo(buttons[key]);
        else button.click(buttons[key]);
        navbar.append(button);
      }

      return buttonElements;
    };

    this.center = function() {
      var w = ($(window).width() - frame.width()) / 2;
      frame.css("left", w);
    }

    this.shake = function(callback) {
      var right, left, times = 2;
      right = function() {
        frame.animate({left:"+=30"}, 100, left);
      };
      left = function() {
        if (times-- > 0)
          frame.animate({left:"-=30"}, 100, right);
        else
          frame.animate({left:"-=15"}, 50, callback);
      };

      frame.animate({left:"+=15"}, 50, left);
    };

    this.hide = function(callback) {
      if (!visible) {
        if (callback) callback();
        return;
      }

      if (self.delegate && self.delegate.beforeFrameHide)
        self.delegate.beforeFrameHide(self);

      dir *= -1;
      var w = $(window).width() / 4 * dir;
      frame.animate({left:"+=" + w, opacity:0}, 300, function() {
        if (self.delegate && self.delegate.afterFrameHide)
          self.delegate.afterFrameHide(self);

        visible = false;
        $(this).hide();
        if (callback) callback();
      });
    };

    this.show = function(callback) {
      if (visible) {
        if (callback) callback();
        return;
      }

      var left = ($(window).width() - frame.width()) / 2;
      frame.animate({left:left, top:0, opacity:1}, 300, function() {
        visible = true;
        frame.css('position', 'absolute');
        $(this).show();
        if (callback) callback();
      });
    };

    this.prepairToShow = function() {
      var w = $(window).width() / 4 * dir;
      var left = (($(window).width() - frame.width()) / 2) - w;
      frame.css({display:'block', left:left, opacity:0});
    };

    this.destroy = function(callback) {
      if (self.delegate && self.delegate.beforeFrameDestroy)
        self.delegate.beforeFrameDestroy(self);

      frame.animate({top:"+=60", opacity:0}, 300, function() {
        if (self.delegate && self.delegate.afterFrameDestroy)
          self.delegate.afterFrameDestroy(self);

        if (callback) callback();
        $(this).remove();
      });
    };

    this.getFrame = function() { return frame; };

    init.call(this);
  };

  return Klass;
})();

/**
 * Handles blocks returned from the TemplatManager
 */
AdamElliot.FrameManager = (function() {
  var Klass = function() {

    var frames = {};
    var frameStack = [];

    var currentFrame;
    var dir = 1;
    var zIndex = 100;

    var getCurrentRoute = function() { return location.hash.split("#")[1]; };
    var setRoute = function(path) {
      location.hash = path || "";
    }
    var clearRoute = function() { setRoute(""); };

    var pushFrame = function(callback) {
      if (!currentFrame) {
        if (callback) callback();
        return;
      }

      currentFrame.scrollTop();
      currentFrame.hide(callback);
      currentFrame = null;
    };

    var dequeueFrame = function(route) {
      if (!frames[route]) return null;

      var frame = frames[route];

      if (frameStack[frameStack.length - 1] != route)
        frame.prepairToShow();
      else currentFrame = null;

      for (var i = 0; i < frameStack.length; i++)
        if (frameStack[i] == route) {
          frameStack.splice(i, 1);
          i--;
        }

      return frame;
    };

    var popFrame = function(callback) {
      if (currentFrame) console.error("Frame in way, popping anyway.");

      if (frameStack.length <= 0) {
        if (callback) callback();
        return false;
      }
      var route = frameStack[frameStack.length - 1];
      var frame = frames[route];

      if (!frame) {
        if (callback) callback();
        return false;
      }
      currentFrame = frame;

      currentFrame.prepairToShow();
      currentFrame.show(callback);

      setRoute(route);

      return true;
    };

    var destroyFrame = function(callback) {
      if (!currentFrame) return callback();

      var route = getCurrentRoute();
      for (var i = 0; i < frameStack.length; i++)
        if (frameStack[i] == route) {
          frameStack.splice(i, 1);
          i--;
        }
      delete frames[route];

      currentFrame.destroy(callback);
      currentFrame = null;
    };

    this.shakeFrame = function() {
      if (currentFrame) currentFrame.shake();
    };

    this.showFrame = function(block, buttons, preserveBlock) {
      AdamElliot.menu.moveToTop();

      var route = getCurrentRoute();
      var frame = dequeueFrame(route);

      if (!frame)
        frame = new AdamElliot.Frame(block);
      else if (!preserveBlock)
        frame.setContent(block);

      frame.setButtons(buttons);
      frames[route] = frame;
      frameStack.push(route);

      pushFrame(function() {
        frame.show();
      });

      return currentFrame = frame;
    };

    this.closeFrameByRoute = function(route, callback) {
      var frame = frames[route];

      if (!frame) return;
      if (frame == currentFrame) {
        this.closeFrame();
        return;
      }

      frame.destroy(callback);
      delete frames[route];
      for (var i = 0; i < frameStack.length; i++)
        if (frameStack[i] == route) {
          frameStack.splice(i, 1);
          break;
        }
    };

    this.closeFrame = function(callback) {
      if (!currentFrame) return;
      destroyFrame(function() {
        if (!popFrame(callback)) {
          clearRoute();
          AdamElliot.menu.moveToCenter();
        }
      });
    };

    this.hideFrame = function(callback) {
      if (!currentFrame) return;
      pushFrame(function() {
        AdamElliot.menu.moveToCenter();
      });
    };

    this.closeAllFrames = function(callback) {
      for (var i = 0; i < frameStack.length; i++) {
        var route = frameStack[i]
        var frame = frames[route];
        if (currentFrame != frame) frame.destroy();
      }
      frames = {};
      frameStack = [];
      this.closeFrame();
    };

    $(window).resize(function() {
      if (currentFrame) currentFrame.center();
    });

  };

  return Klass;
})();

/**
 * Template manage, compiles the templates at load, and handles the binding
 * of data and how they display.
 */
AdamElliot.TemplateManager = (function() {
  var Klass = function (_controllerName) {
    var controllerName = _controllerName + "";
    var templates = {};

    this.defineTemplate = function(type, binding) {
      templates[type] = $('#templates .' + controllerName + '.' + type).compile(binding);
    };

    this.template = function(type) {
      return templates[type];
    };

    this.render = function(action, data, navbar, preserveBlock) {
      var block = templates[action](data);
      return AdamElliot.frameManager.showFrame(block, navbar, preserveBlock);
    };
  };

  var sharedTemplates = {};
  Klass.sharedTemplate = function(name) {
    return sharedTemplates[name];
  };

  Klass.renderShared = function(name, data, navbar) {
    var block = sharedTemplates[name](data);
    return AdamElliot.frameManager.showFrame(block, navbar);
  };

  var showBox = function(type, title, message, buttons) {
    if (!buttons) buttons = {
      'ok': function() { AdamElliot.frameManager.closeFrame(); }
    };

    AdamElliot.TemplateManager.renderShared(type, {
      'title': title,
      'message': message
    }, buttons);
  };

  Klass.showNotice = function(title, message, buttons) {
    showBox('notice', title, message, buttons);
  };

  Klass.showError = function(title, message, buttons) {
    showBox('error', title, message, buttons);
  };

  Klass.showUnsupported = function() {
    AdamElliot.TemplateManager.renderShared('unsupported', {}, {
      'ok': function() { AdamElliot.frameManager.closeFrame(); }
    });
  };

  $(function() {
    sharedTemplates.error = $("#templates .shared .error").compile({
      '.title': 'title',
      '.message': 'message'
    });
    sharedTemplates.notice = $("#templates .shared .notice").compile({
      '.title': 'title',
      '.message': 'message'
    });

    sharedTemplates.frame = $('#templates .shared .frame').compile({
      '.block': 'block'
    });

    sharedTemplates.unsupported = $("#templates .shared .unsupported").compile();
  });

  return Klass;
})();

/**
 * Basic controller object.
 */
AdamElliot.Controller = (function() {
  var Klass = function(_controllerName) {
    var modelName = (_controllerName || "").singularize() + "";
    var activeBlock;

    this.templateManager = new AdamElliot.TemplateManager(_controllerName);
    this.activeBlock = function() { return activeBlock; };

    this.triggerOnce = function(func) {
      var triggered = false;

      return function() {
        if (!triggered) {
          var args = Array.prototype.slice.call(arguments);
          args.shift();
          func.apply(this, args);
        }
        triggered = true;
      };
    };

    this.render = function(name, data, buttons, preserveBlock) {
      var frame = this.templateManager.render(name, data, buttons, preserveBlock);
      activeBlock = frame.getFrame();
      return frame;
    };

    this.redirect = function(route) {
      location.hash = route;
    };
  };

  return Klass;
})();

/**
 * ResourceController controller type. Used in the resourceful situation.
 */
AdamElliot.ResourceController = (function() {
  var Klass = function(_controllerName) {
    var modelName = (_controllerName || "").singularize();
    var self = this;
    AdamElliot.Controller.call(this, _controllerName);

    var data = {};
    var dataIndex = [];
    this.dataKey = 'id';
    this.dataOrderKey = 'id';
    this.descendingOrder = false;


    this.orderCompare = function(o1, o2) {
      return (data[o1][self.dataOrderKey] - data[o2][self.dataOrderKey]) *
        (self.descendingOrder ? -1 : 1);
    };

    this.getSortedData = function() {
      var result = [];
      for (var i = 0; i < dataIndex.length; i++)
        result.push(data[dataIndex[i]]);
      return result;
    };

    this.getDataByIndex = function(index) {
      return data[dataIndex[index]];
    };

    this.getData = function(key) {
      return data[key];
    };

    this.formHandler = function(data) { return data; };
    this.dataMangler = function(data) { return data; };

    this.scopedFormData = function(scope, data) {
      if (!scope) return data;
      var result = [];

      for (var i = 0; i < data.length; i++) {
        var o = data[i];
        if (o.name.indexOf(scope + "[") != 0) {
          result.push({
            name: scope + '[' + o.name + ']',
            value: o.value
          });
        }
      }

      return result;
    };

    var indexData = function() {
      dataIndex = [];
      for (var key in data) dataIndex.push(key);
      dataIndex.sort(self.orderCompare);
      for (var i = 0; i < dataIndex.length; i++)
        data[dataIndex[i]]._index = i;
    };

    var insert = function(objects) {
      if (!objects) return null;
      if (objects instanceof Array)
        for (var i = 0; i < objects.length; i++)
          data[objects[i][self.dataKey]] = self.dataMangler(objects[i]);
      else
        data[objects[self.dataKey]] = self.dataMangler(objects);

      indexData();
    };

    var destroy = function(id) {
      delete data[id];
      dataIndex.splice(dataIndex.indexOf(id), 1);
      AdamElliot.frameManager.closeFrameByRoute(modelName + "/" + id);
    };

    this.afterCreate = this.afterUpdate = this.afterDestroy = function() {
      AdamElliot.frameManager.closeFrame();
    };

    this.failedCreate = this.failedUpdate = this.failedDestroy = function() {
      AdamElliot.frameManager.shakeFrame();
    };


    this.remoteIndex = function() {
      if (self.beforeData) self.beforeData();

      $.ajax({
        url: '/' + modelName.pluralize() + '.json',
        dataType: 'json',
        success: function(data) {
          insert(data);
          if (self.afterData) self.afterData(data);
        },
        error: function(a, b, c) {
          if (self.failedData) self.failedData();
        }
      });
    };

    this.remoteShow = function(id) {
      if (self.beforeData) self.beforeData();

      $.ajax({
        url: '/' + modelName.pluralize() + '/' + id + '.json',
        dataType: 'json',
        success: function(data) {
          insert(data);
          if (self.afterData) self.afterData(id, data);
        },
        error: function() {
          if (self.failedData) self.failedData(id);
        }
      });
    };

    this.remoteCreate = function() {
      if (self.beforeCreate) self.beforeCreate();
      if (!self.activeBlock()) {
        if (self.failedCreate) self.failedCreate();
        return;
      }
      var data = self.activeBlock().find('form').serializeArray();
      if (!data) {
        if (self.failedCreate) self.failedCreate();
        return;
      }

      data = self.scopedFormData(modelName, self.formHandler(data));

      $.ajax({
        url: '/' + modelName.pluralize() + '.json',
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function(data) {
          insert(data);
          if (self.afterCreate) self.afterCreate(data[self.dataKey], data);
        },
        error: function() {
          if (self.failedCreate) self.failedCreate();
        }
      });
    };

    this.remoteUpdate = function(id) {
      if (self.beforeUpdate) self.beforeUpdate(id);
      if (!self.activeBlock()) {
        if (self.failedUpdate) self.failedUpdate(id);
        return;
      }
      var data = self.activeBlock().find('form').serializeArray();

      self.activeBlock().find('form input:checkbox:not(:checked)').each(function() {
        data.push({name:$(this).attr('name'), value:false});
      });

      if (!data) {
        if (self.failedUpdate) self.failedUpdate(id);
        return;
      }

      data = self.scopedFormData(modelName, self.formHandler(data));

      $.ajax({
        url: '/' + modelName.pluralize() + '/' + id + '.json',
        type: 'PUT',
        dataType: 'json',
        data: data,
        success: function(data) {
          insert(data);
          if (self.afterUpdate) self.afterUpdate(id, data);
        },
        error: function() {
          if (self.failedUpdate) self.failedUpdate(id);
        }
      });
    };

    this.remoteDestroy = function(id) {
      if (self.beforeDestroy) self.beforeDestroy(id);

      $.ajax({
        url: '/' + modelName.pluralize() + '/' + id + '.json',
        type: 'DELETE',
        dataType: 'json',
        success: function() {
          destroy(id);
          if (self.afterDestroy) self.afterDestroy(id);
        },
        error: function() {
          if (self.failedDestroy) self.failedDestroy(id);
        }
      });
    };

    this.showFirst = function(params) {
      if (dataIndex.length == 0) {
        if (!params._noFetch) {
          self.afterData = self.triggerOnce(function() { self.show({_noFetch:true}); });
          self.remoteIndex();
        } else
          console.log("No data to be had!");
        return null;
      }

      self.redirect(modelName.pluralize() + "/" + data[dataIndex[0]][self.dataKey]);
    };


    this.index = function(params) {
      self.remoteIndex();
    };

    this.show = function(params) {
      if (!params[self.dataKey]) return self.showFirst(params);
      var obj = null, id = params[self.dataKey];
      if (!(obj = data[id])) {
        if (!params._noFetch) {
          params._noFetch = true;
          self.afterData = this.triggerOnce(function() { self.show(params); });
        }
        self.remoteShow(id);
        return null;
      }

      return obj;
    };

    this.create = function(params) {
      self.render('form', null, {
        'save': self.remoteCreate
      }, true);
    };

    this.update = function(params) {
      var id = params[self.dataKey];
      self.render('form', data[id], {
        'save': function() { self.remoteUpdate(id); }
      }, true);
    };

    this.destroy = function(params) {
      var id = params[self.dataKey];
      AdamElliot.TemplateManager.showNotice("Confirm Delete",
        'Are you sure you want to delete?', {
        'no': function() { AdamElliot.frameManager.closeFrame(); },
        'yes': function() { self.remoteDestroy(id); }
      });
    };
  };
  Klass.prototype = new AdamElliot.Controller;

  return Klass;
})();
/**
 * Handle manipulating and moving of the menu, the actual buttons of the menu
 * are bound in the main application
 */
window.AdamElliot = window.AdamElliot || {};

/**
 * This object is used to handle the menu items and moving everything when
 * the window resizes or windows push things out of the way
 */
AdamElliot.Menu = (function() {
  var Klass = function () {
    var adamelliot = $("#adamelliot");
    var blog = $("#blog");
    var pics = $("#pics");
    var bio = $("#bio");
    var toyz = $("#toyz")
    var collection = adamelliot.add(blog).add(pics).add(bio).add(toyz);

    var atTop = false;
    var setup = function() {
      this.centerMenu();
      adamelliot.css({opacity: 0.0});
      blog.css({opacity: 0.0, left:blog.offset().left + 600});
      pics.css({opacity: 0.0, left:pics.offset().left - 600});
      bio.css({opacity: 0.0, top:bio.offset().top + 600});
      toyz.css({opacity: 0.0, top:toyz.offset().top - 600});
    };

    var introSequence = function() {
      adamelliot.animate({opacity: 1}, 1000);
      setTimeout(function() {
        blog.animate({opacity: 1, left:"-=600px"}, 300);
      }, 500);
      setTimeout(function() {
        pics.animate({opacity: 1, left:"+=600px"}, 300);
      }, 700);
      setTimeout(function() {
        bio.animate({opacity: 1, top:"-=600px"}, 300);
      }, 900);
      setTimeout(function() {
        toyz.animate({opacity: 1, top:"+=600px"}, 300);
      }, 1100);
    }

    this.centerMenu = function() {
      var pos = adamelliot.offset();
      xOffset = ($(window).width() - adamelliot.width()) / 2 - pos.left;
      yOffset = ($(window).height() - adamelliot.height()) / 2 - pos.top;
      if (atTop) yOffset = 0;
      this.moveBy({
        x: xOffset,
        y: yOffset});
    };

    this.moveBy = function(pt) {
      collection.animate({
        left: "+=" + pt.x,
        top: "+=" + pt.y
      }, 0);
    };

    this.moveToTop = function() {
      if (atTop) return;
      atTop = true;
      var h = ($(window).height() - 190) / 2;
      collection.animate({
        top: "-=" + h
      }, 250);
    };

    this.moveToCenter = function() {
      if (!atTop) return;
      var h = ($(window).height() - 190) / 2;
      atTop = false;
      collection.animate({
        top: "+=" + h
      }, 250);
    };

    if (location.href.indexOf("#") == -1 && $.support.opacity) {
      setup.call(this);
      introSequence.call(this);
    } else
      this.centerMenu();
  };

  $(window).resize(function() {
    AdamElliot.menu.centerMenu();
  });

  return Klass;
})();

/**
 * Base elements that show up underneath everything that provide information
 * but are fairly static on the site.
 */
AdamElliot.Dashboard = (function() {
  var Klass = function() {
    var tweet = $("#tweet");
    var admin = $("#admin");
    var social = $("#social");
    var dashboard = tweet.add(admin).add(social);

    var loadDashboard = function() {
      dashboard.css({opacity:0});
      if (navigator.userAgent.indexOf('iPad') == -1)
        tweet.tweet({
          username: "adam_elliot",
          count: 2,
          loading_text: "loading tweets..."
        });
    };

    var showDashboard = function() {
      setTimeout(function() {
        dashboard.animate({opacity:1}, 1500);
      }, 2500);
    };

    var showingAdminPanel = false;
    var toggleAdminPanel = function() {
      $("#admin").animate({top:"-=100px"}, 300, function() {
        $("#admin .button").toggleClass("hidden");
        $(this).animate({top:"+=100px"}, 300);
      });
    };

    this.showAdminPanel = function() {
      if (showingAdminPanel) return;
      showingAdminPanel = true;
      toggleAdminPanel();
    };

    this.hideAdminPanel = function() {
      if (!showingAdminPanel) return;
      showingAdminPanel = false;
      toggleAdminPanel();
    };

    loadDashboard.call(this);
    showDashboard.call(this);
  };

  return Klass;
})();
/**
 * toy.js
 *
 * Base toy object which provides hooks for the actual toys back to the
 * frame and the pieces it provides.
 */
window.AdamElliot = window.AdamElliot || {};
window.AdamElliot.Toys = window.AdamElliot.Toys || {};

AdamElliot.Toy = (function() {
  var Klass = function(_frame, _fps) {
    var self = this;
    var frame = _frame, buttons;
    var fps = _fps || 24;
    if (frame && CanvasObject)
      CanvasObject.Stage.call(this, frame.getFrame().find("canvas")[0], fps);

    var initialize = function() {
      if (!frame) return;

      buttons = frame.setToolbarButtons({
        'play': function() { self.play(); },
        'stop': function() { self.stop(); },
        'fps': function() {}
      });

      setInterval(function() {
        buttons['fps'].text('fps: ' + self.fps());
      }, 500);
    };

    initialize.call(this);
  };

  Klass.loadCanvasObject = function(callback) {
    if (window.CanvasObject) {
      if (callback) callback();
      return;
    }

    $.getScript("/javascripts/canvas_object.min.js", function() {
      var timer = setInterval(function() {
        if (!window.CanvasObject) return;
        clearInterval(timer);
        Klass.prototype = new CanvasObject.Stage;
        if (callback) callback();
      }, 100);
    });
  };

  Klass.loadToy = function(name, frame, callback) {
    var path = '/javascripts/toys/' + name.underscore() + '.js';

    Klass.loadCanvasObject(function() {
      $.getScript(path, function() {
        var klass = name.camelize();
        var timer = setInterval(function() {
          if (!AdamElliot.Toys[klass]) return;
          clearInterval(timer);
          callback(new AdamElliot.Toys[klass](frame, 1));
        }, 100);
      });
    });
  };

  return Klass;
})();
/**
 * pics.js
 *
 * The file that handles the pics section of the site.
 */
window.AdamElliot = window.AdamElliot || {};

AdamElliot.Pics = (function() {
  var FLICKR_PATH = "http://api.flickr.com/services/feeds/photos_public.gne?id=30782515@N02&format=json&jsoncallback=?";
  var FRAME_RATE = 20;
  var FRAME_DELAY = Math.floor(FRAME_RATE * 5.6);
  var SIZE = 180;

  var Picture = function(path) {
    var self = this;
    CanvasObject.Path.call(this);

    var SUB_SIZE = [20, 30, 36, 45][Math.floor(Math.random() * 4)];
    var SUB_SIZE_2 = SUB_SIZE / 2;
    var COLS = (SIZE / SUB_SIZE);
    var SECTIONS = COLS * COLS;
    var PIXEL_BORDER = 6;
    var MAX_SCALES = 1 + Math.round(SECTIONS / 5);
    var SCALE_FRAME_OFFSET = 1;
    var DURATION = 2.7;

    var offsetX = 0, offsetY = 0;
    var bitmap;

    var scaleStep = (SECTIONS / (MAX_SCALES >> 1)) / DURATION / FRAME_RATE;
    var sectionScale = [];
    for (var i = 0; i < SECTIONS; i++) sectionScale[i] = 0;

    var startTargetIndex = 0, endTargetIndex = 0;
    var order = [];
    for (var i = 0; i < SECTIONS; i++) order[i] = i;
    order.sort(function() { return Math.random() - 0.5; });

    this.fillStyle = 'black';

    this.defineHook('finshedDisplay');

    var scaleSection = function(index) {
      if (sectionScale[index] >= 1.0)
        return false;
      sectionScale[index] += scaleStep;
      if (sectionScale[index] > 1.0) sectionScale[index] = 1.0;

      var s = SUB_SIZE * sectionScale[index], s_2 = s / 2;
      var x = (index % COLS) * SUB_SIZE + (SUB_SIZE_2 - s_2);
      var y = Math.floor(index / COLS) * SUB_SIZE + (SUB_SIZE_2 - s_2);

      var ds = Math.min(SUB_SIZE, s + PIXEL_BORDER);
      var bp = (ds - s) / 2;

      self.fillRectAt((index << 1) + 1, x - bp, y - bp, ds, ds);
      self.drawImageAt((index << 1) + 2, bitmap.canvas(), x + offsetX, y + offsetY, s, s, x, y, s, s);

      return true;
    };

    CanvasObject.Bitmap.withImage(path, function(_bitmap) {
      bitmap = _bitmap;

      if (bitmap.width() > SIZE) offsetX = (bitmap.width() - SIZE) / 2;
      if (bitmap.height() > SIZE) offsetY = (bitmap.height() - SIZE) / 2;

      var func, count = 0;
      var fade = 0.0;
      self.enterFrame(func = function() {
        fade += 0.005;
        self.fillStyle = 'rgba(0,0,0,' + fade + ')';
        self.fillRectAt(0, 0, 0, SIZE, SIZE);

        var moveForward = !scaleSection(order[startTargetIndex]);
        for (var i = startTargetIndex + 1; i < endTargetIndex; i++)
          scaleSection(order[i]);

        if (moveForward) {
          startTargetIndex++;
          endTargetIndex++;
          endTargetIndex = Math.min(endTargetIndex, SECTIONS - 1);
        }

        if (count++ % SCALE_FRAME_OFFSET == 0 &&
          (endTargetIndex - startTargetIndex) < MAX_SCALES) {
          endTargetIndex++;
          endTargetIndex = Math.min(endTargetIndex, SECTIONS - 1);
        }

        if (startTargetIndex >= SECTIONS) {
          self.removeHandler('enterFrame', func);
          self.trigger('finshedDisplay');
        }
      });
    });
  };

  var Klass = function(_frame) {
    var self = this;
    var frame = _frame, buttons;
    var canvas = frame.getFrame().find("canvas");
    CanvasObject.Stage.call(this, canvas[0], FRAME_RATE);

    var images, imageIndex = 0;
    var pictures = [], pictureIndex = 0;
    var frameDelay = FRAME_DELAY;
    var order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    order.sort(function() { return Math.random() - 0.5; });

    this.resize(550, 550);
    this.setUpdateMethod(false, false);

    canvas.click(function(event) {
      var x = Math.floor(event.offsetX / 184);
      var y = Math.floor(event.offsetY / 184);
      var index = x + y * 3;

      if (pictures[order.indexOf(index)])
        window.open(pictures[order.indexOf(index)].url, "_blank");
    });

    var addPicture = function() {
      if (pictures[pictureIndex]) self.removeChild(pictures[pictureIndex]);

      var picture = new Picture(images[imageIndex].media.m);
      picture.url = images[imageIndex].link;
      self.addChild(picture);

      imageIndex++;

      var index = order[pictureIndex];

      picture.x = (index % 3) * (SIZE + 5);
      picture.y = Math.floor(index / 3) * (SIZE + 5);

      pictures[pictureIndex++] = picture;

      picture.finshedDisplay(function() {
        self.removeChild(picture);
      });

      pictureIndex %= 9;
      imageIndex %= images.length;
    };

    var initialize = function() {
      if (!frame) return;

      $.getJSON(FLICKR_PATH, function(data) {
        images = data.items;
        images.sort(function() { return Math.random() - 0.5; });

        var initialPics = 9, i = 0;
        var func;
        self.enterFrame(func = function() {
          if ((i++ % FRAME_RATE) === 0) {
            addPicture();
            if (--initialPics <= 0) this.removeHandler('enterFrame', func);
          }
        });

        self.enterFrame(function() {
          if (frameDelay === 0) {
            addPicture();
            frameDelay = FRAME_DELAY;
          }
          frameDelay--;
        });
      });
    };

    this.clearFunc = function() {
      self.context().fillStyle = 'rgba(0, 0, 0, 0.02)';
      self.context().fillRect(0, 0, 550, 550);
    };

    initialize.call(this);
  };

  return Klass;
})();
/**
 * Code base for adamelliot.com
 * Copyright (c) Adam Elliot 2010
 */

$("a[href*=comment-]").live('mousedown click', function() {
  $(this).attr('onclick', null);
  return false;
});

window.disqus_developer = (location.hostname != "adamelliot.com") ? 1 : 0;

/**
 * Resource posts controller.
 */
AdamElliot.PostsController = function() {
  var self = this;
  AdamElliot.ResourceController.call(this, "posts");
  var _super = $.extend({}, this);

  this.dataKey = 'slug';
  this.dataOrderKey = 'posted_on';
  this.descendingOrder = true;

  this.dataMangler = function(data) {
    data['posted_on'] = new Date(data['posted_on']);
    return data;
  };

  this.formHandler = function(data) {
    var date = new Date;
    var result = [];

    for (var i = 0; i < data.length; i++) {
      switch(data[i].name) {
        case 'posted_on_day':
          date.setDate(data[i].value);
          break;
        case 'posted_on_month':
          date.setMonth(data[i].value);
          break;
        case 'posted_on_year':
          date.setYear(data[i].value);
          break;
        default:
          result.push(data[i]);
      }
    }

    result.push({name:'posted_on', value:date});

    return result;
  };

  this.templateManager.defineTemplate('index', {
    '.row': {
      'posts<-posts': {
        '@data-route': function(arg) {
          var post = arg.item;
          return 'posts/' + post.slug;
        },
        '.title': 'posts.title',
        '.date': function(arg) {
          return arg.item['posted_on'].toDateString();
        },
        '.description': function(arg) {
          var post = arg.item;
          var match = post.body.match(/>([^<]*)</);
          if (match) {
            var firstChunk = match[1];
            var match = firstChunk.match(/([^\s]+\s){0,34}[^\s]+/);
            var firstWords = (match && match[0]) || "";
            return firstWords + (firstWords == firstChunk ? "" : "...");
          } else return post.body;
        }
      }
    }
  });

  this.templateManager.defineTemplate('show', {
    '.title': 'title',
    '.permalink a@href': function(arg) {
      return '/permalink/posts/' + arg.context['slug'];
    },
    '.body': 'body',
    '.date': function(arg) {
      return arg.context['posted_on'].toDateString();
    },
  });

  this.templateManager.defineTemplate('form', {
    'input[name=slug]@value': 'slug',
    'input[name=title]@value': 'title',
    'textarea[name=markdown]': 'markdown',
    'input[name=tags]@value': 'tags',
    'select[name=posted_on_month]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getMonth() :
        (new Date).getMonth();
    },
    'select[name=posted_on_day]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getDate() :
        (new Date).getDate();
    },
    'select[name=posted_on_year]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getFullYear() :
        (new Date).getFullYear();
    },
    'input[name=draft]@checked': 'draft',
    'input[name=closed]@checked': 'closed'
  });

  this.index = function(params) {
    this.remoteIndex();

    this.afterData = this.triggerOnce(function() {
      this.render('index', {posts:this.getSortedData()});
    });
  };

  var addCommentScript = function() {
    if ($("script[src=http://adamelliot.disqus.com/embed.js]").length > 0)
      return false;

    $.getScript("http://adamelliot.disqus.com/embed.js");
    return true;
  };

  var showCommentInBlock = function(post, block) {
    var thread = block.find('.disqus_thread');

    $("#disqus_thread").remove();

    window.disqus_url = location.href.split('#')[0] + 'permalink/posts/' + post['slug'];
    window.disqus_skip_auth = true;
    window.disqus_identifier = post['slug'];

    thread.attr('id', "disqus_thread");

    if (!addCommentScript()) return;
  };

  this.afterFrameHide = function(frame) {
    $('#disqus_thread').remove();
  };

  this.show = function(params) {
    var post = null;
    if (!(post = _super.show(params))) return null;

    var buttons = {};

    if (this.getDataByIndex(post._index + 1))
      buttons['older'] = "posts/" + this.getDataByIndex(post._index + 1)[this.dataKey];
    if (post._index > 0)
      buttons['newer'] = "posts/" + this.getDataByIndex(post._index - 1)[this.dataKey];

    buttons['index'] = 'posts';

    if (AdamElliot.session.authenticated) {
      buttons['edit'] = 'posts/update/' + post.slug;
      buttons['delete'] = 'posts/destroy/' + post.slug;
    }

    var frame = this.render('show', post, buttons);
    frame.setToolbarButtons({'index': 'posts'});
    frame.delegate = this;
    if (!post['closed']) showCommentInBlock(post, frame.getFrame());
  };
};
AdamElliot.PostsController.prototype = new AdamElliot.ResourceController;

/**
 * Resource toys controller.
 */
AdamElliot.ToysController = function() {
  var self = this;
  AdamElliot.ResourceController.call(this, "toys");
  var _super = $.extend({}, this);

  this.dataKey = 'slug';
  this.dataOrderKey = 'posted_on';
  this.descendingOrder = true;

  this.dataMangler = function(data) {
    data['posted_on'] = new Date(data['posted_on']);
    return data;
  };

  this.formHandler = function(data) {
    var date = new Date;
    var result = [];

    for (var i = 0; i < data.length; i++) {
      switch(data[i].name) {
        case 'posted_on_day':
          date.setDate(data[i].value);
          break;
        case 'posted_on_month':
          date.setMonth(data[i].value);
          break;
        case 'posted_on_year':
          date.setYear(data[i].value);
          break;
        default:
          result.push(data[i]);
      }
    }

    result.push({name:'posted_on', value:date});

    return result;
  };

  this.templateManager.defineTemplate('index', {
    '.row': {
      'toy<-toys': {
        '@data-route': function(arg) {
          var toy = arg.item;
          return 'toys/' + toy.slug;
        },
        '.title': 'toy.title',
        '.date': function(arg) {
          return arg.item['posted_on'].toDateString();
        },
        '.description': 'toy.description'
      }
    }
  });

  this.templateManager.defineTemplate('show', {
    '.title': 'title',
    '.permalink a@href': function(arg) {
      return '/permalink/toys/' + arg.context['slug'];
    },
    '.date': function(arg) {
      return arg.context['posted_on'].toDateString();
    },
  });

  this.templateManager.defineTemplate('form', {
    'input[name=slug]@value': 'slug',
    'input[name=title]@value': 'title',
    'input[name=javascript]@value': 'javascript',
    'input[name=tags]@value': 'tags',
    'textarea[name=markdown]': 'markdown',
    'select[name=posted_on_month]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getMonth() :
        (new Date).getMonth();
    },
    'select[name=posted_on_day]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getDate() :
        (new Date).getDate();
    },
    'select[name=posted_on_year]@value': function(arg) {
      return arg.context && arg.context['posted_on'] ?
        arg.context['posted_on'].getFullYear() :
        (new Date).getFullYear();
    },
    'input[name=draft]@checked': 'draft',
    'input[name=closed]@checked': 'closed'
  });

  this.index = function(params) {
    this.remoteIndex();

    this.afterData = this.triggerOnce(function() {
      this.render('index', {toys:this.getSortedData()});
    });
  };

  var addCommentScript = function() {
    if ($("script[src=http://adamelliot.disqus.com/embed.js]").length > 0)
      return false;

    $.getScript("http://adamelliot.disqus.com/embed.js");
    return true;
  };

  var showCommentInBlock = function(toy, block) {
    var thread = block.find('.disqus_thread');

    $("#disqus_thread").remove();

    window.disqus_url = location.href.split('#')[0] + 'permalink/toys/' + toy['slug'];
    window.disqus_skip_auth = true;
    window.disqus_identifier = toy['slug'];

    thread.attr('id', "disqus_thread");

    if (!addCommentScript()) return;
  };

  this.afterFrameHide = function(frame) {
    $('#disqus_thread').remove();
  };

  this.beforeFrameHide = function(frame) {
    if (frame.toy) frame.toy.stop();
  };

  this.beforeFrameDestroy = function(frame) {
    if (frame.toy) frame.toy.stop();
  };

  this.show = function(params) {
    if (!Modernizr.canvas) {
      AdamElliot.TemplateManager.showUnsupported();
      return;
    }

    var toy = null;
    if (!(toy = _super.show(params))) return null;

    var buttons = {};

    if (AdamElliot.session.authenticated) {
      buttons['edit'] = 'toys/update/' + toy.slug;
      buttons['delete'] = 'toys/destroy/' + toy.slug;
    }

    buttons['index'] = 'toys';

    var frame = this.render('show', toy, buttons);
    frame.setToolbarButtons({'index': 'toys'});
    frame.delegate = this;
    if (!toy['closed']) showCommentInBlock(toy, frame.getFrame());

    AdamElliot.Toy.loadToy(toy.javascript, frame, function(toy) {
      frame.toy = toy;
    });
  };
};
AdamElliot.ToysController.prototype = new AdamElliot.ResourceController;

/**
 * Handle logging in and out and populate the session object with the logged
 * in auth status.
 */
AdamElliot.SessionController = (function() {
  var Klass = function() {
    var self = this;
    AdamElliot.ResourceController.call(this, "session");
    var _super = $.extend({}, this);

    this.dataKey = 'username';

    this.templateManager.defineTemplate('form');

    var enableAdmin = function(username) {
      AdamElliot.dashboard.showAdminPanel();
      if (AdamElliot.session.authenticated) return;
      AdamElliot.session.authenticated = username;
      AdamElliot.frameManager.closeFrame();
    };

    var disableAdmin = function() {
      AdamElliot.dashboard.hideAdminPanel();
      if (!AdamElliot.session.authenticated) return;
      AdamElliot.session.authenticated = null;
      AdamElliot.frameManager.closeAllFrames();
    };

    var setAdminOnResponse = function(id, data) {
      if (data && data.authenticated) enableAdmin(data.username);
      else disableAdmin();
    };

    this.afterDestroy = this.afterData = this.afterCreate = setAdminOnResponse;

    this.destroy = function(params) {
      this.remoteDestroy();
    };

    this.remoteShow(AdamElliot.session.authenticated);
  };
  Klass.prototype = new AdamElliot.ResourceController;

  var match = document.cookie.match(/authenticated=(.*)(;|$)/);
  var username = match && match[1];
  AdamElliot.session = {authenticated: username};

  return Klass;
})();

/**
 * Handles general routes, all the one offs that don't need to be in a CRUD
 * pattern.
 */
AdamElliot.GeneralController = (function() {
  var Klass = function() {
    var self = this;
    AdamElliot.ResourceController.call(this, "general");

    this.templateManager.defineTemplate('bio');
    this.templateManager.defineTemplate('pics');

    this.bio = function() {
      this.render('bio');
    };

    this.beforeFrameHide = this.beforeFrameDestroy = function(frame) {
      if (frame.pics) frame.pics.stop();
    };

    this.pics = function() {
      if (!Modernizr.canvas) {
        AdamElliot.TemplateManager.showUnsupported();
        return;
      }

      var frame = this.render('pics');
      frame.delegate = this;

      AdamElliot.Toy.loadCanvasObject(function() {
        frame.pics = new AdamElliot.Pics(frame);
      });
    }
  };
  Klass.prototype = AdamElliot.Controller;

  return Klass;
})();

window.AdamElliot = window.AdamElliot || {};
AdamElliot.dev = true;

AdamElliot.loadScripts = function(scripts, callback) {
  if (!scripts instanceof Array) scripts = [scripts];

  $.getScript(scripts.shift(), function() {
    if (scripts.length > 1)
      AdamElliot.loadScripts(scripts, callback);
    else callback();
  });
};

$(function() {
  $("#application").css({display:'block'});

  $("body").bindDataRoute();
  $("body").targetBlank();

  AdamElliot.router = new AdamElliot.Router;

  AdamElliot.router.resource("session", new AdamElliot.SessionController);
  AdamElliot.router.resource("posts", new AdamElliot.PostsController);
  AdamElliot.router.resource("toys", new AdamElliot.ToysController);

  var generalController = new AdamElliot.GeneralController;
  AdamElliot.router.map("bio", generalController);
  AdamElliot.router.map("pics", generalController);

  AdamElliot.frameManager = new AdamElliot.FrameManager;

  AdamElliot.menu = new AdamElliot.Menu;
  AdamElliot.dashboard = new AdamElliot.Dashboard;

  AdamElliot.router.route();

  $(window).bind('hashchange', function() {
    AdamElliot.router.route();
  });
});

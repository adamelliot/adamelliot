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
    revision: 2.44
*/
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('9 $p,2T=$p=6(){9 a=3i[0],2B=I;7(y a===\'15\'){2B=3i[1]||I}8 $p.33(a,2B)};$p.33=6(q,r,t){9 t=2N(),1o=[];3f(y q){12\'15\':1o=t.L(r||E,q);7(1o.x===0){G(\'2j 2a "\'+q+\'" 2C 22 2L\')}1a;12\'A\':G(\'2j 2a 32 2c A, 51 2i T\');1a;4Y:1o=[q]}F(9 i=0,O=1o.x;i<O;i++){t[i]=1o[i]}t.x=O;9 u=\'4X\'+1N.2W(1N.2Y()*2Z)+\'2s\',28=\'4W\'+1N.2W(1N.2Y()*2Z)+\'2s\',29=/^(\\+)?([^\\@\\+]+)?\\@?([^\\+]+)?(\\+)?$/,39={4V:\'4R\',4P:\'3h\'},1g=2k.1g?6(o){8 2k.1g(o)}:6(o){8 4M.V.4L.2u(o)==="[4I 2k]"};8 t;6 G(e){7(y 2R!==\'A\'){2R.4G(e);4E}C{4D(e)}4C(\'2T G: \'+e);}6 2N(){9 a=$p.Y,f=6(){};f.V=a;f.V.J=a.J||J;f.V.Q=a.Q||Q;f.V.P=a.P||P;f.V.L=a.L||L;f.V.4B=1s;f.V.4x=G;8 4u f()}6 25(b){8 b.25||(6(n){9 a=E.3l(\'4t\'),h;a.1L(n.2I(14));h=a.2K;a=19;8 h})(b)}6 1r(b,f){8 6(a){8 b(\'\'+f.2u(a.17,a))}}6 L(n,a){7(y n===\'15\'){a=n;n=I}7(y E.2P!==\'A\'){8(n||E).2P(a)}C{G(\'4q 4p 16 2V 4o 2A: 4n, 4m.5+, 3m+ 4g 4f+\\n\\4e 4d 2V 2b 2i 4b, 4a 49 a 48 47/46 2A a 45 T 44\')}}6 2q(c,d){8 6(a){9 b=[c[0]],n=c.x,1O,1v,1R,1w;F(9 i=1;i<n;i++){1O=d[i](a);1v=c[i];7(1O===\'\'){1R=b[b.x-1];7((1w=1R.43(/[\\w]+=\\"?$/))>-1){b[b.x-1]=1R.26(0,1w);1v=1v.42(1)}}b[b.x]=1O;b[b.x]=1v}8 b.27(\'\')}}6 2Q(p){9 m=p.1x(/^(\\w+)\\s*<-\\s*(\\S+)?$/);7(m===19){G(\'2n 1b 40: "\'+p+\'"\')}7(m[1]===\'1e\'){G(\'"1e<-..." 2c a 3Z 3N F 1M 3M 3L 3K.\\n\\3J 3I 3G 2r F 2i 1b.\')}7(!m[2]||(m[2]&&(/17/i).16(m[2]))){m[2]=6(a){8 a.17}}8{2r:m[1],13:m[2]}}6 1l(c){7(y(c)===\'6\'){8 c}9 m=c.1x(/^[a-3B-Z$2s][\\w$]*(\\.[\\w$-]*[^\\.])*$/);7(m===19){9 d=I,s=c,1T=[],1n=[],i=0,21;7(/\\\'|\\"/.16(s.2D(0))){7(/\\\'|\\"/.16(s.2D(s.x-1))){21=s.26(1,s.x-1);8 6(){8 21}}}C{1U((m=s.1x(/#\\{([^{}]+)\\}/))!==19){d=14;1T[i++]=s.2F(0,m.2G);1n[i]=1l(m[1]);s=s.2F(m.2G+m[0].x,s.x)}}7(!d){G(\'2n 3A T 2H: \'+c)}1T[i]=s;8 2q(1T,1n)}m=c.1V(\'.\');8 6(a){9 b=a.17;7(!b){8\'\'}9 v=a[m[0]],i=0;7(v&&v.1e){b=v.1e;i+=1}9 n=m.x;F(;i<n;i++){7(!b){1a}b=b[m[i]]}8(!b&&b!==0)?\'\':b}}6 1y(c,d,e){9 f,R,T,D,N,K=[];7(y d===\'15\'){f=d;9 m=d.1x(29);7(!m){G(\'2n T 2H: \'+d)}R=m[1];T=m[2];D=m[3];N=m[4];7(T===\'.\'||(!T&&D)){K[0]=c}C{K=t.L(c,T)}7(!K||K.x===0){8 G(\'2j 1z "\'+d+\'" 2C 22 2L 1f 1M 2a\')}}C{R=d.R;D=d.D;N=d.N;K=[c]}7(R||N){7(R&&N){G(\'N/R 2e 3z 3y 3x 1M 3w 3v\')}C 7(e){G(\'3u N/R/1j 3t 3s F 1b K\')}C 7(N&&e){G(\'2e N 2A 1b (13: \'+f+\')\')}}9 g,1m,U,1A,1B,1C,X;7(D){1A=(/^2t$/i).16(D);1B=(/^3r$/i).16(D);1C=1B?\'1p\':D;g=6(a,s){a.3q(28+D,s);7(1C 1f a&&!1A){a[1C]=\'\'}7(a.3d===1){a.3e(D);1B&&a.3e(1C)}};7(1A||1B){7(1A){1m=6(n){8 n.2t.3p}}C{1m=6(n){8 n.1p}}U=6(s){8 s.1j(/\\"/g,\'&3g;\')}}C{1m=6(n){8 n.3o(D)};U=6(s){8 s.1j(/\\"/g,\'&3g;\').1j(/\\s/g,\'&3n;\')}}7(R){X=6(a,s){g(a,s+1m(a))}}C 7(N){X=6(a,s){g(a,1m(a)+s)}}C{X=6(a,s){g(a,s)}}}C{7(e){X=6(a,s){9 b=a.3j;7(b){b.2z(E.20(s),a.4h);b.1Z(a)}}}C{7(R){X=6(a,s){a.2z(E.20(s),a.1H)}}C 7(N){X=6(a,s){a.1L(E.20(s))}}C{X=6(a,s){1U(a.1H){a.1Z(a.1H)}a.1L(E.20(s))}}}U=6(s){8 s}}8{D:D,M:K,3c:X,13:f,U:U}}6 1E(a,n){9 b=u+n+\':\';F(9 i=0;i<a.M.x;i++){a.3c(a.M[i],b)}}6 2l(h,j,k,l,m){8 6(f){9 a=j(f),2h=f[h],1I={2U:a},2f=0,x,23=[],2x=6(b,c,d,e){f.1w=c.1w=b;f.1e=c.1e=a[b];f.2U=a;y e!==\'A\'&&(f.x=e);7(y d===\'6\'&&d(f)===I){2f++;8}23.2w(k.2u(c,f))};f[h]=1I;7(1g(a)){x=a.x||0;7(y l===\'6\'){a.1P(l)}F(9 i=0,O=x;i<O;i++){2x(i,1I,m,x-2f)}}C{7(a&&y l!==\'A\'){G(\'1P 2c 3C 3D 2b 3E, 22 3F\')}F(9 g 1f a){a.2p(g)&&2x(g,1I,m)}}y 2h!==\'A\'?f[h]=2h:3H f[h];8 23.27(\'\')}}6 2o(a,b,c,d){9 e=I,1d,2m,1t,H;F(H 1f c){7(c.2p(H)){7(H===\'1P\'){2m=c.1P;30}C 7(H===\'1t\'){1t=c.1t;30}7(e){G(\'2e 3O 3P 3Q 3R 1b 2b a K\')}1d=H;e=14}}7(!1d){G(\'3S 1f 1M T: \'+b+\'\\3T 3U 3V 3W 3X a 15, a 6 3Y a 1b(<-)\')}9 f=c[1d];7(y(f)===\'15\'||y(f)===\'6\'){c={};c[1d]={32:f};8 2o(a,b,c,d)}9 g=2Q(1d),1G=1l(g.13),K=1y(a,b,14),M=K.M;F(i=0;i<M.x;i++){9 h=M[i],1D=1s(h,f);d[d.x]=1r(K.U,2l(g.2r,1G,1D,2m,1t));K.M=[h];1E(K,d.x-1)}}6 2O(n,d){9 e=n.41(\'*\'),24=[],1k={a:[],l:{}},z,1J,i,O,j,1h,11,1X,2d;F(i=-1,O=e.x;i<O;i++){11=i>-1?e[i]:n;7(11.3d===1&&11.1p!==\'\'){1X=11.1p.1V(\' \');F(j=0,1h=1X.x;j<1h;j++){2d=1X[j];z=38(2d,11.36);7(z!==I){1J=(/4c/i).16(z.D);7(z.13.35(\'@\')>-1||1J){11.1p=11.1p.1j(\'@\'+z.D,\'\');7(1J){z.D=I}}24.2w({n:11,z:z})}}}}8 24;6 38(c,a){9 b=c.1x(29),D=b[3]||39[a],z={R:!!b[1],H:b[2],D:D,N:!!b[4],13:c},i,O,1W,1S,W;F(i=1k.a.x-1;i>=0;i--){1W=1k.a[i];1S=1W.l[0];W=1S&&1S[z.H];7(y W!==\'A\'){z.H=1W.p+\'.\'+z.H;7(1k.l[z.H]===14){W=W[0]}1a}}7(y W===\'A\'){W=1g(d)?d[0][z.H]:d[z.H];7(y W===\'A\'){8 I}}7(1g(W)){1k.a.2w({l:W,p:z.H});1k.l[z.H]=14;z.t=\'1b\'}C{z.t=\'31\'}8 z}}6 1s(a,b,c,d){9 e=[];d=d||c&&2O(a,c);7(c){9 j,1h,z,n,f,M,1G,1z,1D;1U(d.x>0){z=d[0].z;n=d[0].n;d.4i(0,1);7(z.t===\'31\'){f=1y(n,z,I);1E(f,e.x);e[e.x]=1r(f.U,1l(z.H))}C{1G=1l(z.13);f=1y(n,z,14);M=f.M;F(j=0,1h=M.x;j<1h;j++){1z=M[j];1D=1s(1z,I,c,d);e[e.x]=1r(f.U,2l(z.13,1G,1D));f.M=[1z];1E(f,e.x-1)}}}}9 f,1c;F(9 g 1f b){7(b.2p(g)){1c=b[g];7(y(1c)===\'6\'||y(1c)===\'15\'){f=1y(a,g,I);1E(f,e.x);e[e.x]=1r(f.U,1l(1c))}C{2o(a,g,1c,e)}}}9 h=25(a),1n=[];h=h.1j(/<([^>]+)\\s(3h\\=""|4j)\\s?([^>]*)>/4k,"<$1 $3>");h=h.1V(28).27(\'\');9 k=h.1V(u),p;F(9 i=1;i<k.x;i++){p=k[i];1n[i]=e[4l(p,10)];k[i]=p.26(p.35(\':\')+1)}8 2q(k,1n)}6 J(b,c,d){9 e=1s((d||B[0]).2I(14),b,c);8 6(a){8 e({17:a})}}6 Q(a,b){9 c=y b===\'6\'?b:t.J(b,I,B[0]);F(9 i=0,O=B.x;i<O;i++){B[i]=2y(B[i],c(a,I))}17=19;8 B}6 P(a,b){9 c=t.J(b,a,B[0]);F(9 i=0,O=B.x;i<O;i++){B[i]=2y(B[i],c(a,I))}17=19;8 B}6 2y(a,b){9 c,1K=a.3j,1u=0;3f(a.36){12\'1F\':12\'4r\':12\'4s\':b=\'<1q>\'+b+\'</1q>\';1u=1;1a;12\'2v\':b=\'<1q><1F>\'+b+\'</1F></1q>\';1u=2;1a;12\'4v\':12\'4w\':b=\'<1q><1F><2v>\'+b+\'</2v></1F></1q>\';1u=3;1a}1i=E.3l(\'4y\');1i.2t.4z=\'4A\';E.2g.1L(1i);1i.2K=b;c=1i.1H;1U(1u--){c=c.1H}1K.2z(c,a);1K.1Z(a);E.2g.1Z(1i);a=c;c=1K=19;8 a}};$p.Y={};$p.2X={1Y:6(){7(y E.18===\'A\'){$p.Y.L=6(n,a){8 1Y.4F(a,n)}}},2M:6(){7(y E.18===\'A\'){$p.Y.L=6(n,a){8 $(n).4H(a)}}2J.4J({4K:[\'J\',\'Q\',\'P\'],J:6(a,b){8 $p(B).J(a,b)},Q:6(a,b){8 $($p(B).Q(a,b))[0]},P:6(a,b){8 $($p(B).P(a,b))[0]}})},2E:6(){7(y E.18===\'A\'){$p.Y.L=6(n,a){8 $(n).L(a)}}1Q.4N.4O({J:6(a,b){8 $p(B[0]).J(a,b)},Q:6(a,b){8 1Q($p(B[0]).Q(a,b))},P:6(a,b){8 1Q($p(B[0]).P(a,b))}})},3b:6(){7(y E.18===\'A\'){$p.Y.L=6(n,a){8 $(n).4Q(a)}}3a.4S({J:6(a,b){8 $p(B).J(a,b)},Q:6(a,b){8 $p(B).Q(a,b)},P:6(a,b){8 $p(B).P(a,b)}})},V:6(){7(y E.18===\'A\'){$p.Y.L=6(n,a){n=n===E?n.2g:n;8 y n===\'15\'?$$(n):$(n).4T(a)}}3a.4U({J:6(a,b,c){8 $p(a).J(b,c)},Q:6(a,b,c){8 $p(a).Q(b,c)},P:6(a,b,c){8 $p(a).P(b,c)}})},34:6(){7(y E.18===\'A\'){$p.Y.L=6(n,a){8 2S(a,n)}}},3k:6(){7(y E.18===\'A\'){$p.Y.L=6(n,a){8 37(a,n)}}}};(6(){9 a=y 1Y!==\'A\'&&\'1Y\'||y 2J!==\'A\'&&\'2M\'||y 1Q!==\'A\'&&\'2E\'||y 4Z!==\'A\'&&\'3b\'||y 50!==\'A\'&&\'V\'||y 2S!==\'A\'&&\'34\'||y 37!==\'A\'&&\'3k\';a&&$p.2X[a]()})();',62,312,'||||||function|if|return|var||||||||||||||||||||||||length|typeof|cspec|undefined|this|else|attr|document|for|error|prop|false|compile|target|find|nodes|append|ii|autoRender|render|prepend||selector|quotefn|prototype|val|setfn|plugins|||ni|case|sel|true|string|test|context|querySelector|null|break|loop|dsel|ls|item|in|isArray|jj|tmp|replace|openLoops|dataselectfn|getstr|pfns|templates|className|TABLE|wrapquote|compiler|filter|depth|pVal|pos|match|gettarget|node|isStyle|isClass|attName|inner|setsig|TBODY|itersel|firstChild|temp|isNodeValue|ep|appendChild|the|Math|fnVal|sort|jQuery|attLine|loopil|parts|while|split|loopi|cs|dojo|removeChild|createTextNode|retStr|not|strs|an|outerHTML|substring|join|attPfx|selRx|template|on|is|cj|cannot|filtered|body|old|your|The|Array|loopfn|sorter|bad|loopgen|hasOwnProperty|concatenator|name|_|style|call|TR|push|buildArg|replaceWith|insertBefore|with|ctxt|was|charAt|jquery|slice|index|syntax|cloneNode|DOMAssistant|innerHTML|found|domassistant|getPlugins|getAutoNodes|querySelectorAll|parseloopspec|console|Sizzle|pure|items|PURE|floor|libs|random|1000000|continue|str|root|core|sizzle|indexOf|tagName|Sly|checkClass|autoAttr|Element|mootools|set|nodeType|removeAttribute|switch|quot|value|arguments|parentNode|sly|createElement|Safari4|nbsp|getAttribute|cssText|setAttribute|class|allowed|modifiers|no|time|same|at|place|take|data|zA|only|available|arrays|objects|another|delete|choose|nPlease|iteration|running|current|word|have|more|than|one|Error|nA|directive|action|must|be|or|reserved|spec|getElementsByTagName|substr|search|engine|CSS|framework|library|JS|need|you|browser|nodevalue|run|nTo|IE8|and|nextSibling|splice|selected|ig|parseInt|FF3|iPhone|standalone|can|You|THEAD|TFOOT|div|new|TD|TH|_error|SPAN|display|none|_compiler|throw|alert|debugger|query|log|cssSelect|object|attach|publicMethods|toString|Object|fn|extend|INPUT|getElements|src|implement|select|addMethods|IMG|_a|_s|default|MooTools|Prototype|check'.split('|'),0,{}))
/*!
 * Modernizr JavaScript library 1.5
 * http://www.modernizr.com/
 *
 * Copyright (c) 2009-2010 Faruk Ates - http://farukat.es/
 * Dual-licensed under the BSD and MIT licenses.
 * http://www.modernizr.com/license/
 *
 * Featuring major contributions by
 * Paul Irish  - http://paulirish.com
 */
 window.Modernizr=function(i,e,I){function C(a,b){for(var c in a)if(m[a[c]]!==I&&(!b||b(a[c],D)))return true}function r(a,b){var c=a.charAt(0).toUpperCase()+a.substr(1);return!!C([a,"Webkit"+c,"Moz"+c,"O"+c,"ms"+c,"Khtml"+c],b)}function P(){j[E]=function(a){for(var b=0,c=a.length;b<c;b++)J[a[b]]=!!(a[b]in n);return J}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" "));j[Q]=function(a){for(var b=0,c,h=a.length;b<h;b++){n.setAttribute("type",a[b]);if(c=n.type!==
 "text"){n.value=K;/tel|search/.test(n.type)||(c=/url|email/.test(n.type)?n.checkValidity&&n.checkValidity()===false:n.value!=K)}L[a[b]]=!!c}return L}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var j={},s=e.documentElement,D=e.createElement("modernizr"),m=D.style,n=e.createElement("input"),E="input",Q=E+"types",K=":)",M=Object.prototype.toString,y=" -o- -moz- -ms- -webkit- -khtml- ".split(" "),d={},L={},J={},N=[],u=function(){var a={select:"input",
 change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"},b={};return function(c,h){var t=arguments.length==1;if(t&&b[c])return b[c];h=h||document.createElement(a[c]||"div");c="on"+c;var g=c in h;if(!g&&h.setAttribute){h.setAttribute(c,"return;");g=typeof h[c]=="function"}h=null;return t?(b[c]=g):g}}(),F={}.hasOwnProperty,O;O=typeof F!=="undefined"&&typeof F.call!=="undefined"?function(a,b){return F.call(a,b)}:function(a,b){return b in a&&typeof a.constructor.prototype[b]==="undefined"};
 d.canvas=function(){return!!e.createElement("canvas").getContext};d.canvastext=function(){return!!(d.canvas()&&typeof e.createElement("canvas").getContext("2d").fillText=="function")};d.geolocation=function(){return!!navigator.geolocation};d.crosswindowmessaging=function(){return!!i.postMessage};d.websqldatabase=function(){var a=!!i.openDatabase;if(a)try{a=!!openDatabase("testdb","1.0","html5 test db",2E5)}catch(b){a=false}return a};d.indexedDB=function(){return!!i.indexedDB};d.hashchange=function(){return u("hashchange",
 i)&&(document.documentMode===I||document.documentMode>7)};d.historymanagement=function(){return!!(i.history&&history.pushState)};d.draganddrop=function(){return u("drag")&&u("dragstart")&&u("dragenter")&&u("dragover")&&u("dragleave")&&u("dragend")&&u("drop")};d.websockets=function(){return"WebSocket"in i};d.rgba=function(){m.cssText="background-color:rgba(150,255,150,.5)";return(""+m.backgroundColor).indexOf("rgba")!==-1};d.hsla=function(){m.cssText="background-color:hsla(120,40%,100%,.5)";return(""+
 m.backgroundColor).indexOf("rgba")!==-1};d.multiplebgs=function(){m.cssText="background:url(//:),url(//:),red url(//:)";return/(url\s*\(.*?){3}/.test(m.background)};d.backgroundsize=function(){return r("backgroundSize")};d.borderimage=function(){return r("borderImage")};d.borderradius=function(){return r("borderRadius","",function(a){return(""+a).indexOf("orderRadius")!==-1})};d.boxshadow=function(){return r("boxShadow")};d.opacity=function(){var a=y.join("opacity:.5;")+"";m.cssText=a;return(""+m.opacity).indexOf("0.5")!==
 -1};d.cssanimations=function(){return r("animationName")};d.csscolumns=function(){return r("columnCount")};d.cssgradients=function(){var a=("background-image:"+y.join("gradient(linear,left top,right bottom,from(#9f9),to(white));background-image:")+y.join("linear-gradient(left top,#9f9, white);background-image:")).slice(0,-17);m.cssText=a;return(""+m.backgroundImage).indexOf("gradient")!==-1};d.cssreflections=function(){return r("boxReflect")};d.csstransforms=function(){return!!C(["transformProperty",
 "WebkitTransform","MozTransform","OTransform","msTransform"])};d.csstransforms3d=function(){var a=!!C(["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"]);if(a){var b=document.createElement("style"),c=e.createElement("div");b.textContent="@media ("+y.join("transform-3d),(")+"modernizr){#modernizr{height:3px}}";e.getElementsByTagName("head")[0].appendChild(b);c.id="modernizr";s.appendChild(c);a=c.offsetHeight===3;b.parentNode.removeChild(b);c.parentNode.removeChild(c)}return a};
 d.csstransitions=function(){return r("transitionProperty")};d.fontface=function(){var a;if(/*@cc_on@if(@_jscript_version>=5)!@end@*/0)a=true;else{var b=e.createElement("style"),c=e.createElement("span"),h,t=false,g=e.body,o,w;b.textContent="@font-face{font-family:testfont;src:url('data:font/ttf;base64,AAEAAAAMAIAAAwBAT1MvMliohmwAAADMAAAAVmNtYXCp5qrBAAABJAAAANhjdnQgACICiAAAAfwAAAAEZ2FzcP//AAMAAAIAAAAACGdseWYv5OZoAAACCAAAANxoZWFk69bnvwAAAuQAAAA2aGhlYQUJAt8AAAMcAAAAJGhtdHgGDgC4AAADQAAAABRsb2NhAIQAwgAAA1QAAAAMbWF4cABVANgAAANgAAAAIG5hbWUgXduAAAADgAAABPVwb3N03NkzmgAACHgAAAA4AAECBAEsAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAACAAMDAAAAAAAAgAACbwAAAAoAAAAAAAAAAFBmRWQAAAAgqS8DM/8zAFwDMwDNAAAABQAAAAAAAAAAAAMAAAADAAAAHAABAAAAAABGAAMAAQAAAK4ABAAqAAAABgAEAAEAAgAuqQD//wAAAC6pAP///9ZXAwAAAAAAAAACAAAABgBoAAAAAAAvAAEAAAAAAAAAAAAAAAAAAAABAAIAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEACoAAAAGAAQAAQACAC6pAP//AAAALqkA////1lcDAAAAAAAAAAIAAAAiAogAAAAB//8AAgACACIAAAEyAqoAAwAHAC6xAQAvPLIHBADtMrEGBdw8sgMCAO0yALEDAC88sgUEAO0ysgcGAfw8sgECAO0yMxEhESczESMiARDuzMwCqv1WIgJmAAACAFUAAAIRAc0ADwAfAAATFRQWOwEyNj0BNCYrASIGARQGKwEiJj0BNDY7ATIWFX8aIvAiGhoi8CIaAZIoN/43KCg3/jcoAWD0JB4eJPQkHh7++EY2NkbVRjY2RgAAAAABAEH/+QCdAEEACQAANjQ2MzIWFAYjIkEeEA8fHw8QDxwWFhwWAAAAAQAAAAIAAIuYbWpfDzz1AAsEAAAAAADFn9IuAAAAAMWf0i797/8zA4gDMwAAAAgAAgAAAAAAAAABAAADM/8zAFwDx/3v/98DiAABAAAAAAAAAAAAAAAAAAAABQF2ACIAAAAAAVUAAAJmAFUA3QBBAAAAKgAqACoAWgBuAAEAAAAFAFAABwBUAAQAAgAAAAEAAQAAAEAALgADAAMAAAAQAMYAAQAAAAAAAACLAAAAAQAAAAAAAQAhAIsAAQAAAAAAAgAFAKwAAQAAAAAAAwBDALEAAQAAAAAABAAnAPQAAQAAAAAABQAKARsAAQAAAAAABgAmASUAAQAAAAAADgAaAUsAAwABBAkAAAEWAWUAAwABBAkAAQBCAnsAAwABBAkAAgAKAr0AAwABBAkAAwCGAscAAwABBAkABABOA00AAwABBAkABQAUA5sAAwABBAkABgBMA68AAwABBAkADgA0A/tDb3B5cmlnaHQgMjAwOSBieSBEYW5pZWwgSm9obnNvbi4gIFJlbGVhc2VkIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgT3BlbiBGb250IExpY2Vuc2UuIEtheWFoIExpIGdseXBocyBhcmUgcmVsZWFzZWQgdW5kZXIgdGhlIEdQTCB2ZXJzaW9uIDMuYmFlYzJhOTJiZmZlNTAzMiAtIHN1YnNldCBvZiBKdXJhTGlnaHRiYWVjMmE5MmJmZmU1MDMyIC0gc3Vic2V0IG9mIEZvbnRGb3JnZSAyLjAgOiBKdXJhIExpZ2h0IDogMjMtMS0yMDA5YmFlYzJhOTJiZmZlNTAzMiAtIHN1YnNldCBvZiBKdXJhIExpZ2h0VmVyc2lvbiAyIGJhZWMyYTkyYmZmZTUwMzIgLSBzdWJzZXQgb2YgSnVyYUxpZ2h0aHR0cDovL3NjcmlwdHMuc2lsLm9yZy9PRkwAQwBvAHAAeQByAGkAZwBoAHQAIAAyADAAMAA5ACAAYgB5ACAARABhAG4AaQBlAGwAIABKAG8AaABuAHMAbwBuAC4AIAAgAFIAZQBsAGUAYQBzAGUAZAAgAHUAbgBkAGUAcgAgAHQAaABlACAAdABlAHIAbQBzACAAbwBmACAAdABoAGUAIABPAHAAZQBuACAARgBvAG4AdAAgAEwAaQBjAGUAbgBzAGUALgAgAEsAYQB5AGEAaAAgAEwAaQAgAGcAbAB5AHAAaABzACAAYQByAGUAIAByAGUAbABlAGEAcwBlAGQAIAB1AG4AZABlAHIAIAB0AGgAZQAgAEcAUABMACAAdgBlAHIAcwBpAG8AbgAgADMALgBiAGEAZQBjADIAYQA5ADIAYgBmAGYAZQA1ADAAMwAyACAALQAgAHMAdQBiAHMAZQB0ACAAbwBmACAASgB1AHIAYQBMAGkAZwBoAHQAYgBhAGUAYwAyAGEAOQAyAGIAZgBmAGUANQAwADMAMgAgAC0AIABzAHUAYgBzAGUAdAAgAG8AZgAgAEYAbwBuAHQARgBvAHIAZwBlACAAMgAuADAAIAA6ACAASgB1AHIAYQAgAEwAaQBnAGgAdAAgADoAIAAyADMALQAxAC0AMgAwADAAOQBiAGEAZQBjADIAYQA5ADIAYgBmAGYAZQA1ADAAMwAyACAALQAgAHMAdQBiAHMAZQB0ACAAbwBmACAASgB1AHIAYQAgAEwAaQBnAGgAdABWAGUAcgBzAGkAbwBuACAAMgAgAGIAYQBlAGMAMgBhADkAMgBiAGYAZgBlADUAMAAzADIAIAAtACAAcwB1AGIAcwBlAHQAIABvAGYAIABKAHUAcgBhAEwAaQBnAGgAdABoAHQAdABwADoALwAvAHMAYwByAGkAcAB0AHMALgBzAGkAbAAuAG8AcgBnAC8ATwBGAEwAAAAAAgAAAAAAAP+BADMAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAQACAQIAEQt6ZXJva2F5YWhsaQ==')}";
 e.getElementsByTagName("head")[0].appendChild(b);c.setAttribute("style","font:99px _,arial,helvetica;position:absolute;visibility:hidden");if(!g){g=s.appendChild(e.createElement("fontface"));t=true}c.innerHTML="........";c.id="fonttest";g.appendChild(c);h=c.offsetWidth*c.offsetHeight;c.style.font="99px testfont,_,arial,helvetica";a=h!==c.offsetWidth*c.offsetHeight;var v=function(){if(g.parentNode){a=j.fontface=h!==c.offsetWidth*c.offsetHeight;s.className=s.className.replace(/(no-)?fontface\b/,"")+
 (a?" ":" no-")+"fontface"}};setTimeout(v,75);setTimeout(v,150);addEventListener("load",function(){v();(w=true)&&o&&o(a);setTimeout(function(){t||(g=c);g.parentNode.removeChild(g);b.parentNode.removeChild(b)},50)},false)}j._fontfaceready=function(p){w||a?p(a):(o=p)};return a||h!==c.offsetWidth};d.video=function(){var a=e.createElement("video"),b=!!a.canPlayType;if(b){b=new Boolean(b);b.ogg=a.canPlayType('video/ogg; codecs="theora"');b.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"');b.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"')}return b};
 d.audio=function(){var a=e.createElement("audio"),b=!!a.canPlayType;if(b){b=new Boolean(b);b.ogg=a.canPlayType('audio/ogg; codecs="vorbis"');b.mp3=a.canPlayType("audio/mpeg;");b.wav=a.canPlayType('audio/wav; codecs="1"');b.m4a=a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")}return b};d.localStorage=function(){return"localStorage"in i&&i.localStorage!==null};d.sessionStorage=function(){try{return"sessionStorage"in i&&i.sessionStorage!==null}catch(a){return false}};d.webworkers=function(){return!!i.Worker};
 d.applicationCache=function(){var a=i.applicationCache;return!!(a&&typeof a.status!="undefined"&&typeof a.update=="function"&&typeof a.swapCache=="function")};d.svg=function(){return!!e.createElementNS&&!!e.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect};d.smil=function(){return!!e.createElementNS&&/SVG/.test(M.call(e.createElementNS("http://www.w3.org/2000/svg","animate")))};d.svgclippaths=function(){return!!e.createElementNS&&/SVG/.test(M.call(e.createElementNS("http://www.w3.org/2000/svg",
 "clipPath")))};for(var z in d)if(O(d,z))N.push(((j[z.toLowerCase()]=d[z]())?"":"no-")+z.toLowerCase());j[E]||P();j.addTest=function(a,b){a=a.toLowerCase();if(!j[a]){b=!!b();s.className+=" "+(b?"":"no-")+a;j[a]=b;return j}};m.cssText="";D=n=null;(function(){var a=e.createElement("div");a.innerHTML="<elem></elem>";return a.childNodes.length!==1})()&&function(a,b){function c(f,k){if(o[f])o[f].styleSheet.cssText+=k;else{var l=t[G],q=b[A]("style");q.media=f;l.insertBefore(q,l[G]);o[f]=q;c(f,k)}}function h(f,
 k){for(var l=new RegExp("\\b("+w+")\\b(?!.*[;}])","gi"),q=function(B){return".iepp_"+B},x=-1;++x<f.length;){k=f[x].media||k;h(f[x].imports,k);c(k,f[x].cssText.replace(l,q))}}for(var t=b.documentElement,g=b.createDocumentFragment(),o={},w="abbr|article|aside|audio|canvas|command|datalist|details|figure|figcaption|footer|header|hgroup|keygen|mark|meter|nav|output|progress|section|source|summary|time|video",v=w.split("|"),p=[],H=-1,G="firstChild",A="createElement";++H<v.length;){b[A](v[H]);g[A](v[H])}g=
 g.appendChild(b[A]("div"));a.attachEvent("onbeforeprint",function(){for(var f,k=b.getElementsByTagName("*"),l,q,x=new RegExp("^"+w+"$","i"),B=-1;++B<k.length;)if((f=k[B])&&(q=f.nodeName.match(x))){l=new RegExp("^\\s*<"+q+"(.*)\\/"+q+">\\s*$","i");g.innerHTML=f.outerHTML.replace(/\r|\n/g," ").replace(l,f.currentStyle.display=="block"?"<div$1/div>":"<span$1/span>");l=g.childNodes[0];l.className+=" iepp_"+q;l=p[p.length]=[f,l];f.parentNode.replaceChild(l[1],l[0])}h(b.styleSheets,"all")});a.attachEvent("onafterprint",
 function(){for(var f=-1,k;++f<p.length;)p[f][1].parentNode.replaceChild(p[f][0],p[f][1]);for(k in o)t[G].removeChild(o[k]);o={};p=[]})}(this,e);j._enableHTML5=true;j._version="1.5";s.className=s.className.replace(/\bno-js\b/,"")+" js";s.className+=" "+N.join(" ");return j}(this,this.document);
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
      var controller = parts[0].singularize();
      var action = parts[1]; // May be the id
      var id;

      var resource = resources[controller];
      if (!resource) {
        AdamElliot.frameManager.hideFrame();
        return false;
      }

      if (parts[0] == controller.pluralize())
        action = "index";
      else switch (action) {
        case "update":
        case "remove":
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
        if (currentFrame != frame) frame.remove();
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
    var controllerName = _controllerName.singularize();
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
    var modelName = (_controllerName || "").singularize();
    var activeBlock;

    this.templateManager = new AdamElliot.TemplateManager(modelName);
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
    AdamElliot.Controller.call(this, modelName);

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

    var remove = function(id) {
      delete data[id];
      dataIndex.splice(dataIndex.indexOf(id), 1);
      AdamElliot.frameManager.closeFrameByRoute(modelName + "/" + id);
    };

    this.afterCreate = this.afterUpdate = this.afterRemove = function() {
      AdamElliot.frameManager.closeFrame();
    };

    this.failedCreate = this.failedUpdate = this.failedRemove = function() {
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
        url: '/' + modelName + '/' + id + '.json',
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
        url: '/' + modelName + '.json',
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function(data) {
          insert(data);
          if (self.afterCreate) self.afterCreate(data);
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
      if (!data) {
        if (self.failedUpdate) self.failedUpdate(id);
        return;
      }

      data = self.scopedFormData(modelName, self.formHandler(data));

      $.ajax({
        url: '/' + modelName + '/' + id + '.json',
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

    this.remoteRemove = function(id) {
      if (self.beforeRemove) self.beforeRemove(id);

      $.ajax({
        url: '/' + modelName + '/' + id + '.json',
        type: 'DELETE',
        dataType: 'json',
        success: function() {
          remove(id);
          if (self.afterRemove) self.afterRemove(id);
        },
        error: function() {
          if (self.failedRemove) self.failedRemove(id);
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

      self.redirect(modelName + "/" + data[dataIndex[0]][self.dataKey]);
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

    this.remove = function(params) {
      var id = params[self.dataKey];
      AdamElliot.TemplateManager.showNotice("Confirm Delete",
        'Are you sure you want to delete?', {
        'no': function() { AdamElliot.frameManager.closeFrame(); },
        'yes': function() { self.remoteRemove(id); }
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
  AdamElliot.ResourceController.call(this, "post");
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
      'post<-posts': {
        '@data-route': function(arg) {
          var post = arg.item;
          return 'post/' + post.slug;
        },
        '.title': 'post.title',
        '.date': function(arg) {
          return arg.item['posted_on'].toDateString();
        },
        '.description': function(arg) {
          var post = arg.item;
          var firstChunk = post.body.match(/>([^<]*)</)[1];
          var firstWords = firstChunk.match(/([^\s]+\s){0,34}[^\s]+/)[0];
          return firstWords + (firstWords == firstChunk ? "" : "...");
        }
      }
    }
  });

  this.templateManager.defineTemplate('show', {
    '.title': 'title',
    '.permalink a@href': function(arg) {
      return '/permalink/post/' + arg.context['slug'];
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

    window.disqus_url = location.href.split('#')[0] + 'permalink/post/' + post['slug'];
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
      buttons['older'] = "post/" + this.getDataByIndex(post._index + 1)[this.dataKey];
    if (post._index > 0)
      buttons['newer'] = "post/" + this.getDataByIndex(post._index - 1)[this.dataKey];

    buttons['index'] = 'posts';

    if (AdamElliot.session.authenticated) {
      buttons['edit'] = 'post/update/' + post.slug;
      buttons['delete'] = 'post/remove/' + post.slug;
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
          return 'toy/' + toy.slug;
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
      return '/permalink/toy/' + arg.context['slug'];
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

    window.disqus_url = location.href.split('#')[0] + 'permalink/toy/' + toy['slug'];
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
      buttons['edit'] = 'toy/update/' + toy.slug;
      buttons['delete'] = 'toy/remove/' + toy.slug;
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

    var setAdminOnResponse = function(username, data) {
      if (data && data.authenticated) enableAdmin(data.username);
      else disableAdmin();
    };

    this.afterRemove = this.afterData = this.afterCreate = setAdminOnResponse;

    this.remove = function(params) {
      this.remoteRemove();
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
  AdamElliot.router.resource("post", new AdamElliot.PostsController);
  AdamElliot.router.resource("toy", new AdamElliot.ToysController);

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

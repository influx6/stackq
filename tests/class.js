var stacks = require('../stacks');
var structs = stacks.structs;

structs.JzGroup('Class specifications',function(_){

  var fruit = structs.Class({
    squeeze: function(){ return true; }
  });

  var berry = fruit.extends({
    squeeze: function(){
      return fruit.prototype.squeeze.apply(this,arguments);
    }
  });

  var whiteBerry = berry.extends({
    isWhite: function(){ return true; },
    squeeze: function(){
      return false;
    }
  });

  _('can i create a fruit',function($){
    $.sync(function(m){
      var ft = new m();
      structs.Expects.isFunction(m);
      structs.Expects.isObject(ft);
      structs.Expects.isTrue(ft.squeeze());
    });
  }).use(fruit);

  _('can i create a berry fruit',function($){
    $.sync(function(m){
      var ft = new m();
      structs.Expects.isFunction(m);
      structs.Expects.isObject(ft);
      structs.Expects.isTrue(ft.squeeze());
    });
  }).use(berry);

  _('can i extend a berryfuit',function($){
    $.sync(function(m){
      var ft = new m();
      structs.Expects.isFunction(m);
      structs.Expects.isObject(ft);
      structs.Expects.isFalse(ft.squeeze());
    });
  }).use(whiteBerry);

});

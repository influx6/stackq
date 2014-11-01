var stacks = require('../stackq');
var structs = stacks.structs;

structs.JzGroup('Class specifications',function(_){

  var fruit = structs.Class({
    squeeze: function(){ return true; }
  });

  var berry = fruit.extends({
    squeeze: function(){
      return this.$super();
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
      var ft = m.make();
      structs.Expects.isFunction(m);
      structs.Expects.isObject(ft);
      structs.Expects.isTrue(ft.squeeze());
    });
  }).use(fruit);

  _('can i create a berry fruit',function($){
    $.sync(function(m){
      var ft = m.make();
      structs.Expects.isFunction(m);
      structs.Expects.isObject(ft);
      structs.Expects.isTrue(ft.squeeze());
    });
  }).use(berry);

  _('can i extend a berryfuit to whiteberry',function($){
    $.sync(function(m){
      var ft = m.make();
      structs.Expects.isFunction(m);
      structs.Expects.isObject(ft);
      structs.Expects.isTrue(ft.isWhite());
      structs.Expects.isFalse(ft.squeeze());
    });
  }).use(whiteBerry);

});

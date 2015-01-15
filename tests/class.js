var stacks = require('../stackq');

stacks.JzGroup('Class specifications',function(_){

  var fruit = stacks.Class({
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

  var redwhiteberry = whiteBerry.extends({});

  _('is redwhiteberry a fruit',function($){
    $.sync(function(m){
      stacks.Expects.isTrue(fruit.isChild(m));
    });
  }).use(redwhiteberry);

  _('is a redwhiteberry instance a fruit',function($){
    $.sync(function(m){
      stacks.Expects.isTrue(fruit.isChildInstance(m));
    });
  }).use(redwhiteberry.make());

  _('can i create a fruit',function($){
    $.sync(function(m){
      var ft = m.make();
      stacks.Expects.isFunction(m);
      stacks.Expects.isObject(ft);
      stacks.Expects.isTrue(ft.squeeze());
    });
  }).use(fruit);

  _('can i create a berry fruit',function($){
    $.sync(function(m){
      var ft = m.make();
      stacks.Expects.isFunction(m);
      stacks.Expects.isObject(ft);
      stacks.Expects.isTrue(ft.squeeze());
    });
  }).use(berry);

  _('can i extend a berryfuit to whiteberry',function($){
    $.sync(function(m){
      var ft = m.make();
      stacks.Expects.isFunction(m);
      stacks.Expects.isObject(ft);
      stacks.Expects.isTrue(ft.isWhite());
      stacks.Expects.isFalse(ft.squeeze());
    });
  }).use(whiteBerry);

});

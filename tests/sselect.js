var stacks = require('../stackq');

stacks.JzGroup('StreamSelect specifications',function(_){

  var block = stacks.Stream.make();

  block.emit(1);
  block.emit(2);
  block.emit(3);
  block.emit(4);

  var select = stacks.StreamSelect.make(false,block);

  _('is it a valid stream select instance',function($){

    $.sync(function(m){
      stacks.Expects.truthy(m);
      stacks.Expects.isTrue(stacks.Stream.isType(m));
    });

    $.for(block);

  });

  _('can i get a single item',function($){

    var one = select.$.one();
    $.async(function(m,next,g){
      next();
      m.on(g(function(i){
        stacks.Expects.isNumber(i);
      }));
    });

    $.for(one);

  });

  _('can i get all item',function($){

    var all = select.$.all();

    $.async(function(m,next,g){
      next();
      m.on(g(function(i){
        stacks.Expects.isNumber(i);
      }));
    });

    $.for(all);

  });

  _('can i get all items as a list',function($){

    var all = select.$.list();

    $.async(function(m,next,g){
      m.on(g(function(i){
        stacks.Expects.isList(i);
      }));
      next();
    });

    $.for(all);

  });
});

var stacks = require('../stackq');

stacks.JzGroup('Stream specifications',function(_){

  var block = stacks.Stream.make();

  _('can i test stream',function($){

    $.sync(function(m){
      structs.Expects.truthy(m);
      structs.Expects.isTrue(stacks.Stream.isType(m));
    });

    $.async(function(m,next,g){
      next();
      m.on(g(function(f){
        structs.Expects.isNumber(m);
      }));
      m.emit(1);
    });

    $.for(block);

  });


});

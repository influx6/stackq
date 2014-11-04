var stacks = require('../stackq');

stacks.JzGroup('Stream specifications',function(_){

  var block = stacks.Stream.make();

  _('can i test stream',function($){

    $.sync(function(m){
      structs.Expects.truthy(m);
      structs.Expects.isTrue(stacks.Stream.isType(m));
    });

    $.async(function(m,next,g){
      m.on(g(function(f){
        structs.Expects.isNumber(f);
      }));
      m.emit(1);
      m.pause();
      m.emit(2);
      m.emit(3);
      m.resume();
      next();
    });

    $.for(block);

  });


});

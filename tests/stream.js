var stacks = require('../stackq');

stacks.JzGroup('Stream specifications',function(_){

  var block = stacks.Stream.make();

  _('can i test stream',function($){

    $.sync(function(m){
      stacks.Expects.truthy(m);
      stacks.Expects.isTrue(stacks.Stream.isType(m));
    });

    $.async(function(m,next,g){
      next();
      m.on(g(function(f){
        stacks.Expects.isNumber(f);
      }));
      m.emit(1);
      m.pause();
      m.emit(2);
      m.emit(3);
      m.resume();
    });

    $.for(block);

  });


});

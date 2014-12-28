var stacks = require('../stackq');

stacks.JzGroup('Stream specifications',function(_){

  var block = stacks.EventStream.make();
  block.events('data');

  _('can i test events',function($){

    $.sync(function(m){
      stacks.Expects.truthy(m);
      stacks.Expects.isTrue(stacks.Stream.isType(m));
    });

    $.async(function(m,next,g){
      m.on('data',g(function(f){
        stacks.Expects.isString(f);
      }));
      m.emit('data','alex');
      next();
    });

    $.for(block);

  });


});

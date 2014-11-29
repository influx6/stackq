var stacks = require('../stackq');

stacks.JzGroup('Mutator specifications',function(_){

  var m = stacks.Mutator();

  _('can i test mutator',function($){
    $.sync(function(m){
      stacks.Expects.isObject(m);
    });
  }).use(m);

  m.add(function(i){return i+1;});
  m.add(function(i){
    _('can i mutate values with +1',function($){
      $.sync(function(m){
        stacks.Expects.isNumber(m);
        stacks.Expects.isNumber(2);
      });
    }).use(i);
  });

  m.add(function(i){return i+4;});
  m.add(function(i){
    _('can i mutate values with +4',function($){
      $.sync(function(m){
        stacks.Expects.isNumber(m);
        stacks.Expects.isNumber(6);
      });
    }).use(i);
  });

  m.add(function(i){return i*4;});
  m.add(function(i){
    _('can i mutate values with *4',function($){
      $.sync(function(m){
        stacks.Expects.isNumber(m);
        stacks.Expects.isNumber(24);
      });
    }).use(i);
  });

  m.fire(1);
});

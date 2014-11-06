var stacks = require('../stackq');

stacks.JzGroup('Jazz specifications',function(_){

  _('can i test jazz',function($){

    $.sync(function(m){
      stacks.Expects.isString(m);
    });

  }).use('1');

  var statement = "its jazzy";
  _('can i test statements',function($){

    $.sync(function(m){
      stacks.Expects.isMust(m,statement);
    });

  }).use(statement);

});

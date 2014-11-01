var stacks = require('../stackq');

stacks.JzGroup('Jazz specifications',function(_){

  _('can i test jazz',function($){

    $.sync(function(m){
      structs.Expects.isString(m);
    });

  }).use('1');

  var statement = "its jazzy";
  _('can i test statements',function($){

    $.sync(function(m){
      structs.Expects.isMust(m,statement);
    });

  }).use(statement);

});

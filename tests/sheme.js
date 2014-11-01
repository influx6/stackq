var stacks = require('../stackq');

stacks.JzGroup('Scheme specifications',function(_){


  var vas = stacks.SchemaItem({},'name','string');


  _('can i test schemaitem',function($){

    $.sync(function(m){
      structs.Expects.truthy(m);
      console.log('get:',vas.name);
      vas.name = 'thunder';
      console.log('seted',vas.name);
      structs.Expects.truthy(m.name);
      vas.name = 'flappy';
      console.log('seted',vas.name);
      vas.name = 1;
      console.log('seted',vas.name);
    });

    $.for(vas);

  });


});

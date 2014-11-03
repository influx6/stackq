var stacks = require('../stackq');

stacks.JzGroup('Scheme specifications',function(_){


  var vas = stacks.Schema({},{
    name:'string',
    age: 'number',
    'class?': 'string',
    comments: 'collection<string,string>',
    'post*': {
      name: 'string',
      content: 'string'
    }
  });



  _('can i test schemaitem',function($){

    $.sync(function(m){
      structs.Expects.truthy(m);
      vas.name = 'thunder';
      structs.Expects.truthy(m.name);
    });

    $.for(vas);

  });


});

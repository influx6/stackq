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
    },
    'wallet':'sucks'
  },{
    wallet:{
      copy: true
    }
  });

  var tas = {
    name: 'alex',
    age: 20,
    class:'CS 2013',
    post:{ name: 'alex',content: 'slick'},
    comments: {'1': 1},
    wallet: 'sucks',
  };

  _('can i test schema',function($){

    $.sync(function(m){
      stacks.Expects.truthy(m);
      vas.name = 'thunder';
      stacks.Expects.truthy(m.name);
      stacks.Expects.truthy(m.validate);
    });

    $.for(vas);

  });

  _('can i validate with a schema',function($){

    $.async(function(m,nxt,g){
      m.validate(tas,g(function(f){
        stacks.Expects.falsy(f);
      }));
      return nxt();
    });

    $.for(vas);

  });


});

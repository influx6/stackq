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

  var tas = {
    name: 'alex',
    age: 20,
    class:'CS 2013',
    post:{ name: 'alex',content: 'slick'},
    comments: {'1': 1},
  };


  vas.validate(tas,function(f,r){
    console.log('vas report:',f,r);
  });

  _('can i test schema',function($){

    $.sync(function(m){
      structs.Expects.truthy(m);
      vas.name = 'thunder';
      structs.Expects.truthy(m.name);
      structs.Expects.truthy(m.validate);
    });

    $.for(vas);

  });

  _('can i validate with a schema',function($){

    $.async(function(m,nxt,g){
      nxt();
      // vas.validate(tas,g(function(f){
      //   console.log('deed it go well',f);
      //   structs.Expects.truthy(f);
      // }));
    });

    $.for(vas);

  });


});

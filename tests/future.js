var _ = require('../stackq');
_.Jazz('Stream specifications',function(k){

  var val = _.Future.value('alex');
  var then = _.Future.ms(function(){
      throw "socker";
  },10000);
  var codethen = _.Future.wait(val,then);

  var fs = _.FutureStream.make();

  fs.on('data',function(f){
    console.log('getting data:',f);
  });

  fs.on('dataCount',function(f){
    console.log('getting data count:',f);
  });

  fs.stream().emit('alex');
  fs.completeError(new Error('sorry'));
  fs.stream().emit('wonder');


  k('can i create a future',function($){
    $.sync(function(m){
      _.Expects.truthy(m);
      _.Expects.isTrue(_.Future.isType(m));
    });
  }).use(val);

  k('can i complete a future',function($){
    $.sync(function(m,g){
      m.then(g(function(f){
        _.Expects.is(f,'alex');
      }));
    });
  }).use(val);

  k('can i fail a future',function($){
    $.sync(function(m,g){
      m.onError(g(function(f){
        _.Expects.is(f,'socker');
      }));
    });
  }).use(then);

  k('can i wait for a set of future',function($){
    $.sync(function(m,g){
      m.onError(g(function(f){
        _.Expects.is(f,'socker');
      }));
    });
  }).use(codethen);

});

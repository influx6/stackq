var _ = require('../stackq');
_.Jazz('Immutate specifications',function(k){

  var val = _.Immutate.value('alex');
  var vad = _.Immutate.value({ a:1, b:2, c: 5});
  var vax = _.Immutate.value(vad);
  var vaxd = vax.set('b',40);

  k('can i create a immutate',function($){
    $.sync(function(m){
      _.Expects.truthy(m);
      _.Expects.isTrue(_.Immutate.isType(m));
      _.Expects.isTrue(_.Immutate.isInstance(m));
    });
  }).use(val);


  val.then(_.tags.tagDefer('val-ready'));
  vad.then(_.tags.tagDefer('vad-ready'));
  vax.then(_.tags.tagDefer('vax-ready'));

  console.log(_.Future.isType(val));
  
});


var _ = require('../stackq');
_.Jazz('Immutate specifications',function(k){

  var f = _.Sequence.value([1,3,4,5,6,8,9,20,4,6]);
  var map = f.map(function(v){ return v * 2 });
  var memo = map.memoized();


  k('can i create a sequence?',function($){
    $.sync(function(m){
      _.Expects.isTrue(_.Sequence.instanceBelongs(m));
      _.Expects.isTrue(_.CollectionSequence.instanceBelongs(m));
    });
  }).use(f);

  k('can i map the sequence by 2?',function($){
    $.sync(function(m){
      _.Expects.isTrue(_.Sequence.instanceBelongs(m));
      _.Expects.is(m.get(1),f.get(1) * 2);
    });
  }).use(map);

  k('can i create a memoized sequence from result?',function($){
    $.sync(function(m){
      _.Expects.isTrue(_.MemoizedSequence.instanceBelongs(m));
      _.Expects.isNot(m.values(),map.values());
      _.Expects.is(m.values(),memo.values());
    });
  }).use(memo);


});


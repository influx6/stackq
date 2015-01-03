var _ = require('../stackq');
_.Jazz('Stream specifications',function(k){

  var pr = _.Persisto.make();
  pr.config({ id: 'persisto'});

  pr.push('thunder');

  k('can i create a persisto',function(h){
    h.sync(function(d,g){
      _.Expects.truthy(_.Persisto.isInstance(d));
    });
  }).use(pr);

  var sm = pr.stream();

  k('can i create a persisto stream',function(h){
    h.sync(function(d,g){
      _.Expects.truthy(_.Stream.isInstance(d));
      _.Expects.isFunction(d.dropConnection);
    });
  }).use(sm);

  k('can i listen to persisto stream',function(h){
    h.async(function(d,n,g){
      n();
      _.Expects.truthy(_.Stream.isInstance(d));
      d.on(g(function(packet){
        _.Expects.isString(packet);
      }));
    });
  }).use(sm);

  pr.push('scarlet');
  pr.push('judge');
  sm.dropConnection();
  pr.push('drug');
  pr.close()
});

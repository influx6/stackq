var _ = require('../stackq');
_.Jazz('Immutate specifications',function(k){

  var key = _.Immutate.transform(1);
  var atom = _.Immutate.transform({a:1,b: 2,c: { e: 3 }});
  var risk = _.Immutate.transform([1,3,4,5,6]);

  var ac = atom.snapshot();
  var cmap = atom.snapshot('c');
  var acs = atom.snapshot('c.e');
  var kc = key.snapshot();

  var acg = atom.ghost('c');

  k('can i create a object immutate',function($){
    $.sync(function(m){
      _.Expects.isTrue(_.Immutate.instanceBelongs(m));
      _.Expects.is(m.toJS()['a'],1);
    });
  }).use(atom);

  k('can i create a immutate cursor',function($){
    $.sync(function(m){
      _.Expects.isTrue(_.ImmutateCursor.instanceBelongs(m));
      _.Expects.isTrue(_.ValueCursor.instanceBelongs(m));
      _.Expects.is(m.value(),1);
    });
  }).use(kc);

  k('is atom.toJS a real clone?',function($){
    $.sync(function(m){
      var js = m.toJS(), ob = m.value();
      _.Expects.isNot(ob,js);
      _.Expects.is(Object.keys(js).length,Object.keys(ob).length);
    });
  }).use(atom);
  
  k('can i get mutate value using cursors',function($){
    $.sync(function(m){
      _.Expects.is(m,3);
    });
  }).use(acs.value());

  acs.set(20);

  k('can i mutate value using cursors',function($){
    $.sync(function(m){
      _.Expects.is(m,20);
    });
  }).use(acs.value());
 
  cmap.set('b','rocker');

  k('can i add value using cursors',function($){
    $.sync(function(m){
      _.Expects.is(m,'rocker');
    });
  }).use(cmap.get('b').value());


});

var _ = require('../stackq');
_.Jazz('Immutate specifications',function(k){


  var map = { a:1, b: 2, c: { e: 3 } };
  var atom = _.Immutate.value(map);
  var risk = _.Immutate.value([1,3,4,5,6]);

  var cmap = atom.get('c');
  var acs = atom.get('c.e');

  k('can i create a object immutate',function($){
    $.sync(function(m){
      _.Expects.isTrue(_.Immutate.instanceBelongs(m));
      _.Expects.is(m.toObject(),map);
    });
  }).use(atom);


  k('can i create a immutate cursor',function($){
    $.sync(function(m){
      _.Expects.isTrue(_.ImmutateCursor.instanceBelongs(m));
      _.Expects.is(m.value(),3);
    });
  }).use(acs);


  k('is atom.toJS a real clone?',function($){
    $.sync(function(m){
      var js = m.toJS(), ob = m.toObject();
      _.Expects.isNot(ob,js);
      _.Expects.is(Object.keys(js).length,Object.keys(ob).length);
    });
  }).use(atom);
  
  k('can i get mutate value using cursors',function($){
    $.sync(function(m){
      _.Expects.is(m.e,3);
    });
  }).use(cmap.value());

  cmap.set('e',20);

  k('can i mutate value using cursors',function($){
    $.sync(function(m){
      _.Expects.is(m.e,20);
    });
  }).use(cmap.value());
  
  cmap.set('b','rocker');

  k('can i add value using cursors',function($){
    $.sync(function(m){
      _.Expects.is(m,'rocker');
    });
  }).use(cmap.get('b').value());

  console.log('atom:',atom.toJS());
  cmap.set('f',risk);
  console.log('rk:',cmap.toJS());

});

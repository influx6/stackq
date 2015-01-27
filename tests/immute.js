var _ = require('../stackq');
_.Jazz('Immutate specifications',function(k){

  var single = _.Immutate.value('alex');

  k('can i create a single value immutate',function($){
    $.sync(function(m){
      _.Expects.isTrue(_.Immutate.instanceBelongs(m));
      _.Expects.isObject(m.toObject());
      _.Expects.is(_.enums.pluckIn(m.toObject(),['value']),'alex');
      _.Expects.isTrue(m.has('value'));
    });
  }).use(single);

  var map = { a:1, b: 2, c: { e: 3 } };
  var atom = _.Immutate.value(map);

  k('can i create a object immutate',function($){
    $.sync(function(m){
      _.Expects.isTrue(_.Immutate.instanceBelongs(m));
      _.Expects.is(m.toObject(),map);
    });
  }).use(atom);

  var acs = atom.get('c.e');

  k('can i create a immutate cursor',function($){
    $.sync(function(m){
      _.Expects.isTrue(_.ImmutateCursor.instanceBelongs(m));
      _.Expects.is(m.value(),3);
    });
  }).use(acs);

  var cmap = atom.get('c');

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

});

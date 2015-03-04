var _ = require('../stackq');
_.Jazz('WhereMiddleware specifications',function(k){

  var map = _.WhereMiddleware.make({ name:'map'},function(f){
    k('can i get results',function($){
      $.sync(function(m){
        _.Expects.isObject(m);
        _.Expects.is(m.loc,18);
      });
    }).use(this);
  });

  map.where('get',function(control,lat,log){
    this.loc = lat + log;
    return control.next();
  });

  k('can i create a wheremiddle',function($){
    $.sync(function(m){
      _.Expects.truthy(_.WhereMiddleware.instanceBelongs(m));
      _.Expects.isFunction(m.where);
      _.Expects.isFunction(m.unwhere);
    });
  }).use(map);

  // map.rack([{op:'get',args:[8,10]}]);

  var ch = map.chain();

  k('can i create a wheremiddle chain',function($){
    $.sync(function(m){
      _.Expects.isFunction(m.get);
      _.Expects.isFunction(m.use);
    });
  }).use(ch);

  ch.get(8,10).get(2,16).out();

});

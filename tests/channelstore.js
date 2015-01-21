var _ = require('../stackq');

_.Jazz('Class specifications',function(r){

  var fruit = _.ChannelStore.make('wrap');
  fruit.newIn('sid','*');
  fruit.newOut('sid','*');

  r('can i create a channelstore',function($){
    $.sync(function(m){
      _.Expects.truthy(_.ChannelStore.instanceBelongs(fruit));
    });
  }).use(fruit);

  r('do i have a in-channel called sid',function($){
    $.sync(function(m){
      _.Expects.truthy(fruit.in('sid'));
    });
  }).use(fruit);

  r('do i have a out-channel called sid',function($){
    $.sync(function(m){
      _.Expects.truthy(fruit.out('sid'));
    });
  }).use(fruit);

});

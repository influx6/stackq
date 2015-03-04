var stacks = require('../stackq'),
    enums = stacks.enums;

stacks.Jazz('compare_engine specifications',function(_){

  var list = [300,3,45,6,1,5,65,2,565,23,45,677,2325,4,665,4545];
  var range = { from: 1, to: 7 };
  var xrange = stacks.Util.extends({},range);

  _('is the largest number == 65 from indexes: 1 to 7',function(k){
    k.sync(function(d,g){
     stacks.Expects.is(enums.compareEngine(list,enums.max(),range),65);
    });
  }).use(list);

  _('is the min number == 2 from indexes: 1 to 7',function(k){
    k.sync(function(d,g){
     stacks.Expects.is(enums.compareEngine(list,enums.min(),xrange),2);
    });
  }).use(list);

  _('is the largest number == 4545',function(k){
    k.sync(function(d,g){
     stacks.Expects.is(enums.compareEngine(list,enums.max()),4545);
    });
  }).use(list);

  _('is the smallest number == 1',function(k){
    k.sync(function(d,g){
     stacks.Expects.is(enums.compareEngine(list,enums.min()),1);
    });
  }).use(list);

  _('is the sorted list equal to the originals length of '+list.length,function(k){
    k.sync(function(d,g){
     stacks.Expects.is(d.length,list.length);
    });
  }).use(enums.heapSortSimple(list));

});

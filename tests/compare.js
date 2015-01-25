var stacks = require('../stackq');

stacks.Jazz('compare_engine specifications',function(_){

  var list = [1,3,45,6,7,5,65,2,565,23,45,677,2325,4,665,4545];
  var range = { from: 1, to: 7 };

  _('is the largest number == 65 from indexes: '+JSON.stringify(range),function(k){
    k.sync(function(d,g){
     stacks.Expects.is(stacks.enums.compareEngine(list,function(m,n){
       return m > n;
     },stacks.Util.extends({},range)),65);
    });
  }).use(list);

  _('is the largest number == 2 from indexes: '+JSON.stringify(range),function(k){
    k.sync(function(d,g){
     stacks.Expects.is(stacks.enums.compareEngine(list,function(m,n){
       return m < n;
     },stacks.Util.extends({},range)),2);
    });
  }).use(list);

  _('is the largest number == 4545',function(k){
    k.sync(function(d,g){
     stacks.Expects.is(stacks.enums.compareEngine(list,function(m,n){
       return m > n;
     }),4545);
    });
  }).use(list);

  _('is the smallest number == 1',function(k){
    k.sync(function(d,g){
     stacks.Expects.is(stacks.enums.compareEngine(list,function(m,n){
       return m < n;
     }),1);
    });
  }).use(list);

});

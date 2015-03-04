var _ = require('stackq');

var numbers = [1,4,5,6,7,8];
var seq = _.Immutate.transform(numbers);
var multiply = function(i){ 
  return i.value() * 2 
};

var map = seq.snapshot('').map(multiply);
var mapi = seq.ghost().map(multiply);

console.log(map.values());
console.log(mapi.values());

var _ = require('../stackq');

var ix = _.enums.nextIterator([1,32,23,43,5,143],function(e,i){
  console.log('ix:',e);
  if(e != 43)
     ix.next();
},null,null,{
  reverse: false,
});

ix.next();

var foundBy = _.enums.pickMatch({
  name: 'alex',
  day: 'saturday',
  color: /red|green/ 
},function(map,val,name){
  if(_.valids.containsKey(map,name)){
    if(_.valids.isRegExp(val)) return val.test(map[name]);
    if(_.valids.isFunction(val)) return val.call(null,map[name]);
    return val == map[name];
  }
  return false;
});


console.log(foundBy({
  name: 'alex',
  day: 'saturday',
  color: 'red'
},{
  name: 'alex',
  day: 'sunday',
  color: 'red'
},{
  name: 'alex',
  day: 'saturday',
  color: 'green'
}));


var a = { a:1, b: { f: { c:4, g: { f:20 } } } };
var pluck = _.enums.pluckWhile(a,function(v,r,next,d){
  return next();
});

_.Asserted((20 === pluck(['b','f','g','f'])),'value must be 20');
_.Asserted(('boo' === pluck(['b','f','c','f'],'boo')),'value must be boo');

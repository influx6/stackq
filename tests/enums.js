var _ = require('../stackq');

var list = [1,32];
var ix = _.enums.nextIterator(list,function(e,i){
  if(e == 30) return;
  return process.nextTick(function(){ ix.next();});
},null,null,{
  reverse: false,
});

ix.next();
list.push(20);
list.push(40);
list.push(30);

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

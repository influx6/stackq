var stacks = require('../stackq.js');

var q = stacks.structs.WorkQueue();
var final = function(f){
  console.log('final call',f);
};

q.queue(function(f){
  console.log('1st call',f);
});
q.queue(final);
q.queue(function(f){
  console.log('2nd call',f);
});
q.queue(function(f){
  console.log('3rd call',f);
});
q.queue(function(f){
  console.log('4th call',f);
});

q.emit(1);
q.unqueue(final);
q.emit(2);
q.emit(4);
q.emit(6);
q.emit(7);

var contract = stacks.structs.Contract('alex');
var messagePicker = function(m){ return m['message']; };
contract.onPass(function(i){ console.log('passed',i); });
contract.oncePass(function(i){ console.log('once passed',i); });
contract.onReject(function(i){ console.log('failed',i); });
contract.onceReject(function(i){ console.log('failed once',i); });
contract.interogate({'message':'alex','data':[13,32]},messagePicker);
contract.interogate({'message':'alex','data':[13]},messagePicker);
contract.interogate({'message':'felix','data':[200]},messagePicker);
contract.interogate({'message':'bence','data':'john'},messagePicker);

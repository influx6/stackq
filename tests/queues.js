var core = require('../stackq.js');

var gd = core.GreedQueue();

var bd = gd.queue(function(f){
  /*console.log('will it be love',f);*/
  if(f == 'love') return this.ok();
  return this.not();
});

bd.onOk(function(f){ console.log('love accepted!',f); });

var rd = gd.queue(function(f){
  /*console.log('rocking',f,':',f == 'rocker');*/
  if(f == 'rocker') return this.ok();
  return this.not();
});

rd.onOk(function(f){ console.log('rocker accepted!',f); });
var fd = gd.queue(function(f){
  if(f == 100) return this.ok();
  return this.not();
});
fd.onOk(function(f){ console.log('100 accepted!',f); });


gd.emit(100);
gd.emit("rocker");
gd.emit('love');
gd.emit(10);
console.log('----------new-test----');
gd.dequeue(rd);
gd.emit("rocker");
gd.emit(100);
gd.emit('love');
gd.emit(10);

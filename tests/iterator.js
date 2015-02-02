var s = require('stackq');
var f = s.SkipBackwardCollectionIterator([1,3,4,5,6,8,9,20,4,6],4);

while(f.hasNext()){
  f.moveNext();
  console.log('index:',f.getIndex(),'item:',f.current());
};


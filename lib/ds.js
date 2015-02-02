module.exports = (function(core){

  var as = ds = core, util = as.Util;

  ds.NativeIterator = function(){
    var co = { index: -1, max: 0, cache: null,cachedIndex: -1 , skip: null, noUpdate: false};
    util.extends(co,{
      current: function(){},
      updateRange: function(){},
      getIndex: util.bind(function(){ return this.index; },co),
      reset: util.bind(function(){ 
        this.index = -1;
        this.cachedIndex = -1;
        this.cache = null;
      },co),
      hasNext: util.bind(function(){
        return this.index < this.max - 1;
      },co),
      moveNext: util.bind(function(){
        if(!this.hasNext()) return;
        this.index += 1;
        this.cachedIndex = this.index;
        if(!this.noUpdate) this.updateRange();
      },co),
    });

    return co;
  };

  ds.ForwardIterator = function(objfn){
    core.Asserted(core.valids.Function(objfn),'need a function');
    var nc = ds.NativeIterator();
    util.extends(nc,{
      current: util.bind(function(){
        return objfn()[this.index];
      },nc),
    });
    return nc;
  };

  ds.BackwardIterator = function(objfn){
    core.Asserted(core.valids.Function(objfn),'need a function');
    var nc = ds.NativeIterator();
    var gind = nc.getIndex;
    var getidx = function(){
      if(gind() <= -1) return nc.max + gind();
      return nc.max + (-1 * (gind() + 1));
    };

    util.extends(nc,{
      getIndex: util.bind(function(){
        return getidx();
      },nc),
      current: util.bind(function(){
        return objfn()[getidx()];
      },nc),
    });
    return nc;
  };

  ds.SkipForwardIterator = function(objfn,n){
    core.Asserted(core.valids.Function(objfn),'need a function as 1st arg*');
    core.Asserted(core.valids.Number(n),'need a number for skipping as 2nd arg*');

    var nc = ds.NativeIterator();
    var gid = nc.getIndex;
    nc.skip = n;
    nc.index = n;
    util.extends(nc,{
      current: util.bind(function(){
        return objfn()[this.index];
      },nc),
    });
    return nc;
  };

  ds.SkipBackwardIterator = function(objfn,n){
    core.Asserted(core.valids.Function(objfn),'need a function as 1st arg*');
    core.Asserted(core.valids.Number(n),'need a number for skipping as 2nd arg*');
    var nc = ds.NativeIterator();
    var gind = nc.getIndex;
    var getidx = function(){
      if(gind() <= -1) return nc.max + gind();
      return nc.max + (-1 * (gind() + 1));
    };
  
    nc.skip = n;
    nc.max = objfn().length - n;
    nc.noUpdate = true;

    util.extends(nc,{
      getIndex: util.bind(function(){
        return getidx();
      },nc),
      current: util.bind(function(){
        return objfn()[getidx()];
      },nc),
    });
    return nc;
  };

  ds.SkippingForwardIterator = function(objfn,n){
    core.Asserted(core.valids.Function(objfn),'need a function as 1st arg*');
    core.Asserted(core.valids.Number(n),'need a number for skipping as 2nd arg*');

    var nc = ds.NativeIterator();
    var gid = nc.getIndex;
    var mv = nc.moveNext;
    nc.max = (objfn().length);
    nc.skip = n;

    util.extends(nc,{
      hasNext: util.bind(function(){
        return this.index < this.max - 1 && (this.max - this.index > this.skip);
      },nc),
      current: util.bind(function(){
        return objfn()[this.getIndex()];
      },nc),
      moveNext: util.bind(function(){
        mv();
        this.index += this.skip;
      },nc)
    });
    return nc;
  };

  ds.SkippingBackwardIterator = function(objfn,n){
    core.Asserted(core.valids.Function(objfn),'need a function as 1st arg*');
    core.Asserted(core.valids.Number(n),'need a number for skipping as 2nd arg*');
    var nc = ds.NativeIterator();
    var gind = nc.getIndex;
    var mv = nc.moveNext;
    var rs = nc.reset;
    var hi = nc.hasNext;

    nc.noUpdate = true;
    nc.skip = n + 1;
    nc.max = (objfn().length);

    var inc,cur;

    var getidx = function(){
      cur = gind();
      inc = nc.max - cur;
      return inc;
    };
  

    util.extends(nc,{
      hasNext: util.bind(function(){
        return this.index < this.max && (getidx() - this.skip > -1);
      },nc),
      getIndex: util.bind(function(){
        return getidx();
      },nc),
      current: util.bind(function(){
        return objfn()[getidx()];
      },nc),
      moveNext: util.bind(function(){
        if(!this.hasNext()) return;
        if(this.index <= -1) this.index += 1;
        this.index += this.skip;
        this.cachedIndex = this.index;
        if(!this.noUpdate) this.updateRange();
      },nc),
    });
    return nc;
  };

  ds.CollectionIterator = function(){
    var args = core.enums.toArray(arguments),
        first = core.enums.first(args),
        obj = core.enums.second(args),
        rest = core.enums.nthRest(args,2);

    core.Asserted(core.valids.Function(first),'function is need as first arg*');

    var haslen = core.valids.List(obj) && core.valids.String(obj) ? true : false;
    var keys = haslen ? obj : core.enums.keys(obj);
    var fnc = first.apply(first,[function(){ return keys; }].concat(rest));
    var fncur = fnc.current;
    var fnind = fnc.getIndex;

    if(core.valids.not.exists(fnc.max)) fnc.max = keys.length;

    util.extends(fnc,{
      getIndex: util.bind(function(){
        // if(this.index === -1) return this.index;
        return haslen ? fnind() : keys[fnind()];
      },fnc),
      updateRange: util.bind(function(){
        if(haslen){
          if(obj.length >= this.max) this.max = keys.length;
        }else{
          keys = core.enums.keys(obj);
          this.max = keys.length;
        }
      },fnc),
      current: util.bind(function(){
        return haslen ? fncur() : obj[fncur()];
      })
    });
    return fnc;
  };
  
  ds.ForwardCollectionIterator = function(obj){
    var args = core.enums.toArray(arguments);
    return ds.CollectionIterator.apply(ds.CollectionIterator,[ds.ForwardIterator].concat(args));
  };

  ds.BackwardCollectionIterator = function(obj){
    var args = core.enums.toArray(arguments);
    return ds.CollectionIterator.apply(ds.CollectionIterator,[ds.BackwardIterator].concat(args));
  };

  ds.SkipOnceForwardCollectionIterator = function(obj,n){
    var args = core.enums.toArray(arguments);
    return ds.CollectionIterator.apply(ds.CollectionIterator,[ds.SkipForwardIterator].concat(args));
  };

  ds.SkipOnceBackwardCollectionIterator = function(obj){
    var args = core.enums.toArray(arguments);
    return ds.CollectionIterator.apply(ds.CollectionIterator,[ds.SkipBackwardIterator].concat(args));
  };

  ds.SkipForwardCollectionIterator = function(obj,n){
    var args = core.enums.toArray(arguments);
    return ds.CollectionIterator.apply(ds.CollectionIterator,[ds.SkippingForwardIterator].concat(args));
  };

  ds.SkipBackwardCollectionIterator = function(obj){
    var args = core.enums.toArray(arguments);
    return ds.CollectionIterator.apply(ds.CollectionIterator,[ds.SkippingBackwardIterator].concat(args));
  };


  ds.DS = function(){
    return {
       isDS: function(){ return true; }
    };
  };

  ds.Node = function(d){
    var marker = false;
    return {
      data: d,
      mark: function(){ marker = true; },
      unmark: function(){ marker = false },
      marked: function(){ return (marker === true); },
      _reset: function(){ this.unmark(); this.data = null; },
      isNode: function(){ return true; },
      isReset: function(){
        if(!this.marked() && !util.isValid(this.data)) return true;
        return false;
      },
    }
  };

  ds.ListNode = function(data){
    var node = ds.Node(data);
    var mix = ({
      left:null,
      right: null,
      root: null,
      onMark: util.bind(function(){
        this.mark();
        if(this.left) this.left.onMark();
        if(this.right) this.right.onMark();
      },node),
      offMark: util.bind(function(){
        this.unmark();
        if(this.left) this.left.offMark();
        if(this.right) this.right.offMark();
      },node),
      reset: util.bind(function(){
        if(this.isReset()) return null;
        this._reset();
        if(this.left && this.left != this) this.left.reset();
        if(this.right && this.right != this) this.right.reset();
      },node)
    });
    util.extends(node,mix);
    return node;
  };

  ds.List = function(max){
    var core = ds.DS();
    util.extends(core,{
      max: max,
      root: null,
      tail: null,
      counter: as.Counter(),
      size: util.bind(function(){ return this.counter.count(); },core),
      isEmpty: util.bind(function(){
         return ((this.root && this.tail) === null);
      },core),
      isFull: util.bind(function(){
        return (this.counter.count() >= this.max && this.max !== null);
      },core),
      iterator: util.bind(function(){
        return ds.ListIterator(this);
      },core),
      clear: util.bind(function(){
        if(this.root) this.root.reset();
      },core),
      add: util.bind(function(data){
        if(this.isFull()) return;
        if(this.isEmpty()){
          this.root = this.tail = ds.ListNode(data);
          this.root.left = this.tail;
          this.tail.right = this.root;
          this.counter.up();
          return this.tail;
        }

        var cur = this.tail;
        var left = cur.left;
        var right = cur.right;

        this.tail = ds.ListNode(data);
        this.tail.right = this.root;
        this.tail.left = cur;

        cur.right = this.tail;

        this.root.left = this.tail;

        this.counter.up();
        return this.tail;
      },core),
      append: util.bind(function(d){ return this.add(d); },core),
      prepend: util.bind(function(data){
        if(this.isFull()) return;
        if(this.isEmpty()){
          this.root = this.tail = ds.ListNode(data);
          this.root.left = this.tail;
          this.tail.right = this.root;
          this.counter.up();
          return this.root;
        }
        var cur = this.root;
        var left = cur.left;
        var  right = cur.right;

        this.root = ds.ListNode(data);

        this.root.left = this.tail;
        this.root.right = cur;

        this.tail.right = this.root;

        cur.left = this.root;

        this.counter.up();

        return this.root;
      },core),
      removeHead: util.bind(function(){
        if(this.isEmpty()){
          // this.events.emit('empty',this);
          return;
        }

        var root = this.root;
        left = root.left;
        right = root.right;

        if(root === this.tail){
          this.tail = this.root = null;
          this.counter.blow();
        }
        else{
          this.root = right;
          this.root.left = left;
          left.right = right;
          root.left = root.right = null;
        }

        // this.events.emit('removeHead',root);
        this.counter.down();
        return root;
      },core),
      removeTail: util.bind(function(){
        if(this.isEmpty()){
          // this.events.emit('empty',this);
          return;
        }

        var tail = this.tail;
        left = tail.left;
        right = tail.right;

        if(tail === this.root){
          this.tail = this.root = null;
          this.counter.blow();
        }
        else{
          this.tail = left;
          this.tail.right = right;
          right.left = this.tail;
          tail.left = tail.right = null;
        }

        // this.events.emit('removeTail',tail);
        this.counter.down();
        return tail;
      },core),
      cascadeBy: util.bind(function(fn){
        return this.dit.cascadeBy(fn);
      },core),
      isList: function(){
        return true;
      }
    });

    core.dit = core.iterator();
    return core;
  };

  ds.Iterator = function(d){
    if(util.isFunction(d.isList) && !d.isList()) throw "Supply a ds.List object";

    return {
      ds: d,
      state:0,
      track: null,
      current: function(){
        if(this.track === null) return;
        return this.track.data;
      },
      currentNode: function(){
        return this.track;
      },
      move: function(pre,cur,post){
        if(this.state === -1) this.reset();
        if(this.ds === null || this.ds.root === null){
          return false;
        }

        if(pre(this.ds,this)){
          this.state = 1;
          if(this.ds.size() === 1){
            this.state = 0;
          }
          return true;
        }
        else if(cur(this.ds,this)){
          this.state = 2;
          return true;
        }
        else if(post(this.ds,this)){
          this.state = -1;
          return true;
        }

        this.reset();
        return false;
      },
      reset: function(){
          this.state = 0;
          this.track =  null;
          return false;
      },
      close: function(){
        this.reset();
      },
      isIterator: function(){
        return true;
      }
   };
  };

  ds.ListIterator = function(d){
    var ls = ds.Iterator(d);

    util.extends(ls,{
       moveNext:  function(){
            return this.move(function(ds,list){
                if(list.track === null){
                  list.track = ds.root;
                  return true;
                }
                  return false;
              },
              function(ds,list){
                if(list.track.right !== ds.root){
                  list.track = list.track.right;
                  return true;
                }
                return false;
              },
              function(ds,list){
                if(list.track.right !== ds.root) return true;
                return false;
              });
        },
        movePrevious: function(){
          return this.move(function(ds,list){
              if(list.track === null){
                  list.track = ds.tail;
                  return true;
              }
              return false;
          },function(ds,list){
                if(list.track.left !== ds.tail){
                    list.track = list.track.left;
                    return true;
                }
                return false;
          },function(ds,list){
                if(list.track.left !== ds.tail) return true;
                return false;
          });

        },
        append:function(data){
          var node = ds.ListNode(data);
          if(this.state !== (-1 && 0)){

            var current = this.currentNode();

            var left = current.left;
            var right = current.right;


            current.right = node;
            node.right = right;
            node.left = current;
            right.left = node;

          }else this.ds.append(data);

          // this._append(node);
          this.ds.counter.up();
          return node;
        },
        prepend: function(data){
          var node = ds.ListNode(data);
          if(this.state !== (-1 && 0)){
            var current = this.currentNode(),
            left = current.left, right = current.right;

            current.left = node;
            node.right = current;
            node.left = left;
            left.right = node;
          }else this.ds.prepend(data);


          // this._prepend(node);
          this.ds.counter.up();
          return node;
        },
        remove: function(data,fn){
          var node,it = this.ds.iterator();

          if(fn == null) fn = function(i,d){
              return (i.current() === d ? i.currentNode() : null);
          };

          while(it.moveNext()){
            node = fn(it,data);
            if(node === null) continue;
            break;
          }

          if(!node) return false;
          var left = node.left, right = node.right;

          left.right = right;
          right.left = left;

          node.left = node.right = null;

          this.ds.counter.down();
          // this._remove(node);
          return node;
        },
        removeHead: function(){
          if(!util.isValid(this.ds)) return null;

          var node = this.ds.removeHead();
          this.tack = this.track === this.ds.root ? this.ds.root : null;

          // this._removeHead(node);
          return node;
        },
        removeTail: function(){
          if(!util.isValid(this.ds)) return null;

          var node = this.ds.removeTail();
          this.tack = this.track === this.ds.tail ? this.ds.tail : null;

          // this._removeTail(node);
          return node;
        },
        removeAll: function(data,fn){
          var node,left,right,res = [], it = this.ds.iterator();

          if(fn == null) fn = function(i,d){
              return (i.current() === d ? i.currentNode() : null);
          };
          while(it.moveNext()){
            node = fn(it,data);
            if(node === null) continue;
            left = node.left; right = node.right;
            left.right = right;
            right.left = left;
            res.push(node);
            this.ds.counter.down();
          }

          util.each(res,function(e){ e.left = e.right = null; });

          // this._removeAll(res);
          return res;
        },
        findAll: function(data,fn){
          if(fn == null) fn = function(i,d){
              return (i.current() === d ? i.currentNode() : null);
          };

          var node,res = [], it = this.ds.iterator();
          while(it.moveNext()){
            var node = fn(it,data);
            if(!node) continue;
            res.push(node);
          }

          if(res.length === 0) return;

          // this._findAll(res);
          return res;
        },
        find: function(data,fn){
          if(fn == null) fn = function(i,d){
              return (i.current() === d ? i.currentNode() : null);
          };

          var node,it = this.ds.iterator();
          while(it.moveNext()){
            var node = fn(it,data);
            if(!node) continue;
            break;
          }

          if(!node) return false;

          // this._find(node);
          return node;
        },
        cascadeBy:function(fn){
          var it = this.ds.iterator();
          while(it.moveNext()) fn(it.current(),it.currentNode());
          return it;
        }
    });

    return ls;
  }

  ds.ListFilter = function(fn){
      return function(list){
        if(util.isFunction(list.isList) && !list.isList()) return;
        var listIterator = list.iterator();
          return {
            findAll: function(n){
              return listIterator.findAll(n,fn);
            },
            find: function(n){
              return listIterator.find(n,fn);
            },
            remove: function(n){
              return listIterator.remove(n,fn);
            },
            removeAll:function(n){
              return listIterator.removeAll(n,fn);
            }
          };
        };
  };

  ds.GraphArc = function(n,w){
    if(!util.isFunction(n.isGraphNode) && n.isGraphNode)
      throw "first argument must be an instanceof ds.GraphNode";
    return ({
      node: n,
      weight: w,
      isGraphArc: function(){ return true; }
    });
  };

  ds.GraphNode = function(d,lc){
    var core = ds.Node(d)
    core.arcs = (lc.isList && lc.isList() ? lc : ds.List());
    core.it = core.arcs.iterator();

    delete core.isNode;

    util.extends(core,{
      bind: function(node,weight){
        if(util.isFunction(node.isGraphNode) && !node.isGraphNode()) return;
        this.arcs.add(ds.GraphArc(node,weight || 1));
      },
      unbind: function(node){
        if(util.isFunction(node.isGraphNode) && !node.isGraphNode()) return;
        return this.it.remove(node);
      },
      hasArc: function(node){
        if(util.isFunction(node.isGraphNode) && !node.isGraphNode()) return;
        var res = null;
        while(this.it.moveNext()){
          if(this.it.current().node === node){
            res = this.it.current();
            break;
          };
        }
        return res;
      },
      find: function(data){
        var  res = [];
        while(this.it.moveNext()){
          if(this.it.current().node.data !== data) continue
            res.push(this.it.current());
        }
        return res;
      },
      compare: function(node){
        if(util.isFunction(node.isGraphNode) && !node.isGraphNode()) return;
        return this.data === node.data;
      },
      compareData: function(data){
        return this.data === data;
      },
      reset: function(){
        this._reset();
        this.arcs.clear();
        this.it.close();
        this.arcs = null;
        this.it = null;
      },
      isGraphNode: function(){ return true; }
    });

    return core;
  };

  ds.Graph = function(lc){
      var core = ds.DS();
      core.lists = (lc.isList && lc.isList() ? lc : ds.List());
      core.it = core.lists.iterator();
      core.isGraph = function(){ return true; };
      core.dataMatrix = function(itr,data){
          var dt = itr.current();
          return (dt.data  === data ? itr.currentNode() : null);
      };
      core.nodeMatrix = function(itr,data){
        var dt = itr.currentNode();
        return (dt === data ? itr.currentNode() : null);
      };

      util.extends(core,{
        close: function(){
          this.list.clear();
          this.it.close();
          this.dataMatrix = this.nodeMatrix = null;
        },
        node: function(d1){
          if(util.isFunction(d1.isGraphNode) && d1.isGraphNode()){
            if(!this.it.find(d1,this.nodeMatrix)) return this.lists.add(d1);
          }
          var node = ds.GraphNode(d1);
          this.lists.add(node);
          return node;
        },
        unNode: function(data){
          var n;
          if(util.isFunction(d1.isGraphNode) && d1.isGraphNode()){
             n = this.it.remove(data,this.nodeMatric);
             if(n) return n.data;
          };
          n = this.it.remove(data,this.dataMatric);
          if(n) return n.data;
        },
        connectData: function(d1,d2,weight){
          var self = this;

          var dl1 = this.it.findAll(d1,this.dataMatrix);
          var dl2 = this.it.findAll(d2,this.dataMatrix);

          if(!dl1 || !dl2) return;

          util.each(dl1,function(e,i,o){
           util.each(dl2,function(k,v,z){
              self.connectNodes(e.data,k.data,weight,true);
            });
          });
        },

        connectNodes: function(n1,n2,weight,friz){
          var self = this;
          if(!friz){
            this.add(n1);
            this.add(n2);
          }
          n1.bind(n2,weight);
          //n2.bind(n1,weight);
          return true;
        },

        markersOn: function(){
          this.lists.cascadeBy(function(data,node){
             data.mark();
          });
        },

        markersOff: function(){
          this.lists.cascadeBy(function(data,node){
             data.unmark();
          });
        },

        cascadeAll: function(fn){
          if(!fn || !util.isFunction(fn)) return;
          this.lists.cascadeBy(function(data,node){
            fn(data,node);
          });
        },

        firstNode: function(){
          return this.lists.root.data;
        },
        lastNode: function(){
          return this.lists.tail.data;
        },
      });

      return core;
 };

 ds.GraphTraversal = ds.GT = {
    isArc: function(d){
      if(!!d && util.isFunction(d.isGraphArc) && d.isGraphArc()) return true;
      return false;
    },
    isGraphNode: function(d){
      if(!!d && util.isFunction(d.isGraphNode) && d.isGraphNode()) return true;
      return false;
    },
    isGraph: function(d){
      if(!!d && util.isFunction(d.isGraph) && d.isGraph()) return true;
      return false;
    }
  };

 ds.GraphTraversalRoot = function(processor){
    var kill = false;
    return {
      graph:null,
      processor: processor,
      use: function(g){
        this.graph = g;
        return this;
      },
      ready: function(){
        return (this.graph !== null && kill == false);
      },
      shutdown: function(){
        kill = true;
      },
      reset: function(){
        kill = false;
      },
      isDead: function(){
        return kill == true;
      }
    };
  };

 ds.GraphTraversal.DepthFirst = ds.GraphTraversal.DF = function(fn){
    var core = ds.GraphTraversalRoot(fn);

    util.extends(core,{
      amplify: function(ac){
         if(!this.ready()) this.reset();
        return this._process(ac);
      },

      _process: function(arc,promise){
         if(!this.ready()) return promise.promise();

          var point = null, promise = promise || as.Promise.create();
          if(ds.GraphTraversal.isArc(arc)) point = arc;
          if(ds.GraphTraversal.isGraphNode(arc)) point = ds.GraphArc(arc,0);
          if(!arc) point = ds.GraphArc(this.graph.firstNode(),0);

          this.processor(point.node,point,this);
          point.node.mark();
          var acl = point.node.arcs.iterator();

          while(acl.moveNext()){
            var node = acl.current();
            if(!node.node.marked()) this._process(node,promise);
          }

          promise.resolve(true);
          return promise.promise();
      },
    });

    return core;
 };

 ds.GraphTraversal.BF = ds.GraphTraversal.BreadthFirst = function(fn){
    var core = ds.GraphTraversalRoot(fn);

    util.extends(core,{
          amplify: function(arc){
             if(!this.ready()) return this.reset();

              var self = this, point = null, promise = as.Promise.create();
              if(ds.GraphTraversal.isArc(arc)) point = arc;
              if(ds.GraphTraversal.isGraphNode(arc)) point = ds.GraphArc(arc,0);
              if(!arc) point = ds.GraphArc(this.graph.firstNode(),0);

              var queue = ds.List();
              queue.add(point);
              queue.root.data.node.mark();

              while(!queue.isEmpty()){
                if(!this.ready()){
                  this.reset();
                  break;
                }
                var nd = queue.root.data, it = nd.node.arcs.iterator();
                this.processor(nd.node,nd,self);
                while(it.moveNext()){
                  var cur = it.current();
                  if(!cur.node.marked()){
                    queue.add(cur);
                    cur.node.mark();
                  }
                }
                queue.removeHead();
              }

              promise.resolve(true);
              return promise.promise();
          }
    });

    return core;
 };

 ds.GraphTraversal.DLDF = ds.GraphTraversal.DepthLimitedDF = function(fn,depth){
    if(!util.isNumber(depth)) throw 'depth must be a number';

    var core = ds.GraphTraversal.DepthFirst(fn);
    var _reset = core.reset;
    var _ready = core.ready;
    var _process = core._process;
    var depthLevel = depth;

    util.extends(core,{
      ready: function(){
        return (_ready.call(this) && this.hasDepth());
      },
      _process: function(arc,promise){
        if(this.hasDepth()){
          depthLevel -= 1;
          return _process.call(this,arc,promise);
        }
        return promise.promise();
      },
      hasDepth: function(){
        return depthLevel !== 0;
      },
      reset: function(){
        depthLevel = depth;
        _reset.call(this);
      },
    });
    return core;
 }

 ds.GraphTraversal.DLBF = ds.GraphTraversal.DepthLimitedBF = function(fn,depth){
    if(!util.isNumber(depth)) throw 'depth must be a number';

    var core = ds.GraphTraversal.BreadthFirst(fn);
    var _reset = core.reset;
    var _ready = core.ready;
    var _process = core._process;
    var depthLevel = depth;

    util.extends(core,{
      ready: function(){
        return (_ready.call(this) && this.hasDepth());
      },
      hasDepth: function(){
        return depthLevel !== 0;
      },
      reset: function(){
        depthLevel = depth;
        _reset.call(this);
      },
      amplify: function(arc){
         if(!this.ready() || !this.hasDepth()) return this.reset();

          var self = this, point = null, promise = as.Promise.create();
          if(ds.GraphTraversal.isArc(arc)) point = arc;
          if(ds.GraphTraversal.isGraphNode(arc)) point = ds.GraphArc(arc,0);
          if(!arc) point = ds.GraphArc(this.graph.firstNode(),0);


          var queue = ds.List();
          queue.add(point);
          queue.root.data.node.mark();

          while(!queue.isEmpty()){
            if(!this.ready() || !this.hasDepth()){
              this.reset();
              break;
            }
            var nd = queue.root.data, it = nd.node.arcs.iterator();
            this.processor(nd.node,nd,self);
            while(it.moveNext()){
              var cur = it.current();
              if(!cur.node.marked()){
                queue.add(cur);
                cur.node.mark();
              }
            }
            if(this.hasDepth()) this._dp -= 1;
            queue.removeHead();
          }

          promise.resolve(true);
          return promise.promise();
      },
    });

    return core;
 };

 ds.GraphFilterCore = function(processor){
  if(!util.isFunction(processor)) throw "argument must be a function";

  var core = {};
  core.graph = null;
  core.key = null;
  core.transversal = null;
  core.processor = processor;
  core.state = null;
  core._filterOneProcessor = util.proxy(function(node,arc,ob){
    var res = this.processor(this.key,node,arc,ob);
    if(res){
      this.state.resolve(res);
      this.transversal.shutdown();
    }
  },core);

  util.extends(core,{
      use: function(g){
       if(!ds.GraphTraversal.isGraph(g)) return this;
       this.graph = g;
       return this;
      },
      isReady: function(){
        if(util.exist(this.graph) && ds.GraphTraversal.isGraph(this.graph)) return true;
        return false;
      },
      filter: function(n){
        if(!this.isReady()) throw "Supply the graph to the filter using Filter.use function";
        var self = this;
        this.key = n;
        this.state = as.Promise.create();
        //if('markersOff' in this.graph && util.isFunction(this.graph.markersOff)) this.graph.markersOff();
        this.transversal.use(this.graph).amplify().done(function(n){ self.state.reject(n); });
        return this.state.promise();
      },
      filterAll: function(n){
        var find = this.graph.it.findAll(n,this.graph.dataMatrix);
        var state =  as.Promise.create();
        if(util.isArray(find)){
          (find.length <= 0 ? state.reject(false) : state.resolve(find));
        }else state.reject(find);

        return state.promise();
      },
   });
  return core;
 };

 ds.GraphFilter = ds.GF = {};

 ds.GraphFilter.DepthFirst = function(fn,depth){
   if(util.exist(depth) && !util.isNumber(depth)) throw "second argument,depth must be a number";
    var core = ds.GraphFilterCore(fn);
    core.transversal = (util.isNumber(depth) ? ds.GT.DepthLimitedDF(core._filterOneProcessor)
                        : ds.GT.DF(core._filterOneProcessor));
    return core;
 };

 ds.GraphFilter.BreadthFirst = function(fn,depth){
   if(util.isValid(depth) && !util.isNumber(depth)) throw "second argument,depth must be a number";
    var core = ds.GraphFilterCore(fn);
    core.transversal = (util.isNumber(depth) ? ds.GT.DepthLimitedBF(core._filterOneProcessor)
                        : ds.GT.BreadthFirst(core._filterOneProcessor));
    return core;
 };

});

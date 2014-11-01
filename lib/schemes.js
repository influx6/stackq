module.exports = (function(core){

  var stackFiles = /\(?[\w\W]+\/([\w\W]+)\)?$/;

  core.StreamSelect = function(stream,shouldRemove){
    if(!streams.isStreamable(stream))
      return null;

    var asm = aps.Promise.create(),
        select = { ops:{} },
        ops = select.ops,
        packets = ds.List();

    select.shouldRemove = shouldRemove || false;
    select.streams = streams.Streamable();
    select.streams.tell(packets.add);
    select.streams.tell(function(j){
      asm.resolve(true);
    });

    stream.bind(select.streams);

    var getCurrent = function(k){
      if(select.shouldRemove){
        var item = packets.removeHead();
        if(item) return item.data;
      }
      return k.current();
    };

    var operationGenerator = function(fn){
      var ps = streams.Streamable();
      ps.pause();
      asm.done(function(r){
        var item, endKick = false,
            // count = 0,
            sm = ps,
            end = function(){ endKick = true; },
            move = packets.iterator();

        sm.on('drain',function(){ sm.close(); });

        while(!endKick && move.moveNext()){
          item = getCurrent(move);
          if(!!fn.call(null,item,end)){
            sm.add(item);
            // count += 1;
          }
        };

        ps.resume();
      });
      return ps;
    };

    var createMux = function(id,fn){
      if(!valids.isString(id) && !valids.isFunction(fn)) return null;
      if(!!ops[id]) return null;
      return ops[id] = (function(gn){
        gn = gn || funcs.always(true);
        return operationGenerator(function(item,end){
          return fn.call(null,gn,item,end);
        });
      });
    };

    createMux('one',function(fn,item,end){
      if(!!fn(item,end)){
        return end() || true;
      }
    });

    createMux('all',function(fn,item,end){
      return !!fn(item,end);
    });

    var core = {
      select: select,
      ops: ops,
      createMux: createMux,
      promise: asm,
      destroy: function(){
        select.streams.close();
        packets.clear();
      }
    };

    return core;
  };

  core.collectionType = function(target,keyfn,valfn,errMeta){
    var meta = funcs.extends({},CollectionErrorDefaults,errMeta);

    var callKeyError = function(f,k){
      if(!f && errMeta.key){
        valids.Asserted();
      };
    };

    var callValueError = function(f,k){
      if(!f && errMeta.key){
        valids.Asserted();
      };
    };

    var valKey = function(k,fn){
     if(!valids.isFunction(fn)) return;
     return fn(keyfn(k));
    };

    var valValue = function(v,fn){
     if(!valids.isFunction(fn)) return;
     return fn(valfn(v));
    };

    var valId = function(k,v,fn){
      var count = 0,kv = vv = false;
      var fnInit = function(){
        if(count < 2) return;
        return fn(!!kv && !!vv);
      };

      valKey(k,function(f){
        count += 1;
        kv = f;
        return fnInit();
      });

      valVal(v,function(f){
        count += 1;
        vv = f;
        return fnInit();
      });
    };

    var core = {
      add: function(k,v){
        return valId(k,v,function(f){
          if(!f) return null;
          target[k] = v;
        });
      },
      get: function(k){
        return valKey(k,function(f){
          if(!f) return;
          return target[k];
        });
      },
      hasKey: function(k){
        return valKey(k,function(f){
          if(!f) return false;
          return !!target[k]
        });
      },
      has: function(k,v){
        return valId(k,v,function(f){
          if(!f) return false;
          return !!target[k] && target[k] == v;
        });
      },
      each: function(fn,fcp){
        return core.enums.each(target,function(e,i,o,gn){
          return fn(e,i,this,gn);
        },function(_,err){
          return fcp(this,err);
        },this);
      },
    };

    util.createProperty(core,'__mutilateTarget__',{
      set: function(fk){
        target = fk;
      }
    });

    return core;
  };

  var MetaDefault = { errors: { get: false, set: true}, maxWrite: Infinity, optional: false };
  core.SchemaValidators = {
    'string': core.validAsync.isString,
    'object': core.validAsync.isObject,
    'list': core.validAsync.isList,
    'number': core.validAsync.isNumber,
    'date': core.validAsync.isDate,
    'regexp': core.validAsync.isRegExp,
    'boolean': core.validAsync.isBoolean,
    'function': core.validAsync.isFunction,
    'dynamic': function(f,fn){
      return core.valids.isFunction(fn) && fn(core.funcs.always(true));
    },
  };

  core.SchemaItem = function(target,name,type,meta,validators){
    var valids = core.Util.extends({},core.SchemaValidators,validators);
    var metas = core.Util.extends({},MetaDefault,meta);

    var valItem = null, wc = 0, vak = valids[type] || valids['dynamic'];

    var scmeta = {};
    core.Util.defineGetProperty(scmeta,'name',function(){ return name; });
    core.Util.defineGetProperty(scmeta,'type',function(){ return type; });

    core.Util.defineGSProperty(target,name,{
      get: function(){
        if(core.valids.notExists(valItem)){
          if(core.valids.truthy(metas.errors.get)){
            throw new Error(core.Util.makeString(' ','value as not be set of type for:',name));
          }
        }
        return valItem;
      },
      set: function(v){
        if(wc >= metas.maxWrite) return;
        if(core.valids.notExists(v) && metas.optional) return;
        vak(v,function(f){
          if(!f && metas.errors.set)
            throw Error(core.Util.makeString(' ',v,'does not match type',type));
          valItem = v;
          wc = 0;
        });
      }
    });

    core.Util.createProperty(target,[name,'_mutilate__'].join('_'),{
      set: function(v){
        valItem = v;
      }
    });

    core.Util.createProperty(target,[name,'validator'].join('_'),{
      get: core.funcs.always(function(f,fx){
        return vak(v,fx);
      })
    });

    core.Util.createProperty(target,[name,'scheme'].join('_'),{
      get: core.funcs.always(scmeta)
    });

    core.Util.createProperty(target,[name,'meta'].join('_'),{
      get: core.funcs.always(metas)
    });

    return target;

  };

  core.SchemaCollection = function(target,ktype,vtype,meta,validators){

  };

  core.Schema = function(target,map,meta,validators){
    var valids = core.Util.extends({},core.SchemaValidators,validators);
  };

  core.Stream = core.Class({
    init: function(){
      var closed = false, paused = false;
      var packets = this.packets = core.List();
      var events = this.events = core.Events();
      var mutts = this.mutts = core.Middleware(function(f){
        packets.add(f);
        this.__push;
      });

      var it = this.packets.iterator();

      events.set('data');
      events.set('dataOnce','fireRemove');
      events.set('paused');
      events.set('resumed');
      events.set('close');

      this.onEvent = core.funcs.bind(this.events.on,this.events);
      this.offOnceEvent = this.offEvent = core.funcs.bind(this.events.off,this.events);
      this.onceEvent = core.funcs.bind(this.events.once,this.events);


      var pusher = core.Util.bind(function(){
          if(this.isPaused || this.isClosed || this.isEmpty) return false;
          var node = it.removeHead();
          events.emit('data',node.data,node);
          events.emit('dataOnce',node.data,node);
          return true;
      },this);

      core.Util.createProperty(this,'__push',{
        get: function(){
          return pusher();
        }
      });

      events.on('subscriberAdded',function(){
        pusher();
      });

      events.on('resumed',function(){
        pusher();
      });

      core.Util.createProperty(this,'__switchClose',{
        get: function(){
          if(closed) return closed = false;
          if(!closed) return closed = true;
        }
      });

      core.Util.createProperty(this,'__switchPaused',{
        get: function(){
          if(paused) return paused = false;
          if(!paused) return paused = true;
        }
      });

      core.Util.createProperty(this,'isPaused',{
        get: function(){
          return !!paused;
        }
      });

      core.Util.createProperty(this,'isClosed',{
        get: function(){
          return !!closed;
        }
      });

      core.Util.createProperty(this,'isEmpty',{
        get: function(){
          return this.packets.size() <= 0;
        }
      });
    },
    close: function(){
      if(this.isClosed) return;
      this.events.emit('close',this);
    },
    pause: function(){
      if(this.isPaused) return;
      this.__switchPaused;
      this.events.emit('paused',this);
    },
    resume: function(){
      if(!this.isPaused) return;
      this.__switchPaused;
      this.events.emit('resumed',this);
    },
    on: function(fn){
      this.events.on('data',fn);
      this.events.emit('subscriberAdded',fn);
    },
    once: function(fn){
      this.events.once('dataOnce',fn)
      this.events.emit('subscriberAdded',fn);
    },
    off: function(fn){
      this.events.off('data',fn);
      this.events.emit('subscriberRemoved',fn);
    },
    offOnce: function(fn){
      this.events.off('dataOnce',fn);
      this.events.emit('subscriberRemoved',fn);
    },
    emit: function(n){
      this.mutts.emit(n);
    }
  });

});

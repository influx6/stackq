module.exports = (function(core){

  var stackFiles = /\(?[\w\W]+\/([\w\W]+)\)?$/;
  var collectionTypes = /collection(<([\w\W]+)>)/;
  var onlyCollection = /^collection$/;
  var optionalType = /\?$/;
  var schemaType = /^([\w\W]+)\*/;
  var validName = /([\w\d$_]+)/;

  core.FunctionStore = core.Class({
    init: function(id,generator){
      this.id = id || (core.Util.guid()+'-store');
      this.registry = {};
      this.generator = generator;
    },
    each: function(fn,fnc){
      return core.enums.each(this.registry,fn,fnc);
    },
    add: function(sid,fn){
      return this.registry[sid] = fn;
    },
    addAll: function(fns){
      if(!core.FunctionStore.isInstance(fns)) return;
      var self = this;
      fns.registry.cascade(function(e,i){
        self.add(i,e);
      });
    },
    remove: function(sid){
      delete this.registry[sid];
    },
    has: function(sid){
      return core.valids.exists(this.registry[sid]);
    },
    get: function(sid){
      if (!this.has(sid)) return null;
      return this.registry[sid];
    },
    Q: function(sid){
      if (!this.has(sid)) return null;
      var fn = this.get(sid);
      return this.generator.call(null,fn,sid);
    },
  });

  core.Storage = core.FunctionStore.extends({
    init: function(){
      this.$super('Storage',core.funcs.identity);
    }
  });

  core.StreamSelect = core.Class({
      init: function(shouldRemove,stream){
        var self = this,locked = false;
        this.shouldRemove = core.valids.isBoolean(shouldRemove) ? shouldRemove : false;

        var boot = core.Promise.create();
        this.boot = boot.promise();
        this.packets = ds.List();
        this.streams = core.Stream.make();
        this.mutts = this.streams.mutts;
        this.$ = {};

        this.isLocked = function(){ return !!locked; };

        this.lock = function(){
          this.locked = true;
        };

        this.__unlock = function(){
          this.locked = false;
        };

        this.streams.on(function(i){
          if(!locked) self.packets.add(i);
        });

        this.streams.once(function(j){
          boot.resolve(self);
        });

        var createMuxer = core.StreamSelect.createMuxer(this);
        this.createMux = createMuxer(this.$);

        this.createMux('one',function(fn,item,end){
          if(!!fn(item,end)){
            return end() || true;
          }
        });

        this.createMux('list',function(fn,m,get,sm){
          var list = [], kill = false;
          while(!kill && m.moveNext()){
            var item = get(m);
            if(!!fn.call(null,item,function(){ kill = true; }))
              list.push(item);
          };
          sm.emit(list);
        },true);

        this.createMux('all',function(fn,item,end){
          return !!fn(item,end);
        });

        if(stream) this.bindStream(stream);
      },
      bindStream: function(stream){
        if(!core.Stream.isType(stream) || this.isLocked()) return;
        var pk = core.funcs.bind(this.streams.emit,this.streams);
        stream.on(pk);
        this.streams.onEvent('close',function(){
          stream.off(pk);
        });
      },
      destroy: function(){
        this.streams.close();
        this.packets.clear();
      },
      emit: function(f){
        if(this.isLocked()) return;
        this.streams.emit(f);
      }
    },{
      createMuxer: function(select){

        var getCurrent = function(k){
          if(select.shouldRemove){
            var item = select.packets.removeHead();
            if(item) return item.data;
          }
          return k.current();
        };

        var operationGenerator = function(fn,overtake){
          var ps = core.Stream.make();
          ps.pause();
          select.boot.done(function(r){
            var item, endKick = false,
                end = function(){ endKick = true; },
                move = select.packets.iterator();

            ps.onEvent('drain',function(){ ps.close(); });

            if(overtake){
              fn.call(null,move,getCurrent,ps);
            }
            else{
              while(!endKick && move.moveNext()){
                item = getCurrent(move);
                if(!!fn.call(null,item,end)){
                  ps.emit(item);
                }
              };
            }

            ps.resume();
          });
          return ps;
        };

        return function(ops){
          return function(id,fn,noIterate){
            if(!core.valids.isString(id) && !core.valids.isFunction(fn)) return null;
            var pass = core.valids.isBoolean(noIterate) ? noIterate : false;
            if(!!ops[id]) return null;
            return ops[id] = (function(gn){
              gn = gn || funcs.always(true);
              return operationGenerator(function(){
                var args = [gn].concat(core.enums.toArray(arguments));
                return fn.apply(null,args);
              },pass);
            });
          };
        };
      }
  });

  var CollectionErrorDefaults = { key: true, value: true};
  core.CollectionType = function(target,keyfn,valfn,errMeta){
    var meta = funcs.extends({},CollectionErrorDefaults,errMeta);

    var callKeyError = function(f,k){
      if(!f && meta.key){
        core.valids.Asserted();
      };
    };

    var callValueError = function(f,k){
      if(!f && meta.key){
        core.valids.Asserted();
      };
    };

    var valKey = function(k,fn){
     if(!core.valids.isFunction(fn)) return;
     return keyfn(k,fn);
    };

    var valValue = function(v,fn){
     if(!core.valids.isFunction(fn)) return;
     return valfn(v,fn);
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

      valValue(v,function(f){
        count += 1;
        vv = f;
        return fnInit();
      });

      return !!kv && !!vv;
    };

    var cores = {
      toJson: function(){
        return JSON.stringify(target);
      },
      validate: function(obj,fn){
        core.Util.each(obj,function(e,i,o,fx){
          return valId(i,e,function(f){
            if(!f) return fx(true);
            return fx(null);
          });
        },function(_,err){
          if(core.valids.exists(err)) return fn(false);
          return fn(true);
        });
      },
      add: function(k,v){
        return valId(k,v,function(f){
          if(!f) return false;
          target[k] = v;
          return k;
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
      mutate: function(fn){
        if(valids.isFunction(fn)) return fn(target);
      }
    };

    core.Util.createProperty(cores,'__mutilateTarget__',{
      set: function(fk){
        target = fk;
      }
    });

    return cores;
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
      return core.valids.isFunction(fn) && fn(true);
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
          wc += 1;
        });
      }
    });

    core.Util.createProperty(target,[name,'_mutilate__'].join('_'),{
      set: function(v){
        valItem = v;
      }
    });

    core.Util.createProperty(target,[name,'mutilate_validator'].join('_'),{
      set: function(fx){
        vak = fx;
      }
    });

    core.Util.createProperty(target,[name,'validate'].join('_'),{
      get: core.funcs.always(function(f,fx){
        return vak(f,fx);
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

  core.SchemaCollection = function(target,coltype,name,ktype,vtype,meta,validators){
    validators = validators || {};
    var kfn = validators[ktype] || core.SchemaValidators[ktype] || core.SchemaValidators['dynamic'];
    var vfn = validators[vtype] || core.SchemaValidators[vtype] || core.SchemaValidators['dynamic'];

    if(!core.valids.isFunction(kfn)) throw new Error('keys: '+ktype+" does not exist in your validators");
    if(!core.valids.isFunction(vfn)) throw new Error('Values: '+vtype+" does not exist in your validators");

    var metas = core.Util.extends({},MetaDefault,meta);
    var pack = core.CollectionType(coltype,kfn,vfn,metas);

    var sc = core.SchemaItem(target,name,'dynamic',{
      maxWrite: 1
    });

    var key = [name,'_mutilate__'].join('_');
    var vak = [name,'mutilate_validator'].join('_');
    sc[key] = pack;
    sc[vak] = pack.validate;

    return sc;

  };

  core.FindSchema = function(target,name,type,meta,validators,fstype){
    if(collectionTypes.test(type)){
      var strip = type.match(collectionTypes), types = strip[2], pl;
      if(!strip) return target;
      pl = types.replace(/\s+/,'').split(',');
      return core.SchemaCollection(target,fstype || {},name,pl[0],pl[1],meta,validators);
    }
    if(onlyCollection.test(type)){
      return core.SchemaCollection(target,fstype || {},name,meta,validators);
    }
    return core.SchemaItem(target,name,type,meta,validators);
  };

  core.Schema = function(target,map,meta,validators){
    /**
      {
        name?: string,
        scores: collection<number,number>
        class*: {
          id: string,
          grade: number
        }
      }
    */

    var valids = core.Util.extends({},core.SchemaValidators,validators);
    var keys = core.enums.keys(map);

    var vacks = {};

    var reportValidator = function(m,fx,fullReport){
      fullReport = fullReport || false;
      var report = {};
      return core.enums.each(vacks,function(v,i,o,fg){
        return v(m[i],function(f){
          report[i] = f;
          if(!f) return fg(false);
          return fg(null);
        });
      },function(_,err){
        if(core.valids.exists(err)){
          return fx(false,report);
        }
        return fx(true,report);
      });
    };

    core.enums.eachSync(keys,function(e,i,o,fx){
      if(!core.valids.isString(i)) return fx(null);
      var optional = optionalType.test(e),
          scheme = schemaType.test(e),
          clean = e.match(validName)[0],
          imeta = core.Util.extends({},MetaDefault,meta ? meta[clean] : null),
          mz = map[e],
          vakid = clean+'_validate';

      if(optional) imeta.optional = true;

      if(scheme && core.valids.isObject(mz)){
        var subt = core.Schema({},mz,imeta,valids);
        core.Util.defineGetProperty(target,clean,function(){ return subt; });
        // vacks[clean] = subt.validate;
        vacks[clean] = core.funcs.bind(subt.validate,subt);
        return fx(null);
      }

      if(!scheme || (scheme && !core.valids.isObject(mz))){
        if(core.valids.isObject(mz) || imeta.copy){
          imeta.maxWrite = 1;
          core.SchemaItem(target,clean,core.Util.isType(mz),imeta);
          target[clean] = !imeta['clone'] ? mz : core.Util.clone(mz);
          // var vali = valids[core.Util.isType(mz)];
          // vacks[clean] = vali ? vali : valids.dynamic;
          delete imeta['maxWrite'];
        }
        else{
          core.FindSchema(target,clean,mz,imeta,valids);
          // vacks[clean] = target[vakid];
          vacks[clean] = core.funcs.bind(target[vakid],target);
        }
      }

      return fx(null);
    });

    core.Util.createProperty(target,'extends',{
      get: function(){
        return function(tg){
          return core.Schema(tg,map,meta,valids);
        };
      }
    });

    var vass =  core.funcs.bind(reportValidator,core.Schema);

    core.Util.createProperty(target,'schema',{
      get: function(){
        return map;
      }
    });

    core.Util.createProperty(target,'meta',{
      get: function(){
        return meta;
      }
    });

    core.Util.createProperty(target,'validateReport',{
      get: function(){
        return function(m,fn){
          return vass(m,fn,true);
        };
      }
    });

    core.Util.createProperty(target,'validate',{
      get: function(){
        return function(m,fn){
          return vass(m,fn,false);
        };
      }
    });

    core.Util.createProperty(target,'validator',{
      get: function(){
        return vass;
      }
    });

    core.Util.createProperty(target,'validators',{
      get: function(){
        return function(){
          return core.Util.clone(vacks);
        };
      }
    });

    return target;
  };

  core.EventStream = core.Class({
    init: function(){
      this.eventSpace = {};
    },
    sizeOf: function(name){
      if(!this.has(name)) return -1;
      return this.events(name).size();
    },
    has: function(name){
      return core.valids.exists(this.eventSpace[name]);
    },
    events: function(name){
      if(this.eventSpace[name]) return this.eventSpace[name];
      this.eventSpace[name] = core.Distributors();
      return this.eventSpace[name];
    },
    on: function(name,fn){
      this.events(name).add(fn);
      return this;
    },
    once: function(name,fn){
      this.events(name).addOnce(fn);
      return this;
    },
    off: function(name,fn){
      this.events(name).remove(fn);
      return this;
    },
    offOnce: function(name,fn){
      return this.off(name,fn);
    },
    emit: function(name){
      var name = core.enums.first(arguments),
          rest = core.enums.rest(arguments);
      if(!this.has(name)) return;
      var ev = this.events(name);
      ev.distributeWith(ev,rest);
    },
    flush: function(name){
      if(!this.has(name)) return;
      this.events(name).removeAll();
    },
    flushAll: function(){
      core.enums.each(this.eventSpace,function(e){
        return e.removeAll();
      });
    }
  });

  core.Stream = core.Class({
    init: function(){
      this.packets = core.List();
      this.events = core.EventStream.make();
      this.emitSilently = false;

      this.onEvent = core.funcs.bind(this.events.on,this.events);
      this.onceEvent = core.funcs.bind(this.events.once,this.events);
      this.offEvent = core.funcs.bind(this.events.off,this.events);
      this.offOnceEvent = core.funcs.bind(this.events.offOnce,this.events);

      this.events.events('data');
      this.events.events('dataOnce');
      this.events.events('drain');
      this.events.events('close');
      this.events.events('end');
      this.events.events('resumed');
      this.events.events('paused');
      this.events.events('subscriberAdded');
      this.events.events('subscriberRemoved');

      var closed = false, paused = false,loosepackets = false;
      var it = this.packets.iterator();

      this.disableWait = function(){
        loosepackets = true;
      };

      this.enableWait = function(){
        loosepackets = false;
      };

      this.__switchPaused = function(){
        if(!paused) paused = true;
        else paused = false;
      };

      this.__switchClosed = function(){
        if(!closed) closed = true;
        else closed = false;
      };

      this.isPaused = function(){ return !!paused; };
      this.isClosed = function(){ return !!closed; };
      this.isEmpty = function(){ return this.packets.isEmpty(); };

      var subCount = this.$closure(function(){
        return this.events.sizeOf('data') + this.events.sizeOf('dataOnce');
      });

      var canPush = this.$closure(function(){
        if(this.isPaused() || this.isClosed() || this.isEmpty() || subCount() <= 0) return false;
        return true;
      });

      var pushing = false;
      this.__push = this.$closure(function(){
        if(!canPush()){
          if(!!pushing) this.events.emit('drain',this);
          pushing = false;
          return;
        }
        pushing = true;
        var node = it.removeHead();
        this.events.emit('data',node.data,node);
        this.events.emit('dataOnce',node.data,node);
        if(!this.isEmpty()) return this.__push();
        else this.events.emit('drain',this);
      });


      this.mutts = core.Middleware(this.$closure(function(f){
        if(subCount() <= 0 && !!loosepackets) return;
        this.packets.add(f);
        if(!this.emitSilently) this.__push();
      }));

      this.onEvent('resumed',this.$closure(function(){
        this.__push();
      }));

      this.onEvent('subscriberAdded',this.$closure(function(){
        this.__push();
      }));
    },
    transform: function(fn){
      this.mutts.add(function(d,next,end){
        var res = fn(d);
        return next(res ? res : d);
      });
    },
    transfromAsync: function(fn){
      this.mutts.add(fn);
    },
    close: function(){
      if(this.isClosed()) return;
      this.events.emit('close',this);
      this.events.flushAll();
    },
    end: function(){
      if(this.isClosed()) return;
      this.events.emit('end',this);
      this.resume();
    },
    pause: function(){
      if(this.isPaused()) return;
      this.__switchPaused();
      this.events.emit('paused',this);
    },
    resume: function(){
      if(!this.isPaused()) return;
      this.__switchPaused();
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
    },
    stream: function(sm){
      if(!core.Stream.isType(sm)) return;
      var self = this,pk = sm.$closure(sm.emit);
      this.on(pk);
      sm.onEvent('close',this.$closure(function(){
        this.off(pk);
      }));
      return {
        unstream: function(){
          return self.off(pk);
        }
      };
    },
    streamOnce: function(sm){
      if(!core.Stream.isType(sm)) return;
      var self = this,pk = sm.$closure(sm.emit);
      this.once(pk);
      return {
        unstream: function(){
          return self.off(pk);
        }
      };
    },
  });

  core.UntilShell = function(fn,fnz){
    core.Asserted(core.valids.isFunction(fn) && core.valids.isFunction(fnz),'argument must be functions!');
    var bindfn = fn;
    var closed = false, done = false;
    var dist = core.Distributors();
    var isDead = function(){
      return !!closed || !!done || !core.valids.isFunction(bindfn);
    };
    return {
      ok: function(){
        if(isDead()) return this;
        done = true;
        return fnz(dist);
      },
      push: function(f){
        if(isDead()) return this;
        bindfn.call(null,f);
        return this;
      },
      close: function(){
        closed = true;
        return this;
      },
      isClosed: function(){
        return !!closed;
      },
      reset: function(fn){
        bindfn = fn;
        done = close = false;
      },
      on: function(){
        dist.add.apply(dist,arguments);
        return this;
      },
      once: function(){
        dist.addOnce.apply(dist,arguments);
        return this;
      },
      off: function(){
        dist.remove.apply(dist,arguments);
        return this;
      },
      offOnce: function(){
        return this.off.apply(this,arguments);
      },
    };
  };

  core.MutateBy = function(fn,fnz){
    core.Asserted(core.valids.isFunction(fn) && core.valids.isFunction(fnz),"both arguments must be functions");
    return function(){
      var src = core.enums.first(arguments),
          dests = core.enums.rest(arguments);

      if(!core.valids.exists(src)) return;

      var lock = false, mut = {};
      mut.lock = function(){ lock = true; };
      mut.unlock = function(){ lock = false; };
      mut.isLocked = function(){ return !!lock; };

      mut.secure = core.funcs.bind(function(name,fn){
        mut[name] = core.funcs.bind(fn,mut);
      },mut);

      mut.secureLock = core.funcs.bind(function(name,fn){
        mut[name] = core.funcs.bind(function(){
          if(this.isLocked()) return this;
          fn.apply(this,arguments);
          return this;
        },mut);
      },mut);

      fn.call(mut,fnz,src,dests);
      return mut;
    }
  };

});

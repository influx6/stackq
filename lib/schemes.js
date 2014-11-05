module.exports = (function(core){

  var stackFiles = /\(?[\w\W]+\/([\w\W]+)\)?$/;
  var collectionTypes = /collection(<([\w\W]+)>)/;
  var onlyCollection = /^collection$/;
  var optionalType = /\?$/;
  var schemaType = /^([\w\W]+)\*/;
  var validName = /([\w\d$_]+)/;

  core.StreamSelect = core.Class({
      init: function(shouldRemove,stream){
        var self = this,locked = false;
        this.shouldRemove = core.valids.isBoolean(shouldRemove) ? shouldRemove : false;
        this.boot = core.Promise.create(),
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
          self.boot.resolve(true);
        });

        var createMuxer = core.StreamSelect.createMuxer(this);
        this.createMux = createMuxer(this.$);

        this.createMux('one',function(fn,item,end){
          if(!!fn(item,end)){
            return end() || true;
          }
        });

        this.createMux('all',function(fn,item,end){
          return !!fn(item,end);
        });

        if(stream) this.bindStream(stream);
      },
      bindStream: function(stream){
        if(!core.Stream.isType(stream) || this.isLocked()) return;
        stream.on(this.streams.$scoped('emit'));
        this.streams.onEvent('close',function(){
          stream.off(this.streams.$scoped('emit'));
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

        var operationGenerator = function(fn){
          var ps = core.Stream.make();
          ps.pause();
          select.boot.done(function(r){
            var item, endKick = false,
                end = function(){ endKick = true; },
                move = select.packets.iterator();

            ps.onEvent('drain',function(){ ps.close(); });

            while(!endKick && move.moveNext()){
              item = getCurrent(move);
              if(!!fn.call(null,item,end)){
                ps.emit(item);
              }
            };
            ps.resume();
          });
          return ps;
        };

        return function(ops){
          return function(id,fn){
            if(!core.valids.isString(id) && !core.valids.isFunction(fn)) return null;
            if(!!ops[id]) return null;
            return ops[id] = (function(gn){
              gn = gn || funcs.always(true);
              return operationGenerator(function(item,end){
                return fn.call(null,gn,item,end);
              });
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

  core.Stream = core.Class({
    init: function(){
      var closed = false, paused = false;
      var packets = this.packets = core.List();
      var events = this.events = core.Events();

      var it = this.packets.iterator(),emitSilent = false;

      var dataCount = function(){
        return events.sizeOf('data') + events.sizeOf('dataOnce');
      };

      var pusher = core.Util.bind(function(){
          if(this.isPaused || this.isClosed || this.isEmpty || dataCount() <= 0) return false;
          var node = it.removeHead();
          events.emit('data',node.data,node);
          events.emit('dataOnce',node.data,node);
          if(!packets.isEmpty()) return pusher();
          else events.emit('drain',this);
      },this);

      var mutts = this.mutts = core.Middleware(function(f){
        packets.add(f);
        if(!emitSilent) pusher();
      });


      events.set('data');
      events.set('end');
      events.set('drain');
      events.set('dataOnce','fireRemove');
      events.set('paused');
      events.set('resumed');
      events.set('close');

      this.onEvent = core.funcs.bind(this.events.on,this.events);
      this.offOnceEvent = this.offEvent = core.funcs.bind(this.events.off,this.events);
      this.onceEvent = core.funcs.bind(this.events.once,this.events);

      core.Util.createProperty(this,'emitSilently',{
        get: function(){
          return emitSilent;
        },
        set: function(f){
          if(!core.valids.isBoolean(f)) return;
          emitSilent = f;
        }
      });

      core.Util.createProperty(this,'__push',{
        get: function(){
          return pusher();
        }
      });

      core.Util.createProperty(this,'totalDataSubscribers',{
        get: function(){
          // return this.events.sizeOf('data') + this.events.sizeOf('dataOnce');
          return dataCount();
        }
      });

      core.Util.createProperty(this,'hasDataSubscribers',{
        get: function(){
          return this.events.sizeOf('data') > 0;
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

      core.Util.createProperty(this,'size',{
        get: function(){
          return packets.size();
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
    transform: function(fn){
      this.mutts.add(function(d,next,end){
        return next(fn(d));
      });
    },
    transfromAsync: function(fn){
      this.mutts.add(fn);
    },
    close: function(){
      if(this.isClosed) return;
      this.events.emit('close',this);
      this.events.flushAll();
    },
    end: function(){
      if(this.isClosed) return;
      this.events.emit('end',this);
      this.resume();
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
    },
    stream: function(sm){
      if(!core.Stream.isType(sm)) return;
      var self = this;
      this.on(sm.$scoped('emit'));
      sm.onEvent('close',this.$closure(function(){
        this.off(sm.$scoped('emit'));
      }));
    },
    unstream: function(sm){
      if(!core.Stream.isType(sm)) return;
      this.on(sm.$scoped('emit'));
      this.once(sm.$scoped('emit'));
    },
    streamOnce: function(sm){
      if(!core.Stream.isType(sm)) return;
      var self = this,pack = core.funcs.bind(sm.emit,sm);
      this.once(pack);
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
        if(isDead()) return;
        done = true;
        return fnz(dist);
      },
      push: function(f){
        if(isDead()) return;
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
      on: core.funcs.bind(dist.on,dist),
      off: core.funcs.bind(dist.off,dist),
      once: core.funcs.bind(dist.once,dist),
      offOnce: core.funcs.bind(dist.off,dist),
    };
  };

});

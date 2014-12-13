module.exports = (function(core){

  var empty = function(){};
  var stackFiles = /\(?[\w\W]+\/([\w\W]+)\)?$/;
  var collectionTypes = /collection(<([\w\W]+)>)/;
  var onlyCollection = /^collection$/;
  var optionalType = /\?$/;
  var schemaType = /^([\w\W]+)\*/;
  var validName = /([\w\d$_]+)/;
  var block = /^:([\w\W]+)$/;
  var unblock = /^([\w\W]+)$/;
  var hashed = /#([\w\W]+)/;
  var plusHash = /\/+/g;
  var hashy = /#+/g;
  var bkHash = /\\+/g;
  var endSlash = /\/$/;
  var letters = /^[\D]+$/;
  var querySig = core.Util.guid();
  var CollectionErrorDefaults = { key: true, value: true};
  var MetaDefault = { errors: { get: false, set: true}, maxWrite: Infinity, optional: false };
  var cleanup = function(x){
    return x.replace(hashy,'/').replace(plusHash,'/').replace(bkHash,'/').replace(endSlash,'');
  };
  var splitUrl = function(x){
    return x.split('/');
  };
  var qmap = {
    with: null ,
    ops:[],
    sips: {},
    mutators: [],
    savers: [],
    fetchers: [],
    adders: [],
    destroyers: []
  };

  core.Future = core.Class({
      hookProxy: function(obj){
        obj.complete = core.funcs.bind(this.complete,this);
        obj.completeError = core.funcs.bind(this.completeError,this);
        obj.then = core.funcs.bind(this.then,this);
        obj.onError = core.funcs.bind(this.onError,this);
        obj.isCompleted = core.funcs.bind(this.isCompleted,this);
        obj.itSucceeded = core.funcs.bind(this.itSucceeded,this);
        obj.itErrored = core.funcs.bind(this.itErrored,this);
        obj.guard = core.funcs.bind(this.guard,this);
        obj.guardIn = core.funcs.bind(this.guardIn,this);
      },
      init: function(v){
        this.events = core.EventStream.make();
        this.events.hookProxy(this);
        this.status = "uncompleted";
        var completed = core.Switch(),cargs,isError = false;

        this.guard = core.funcs.bind(function(fn){
          var self = this,g = core.Guarded(v);
          g.onSafe(function(){
            return self.complete.apply(self,arguments);
          });
          g.onError(function(e){
            return self.completeError(e);
          });
          return function(){
            return g.apply(this,arguments);
          };
        },this);

        this.guardIn = core.funcs.bind(function(fn,ms){
          core.Asserted(core.valids.isFunction(fn),'first argument must be a function');
          core.Asserted(core.valids.isNumber(ms),'second argument must be a number');
          var self = this, g = core.Guarded(fn);
          g.onSafe(function(){
            return self.complete.apply(self,arguments);
          });
          g.onError(function(e){
            return self.completeError(e);
          });
          return function(){
            var f;
            setTimeout(function(){
              f = g.apply(this,arguments);
            },ms);
            return f;
          };
        },this);

        this.isCompleted = function(){
          return completed.isOn();
        };

        this.itSucceeded = core.funcs.bind(function(){
          return this.isCompleted() && !isError;
        },this);

        this.itErrored = core.funcs.bind(function(){
          return this.isCompleted() && !!isError;
        },this);

        this.__complete__ = core.funcs.bind(function(f){
          if(this.isCompleted()) return this;
          cargs = f === this ? null : f;
          this.emit.apply(null,['success',f]);
          completed.on();
          this.status = 'completed';
          return this;
        },this);

        this.__completeError__ = core.funcs.bind(function(e){
          core.Asserted(e instanceof Error,'first argument must be an Error object');
          if(this.isCompleted()) return this;
          isError = true;
          cargs = e === this ? new Error('Unknown') : e;
          this.emit.apply(null,['error',e]);
          completed.on();
          this.status = 'completedError';
          return this;
        },this);

        this.__then__ = core.funcs.bind(function(fn,sidetrack){
          var ise = false, res;
          // if(!core.valids.isFunction(fn)) return;
          if(core.Future.isType(fn)) return this.chain(fn);
          if(this.itErrored()) return this;

          if(sidetrack){
            if(this.itSucceeded()){
                try{
                  res = fn.call(null,cargs);
                }catch(e){};
              return res ? res : this;
            }
            this.once('success',fn);
            return this;
          }

          var then = core.Future.make(),self = this;
          if(this.itSucceeded()){
              try{
                res = fn.call(null,cargs);
              }catch(e){
                ise = true;
                res = e;
              };
              //
              if(ise) then.completeError(res);
              else{
                if(core.valids.notExists(res)) then.complete.call(then,cargs);
                else if(core.Future.isType(res)){
                  if(res === self) then.complete(null);
                  else{
                    res.onError(function(e){
                      then.completeError(e);
                    });
                    res.then(function(f){
                      if(f === res) then.complete(null);
                      else then.complete(f);
                    });
                  }
                }
                else if(core.valids.exists(res)) then.complete.call(then,res);
              }
            return then;
          };

          this.once('success',function(){
              try{
                res = fn.call(null,cargs);
              }catch(e){
                ise = true;
                res = e;
              };

              if(ise) then.completeError(res);
              else{
                if(core.valids.notExists(res)) then.complete.call(then,cargs);
                if(core.Future.isType(res)){
                  if(res == self) then.complete(null);
                  else{
                    res.onError(function(e){
                      then.completeError(e);
                    });
                    res.then(function(f){
                      if(f === res) then.complete(null);
                      else then.complete(f);
                    });
                  }
                }
                else if(core.valids.exists(res)) then.complete.call(then,res);
              }
          });
          return then;
        },this);

        this.__error__ = core.funcs.bind(function(fn){
          if(this.itErrored()){
            fn.call(null,cargs);
          }else{
            this.once('error',fn);
          }
          return this;
        },this);

        if(core.valids.exists(v)){
          if(core.valids.isFunction(v)){
            var g = this.guard(v);
            g.call(this);
          }else{
            this.complete(v);
          };
        };

      },
      complete: function(){
        // var args = core.enums.toArray(arguments);
        this.__complete__.apply(this,arguments);
      },
      completeError: function(e){
        // var args = core.enums.toArray(arguments);
        this.__completeError__.apply(this,arguments);
      },
      then: function(fn,g){
        return this.__then__(fn,g);
      },
      onError: function(fn){
        return this.__error__(fn);
      },
      chain: function(fx){
        if(!core.Future.isType(fx)) return;
        this.then(fx.$bind(fx.complete));
        this.onError(fx.$bind(fx.completeError));
        return fx;
      },
      errorChain: function(fx){
        if(!core.Future.isType(fx)) return;
        // this.then(fx.$bind(fx.complete));
        this.onError(fx.$bind(fx.completeError));
        return fx;
      }
    },{
      waitWith: function(fx,args){
        core.Asserted(core.Future.isType(fx),'can only use a future type object');
        core.Asserted(core.valids.isList(args),'args must be a list');

        var then = fx;
        var slist = [], elist = [], count = 0, total = args.length;

        fx.futures = args;
        core.enums.eachSync(args,function(e,i,o,fn){
          if(!core.Future.isType(e)){
            total -= 1;
            return fn(null);
          };

          e.then(function(f){
            slist.push(f);
            count += 1;
            return fn(null);
          });

          e.onError(function(e){
            elist.push(e);
            return fn(ka);
          });
        },function(_,err){
          // console.log('ending-wait:',args.length,'all completed?:',count);
          if(err) return then.completeError.apply(then,err);
          return (count >= total ?  then.complete.call(then,slist) : null);
        });

        return then;

      },
      wait: function(){
        return core.Future.waitWith(core.Future.make(),core.enums.toArray(arguments));
      },
      value: function(f){
        return core.Future.make(f);
      },
      ms: function(fn,ms){
        var f = core.Future.make();
        f.guardIn(fn,ms).call(f);
        return f;
      }
  });

  core.Immutate = core.Future.extends({
      init: function(obj,ifClone,wait){
        core.Asserted(obj !== this,'can not assign self as value');
        this.$super();
        // this.$complete = function(){
        //   return this.__complete__.apply(this,arguments);
        // };
        // this.$completeError = function(){
        //   return this.__completeError__.apply(this,arguments);
        // };

        if(core.Immutate.isType(obj)){
          this.__isMut__ = true;
          this.__obj = obj;
          var self = this;
          obj.then(function(f){ self.$complete(self); });
          obj.onError(function(f){ self.$completeError.apply(self,arguments); });
        }else{
            this.__objMut = {};
            if(ifClone) obj = core.enums.deepClone(obj);
            if(core.valids.isPrimitive(obj)){
              this.isPrimitive = true;
              this.__obj = { value: obj };
              this.keys = core.funcs.always(['value']);
              this.length = core.funcs.always(1);
            }else{
              if(core.valids.isList(obj)){
                this.__obj = obj;
                this.length = obj.length;
                var keys = null;
                this.keys = function(){
                  if(!!keys) return keys;
                  return keys = core.enums.range(0,obj.length);
                };
              }
              if(core.valids.isObject(obj)){
                this.__obj = obj;
                var keys = null;
                this.keys = this.$bind(function(){
                  if(!!keys) return keys;
                  return keys = core.enums.keys(obj);
                });
                this.length = this.$bind(function(){
                  var k = this.keys().length;
                  this.length =  function(){
                    return k;
                  };
                });
              }
         }
         this.complete(null);
        }
      },
      // complete: function(){},
      // completeError: function(){},
      then: function(fn){
        // if(this.__isMut__) return this.__obj.then(this.$bind(fn));
        return this.$super(this.$bind(fn));
      },
      onError: function(fn){
        // if(this.__isMut__) return this.__obj.onError(this.$bind(fn));
        return this.$super(this.$bind(fn));
      },
      mutate: function(fn){
        if(this.__isMut__) return this.__obj.mutate(fn);
        return this.then(function(){
          return fn.call(this.__obj);
        });
      },
      set: function(f,v){
        if(this.__isMut__) return this.__obj.set(f,v);

        return this.then(function(){
          if((arguments.length <= 0 || f == 'value') && !!this.isPrimitive){
            return core.Immutate.value(val);
          }

          if(core.valids.not.containsKey(this.__obj,f)) return null;

          // var copyd = core.enums.deepClone(this.__obj);
          var cm = core.Immutate.value(this.__obj,true);
          cm.mutate(function(){
            this[f] = v;
          });

          return cm;
        });

      },
      get: function(f){
        if(this.__isMut__) return this.__obj.get(f);
        if((arguments.length <= 0 || f == 'value') && !!this.isPrimitive)
          return this.__obj['value'];

        if(core.valids.not.containsKey(this.__obj,f)) return null;
        if(core.valids.containsKey(this.__objMut,f)) return this.__objMut[f];

        var val = this.__obj[f];
        if(core.valids.isPrimitive(val)) return val;
        var m = core.Immutate.value(val);
        this.__objMut[f] = m;
        return m;
      },
      iterator: function(fn,conf,zone){
        if(this.__isMut__) return this.obj.iterator(fn,conf,zone);
        var hnx = core.enums.nextIterator(this.__obj,fn,conf.complete,zone || conf.zone || this,conf);
        return hnx;
      },
      size: function(){ return this.length(); },
      toObject: function(){
        if(this.__isMut__) return this.obj.toObject();
        return this.__obj;
      },
      toJS: function(){
        if(this.__isMut__) return this.obj.toJS();
        return core.enums.deepClone(this.__obj);
      },
      toJSON: function(){
        if(this.__isMut__) return this.obj.toJSON();
        return JSON.stringify(this.__obj);
      },
      values: function(){
        if(this.__isMut__) return this.obj.values();
        return core.enums.values(this.__obj);
      }
    },
    {
      value: function(n,f){
        return core.Immutate.make(n,f,true);
      },
      from: function(immute){
        if(!core.Immutate.isType(immute)) return;
        return core.Immutate.make(immute);
      }
  });

  core.ImmutateCursor = core.Class({
    init: function(immutate){

    }
  });

  core.ImmutateIndexed = core.Immutate.extends({

  });

  core.FutureStream = core.Future.extends({
      init: function(){
        this.$super();
        var inStream = this.__streamIn__ = core.Stream.make();
        var outStream = this.__streamOut__ = core.Stream.make();
        var reportStream = this.__streamOut__ = core.Stream.make();
        this.chains = [];
        this.in = function(){ return inStream; };
        this.out = function(){ return outStream; };
        this.changes = function(){ return reportStream; };

        var self = this;
        this.onError(function(e){
          inStream.close();
          outStream.close();
        });
        // stream.hookEvents(this.events);
        inStream.addEvent('dataBegin');
        inStream.addEvent('dataEnd');
        outStream.addEvent('dataBegin');
        outStream.addEvent('dataEnd');
        reportStream.addEvent('dataBegin');
        reportStream.addEvent('dataEnd');
      },
      loopStream: function(fn){
        this.chains.push(this.in().stream(this.out()));
        // this.chains.push(this.changes().stream(fx.changes()));

        var dbfx = this.$bind(function(){
          this.out().emitEvent.apply(this.out(),['dataBegin'].concat(core.enums.toArray(arguments)));
        });
        var defx = this.$bind(function(){
          this.out().emitEvent.apply(this.out(),['dataEnd'].concat(core.enums.toArray(arguments)));
        });
        // var defxc = function(){
        //   return fx.changes().emitEvent.apply(fx.changes(),['dataEnd'].concat(core.enums.toArray(arguments)));
        // };

        // this.out().onEvent('dataBegin',dbfx);
        // this.out().onEvent('dataEnd',defx);
        this.in().afterEvent('dataBegin',dbfx);
        this.in().afterEvent('dataEnd',defx);
        // this.changes().afterEvent('dataEnd',dexfc);

        var self = this;
        this.chains.push({
          unstream: function(){
            self.in().offAfterEvent('dataBegin',dbfx);
            self.in().offAfterEvent('dataEnd',defx);
            // self.out().offEvent('dataBegin',dbfx);
            // self.out().offEvent('dataEnd',defx);
          }
        });

        if(core.valids.isFunction(fn)) fn.call(this);
        return;
      },
      chainStream: function(fx){
        this.chains.push(this.out().stream(fx.in()));
        this.chains.push(this.changes().stream(fx.changes()));
        // this.chains.push(this.stream().stream(fx.stream()));

        var dbfx = function(){
          fx.in().emitEvent.apply(fx.in(),['dataBegin'].concat(core.enums.toArray(arguments)));
        };
        var defx = function(){
          fx.in().emitEvent.apply(fx.in(),['dataEnd'].concat(core.enums.toArray(arguments)));
        };
        var defxc = function(){
          fx.changes().emitEvent.apply(fx.changes(),['dataEnd'].concat(core.enums.toArray(arguments)));
        };

        // this.out().onEvent('dataBegin',dbfx);
        // this.out().onEvent('dataEnd',defx);
        this.out().afterEvent('dataBegin',dbfx);
        this.out().afterEvent('dataEnd',defx);
        this.changes().afterEvent('dataEnd',defxc);

        var self = this;
        this.chains.push({
          unstream: function(){
            self.out().offAfterEvent('dataBegin',dbfx);
            self.out().offAfterEvent('dataEnd',defx);
            // self.out().offEvent('dataBegin',dbfx);
            // self.out().offEvent('dataEnd',defx);
          }
        });
      },
      chain: function(fx,fn){
        if(core.Future.isInstance(fx)){
          this.$super(fx);
        }
        else if(core.FutureStream.isInstance(fx)){
          this.$super(fx);
          this.chainStream(fx);
        }
        if(core.valids.isFunction(fn)) fn.call(this);
        return fx;
      },
      errorChain: function(fx,fn){
        if(core.Future.isInstance(fx)){
          this.$super(fx);
        }
        else if(core.FutureStream.isInstance(fx)){
          this.$super(fx);
          this.chainStream(fx);
        }
        // if(!core.FutureStream.isType(fx)) return;
        // this.$super(fx);
        // this.chainStream(fx);
        if(core.valids.isFunction(fn)) fn.call(this);
        return fx;
      },
      close: function(){
        _.enums.each(this.chains,function(e){ return e.unstream(); });
        this.__stream__.close();
      }
    },{
      wait: function(){
        var f = core.Future.waitWith(core.FutureStream.make(),core.enums.toArray(arguments));
        var last = core.enums.last(f.futures);
        if(core.FutureStream.isType(last)) last.chainStream(f);
        return f;
      },
  });

  core.Provider = core.Class({
    init: function(fn){
      this.proxys = core.Storage.make('providing proxy functions');
      if(fn) this.proxys.add('default',function(req){});
    },
    use: function(map){
      core.Asserted(core.valids.isObject(map),'must supply an {} as argument');
      var self = this;
      core.enums.each(map,function(e,i,o,fx){
        if(!core.valids.isFunction(e)) return fx(null);
        self.provide(i,e);
        return fx(null);
      });
    },
    has: function(name){ return this.proxys.has(name); },
    provide: function(name,fn){
      this.proxys.overwrite(name,fn);
    },
    get: function(name){
      if(this.proxys.has(name)){ return this.proxys.Q(name);}
      return this.proxys.Q('default');
    },
    request: function(name,args,ctx){
      core.Asserted(core.valids.isString(name),'arg[0] the name of the proxy');
      core.Asserted(core.valids.isList(args),'arg[1] must be an array/list');
      var gr = this.get(name);
      return gr ? gr.apply(ctx,args) : null;
    },
    remove: function(name){
      return this.proxys.remove(name);
    },
    clear: function(){
      return this.proxys.clear();
    }
  },{
    create: function(map){
      core.Asserted(core.valids.isObject(map),'must supply an {} as argument');
      core.Asserted(core.valids.contains(map,'default'),'must provid a "default" function');
      core.Asserted(core.valids.isFunction(map['default']),'the default value must be a function');
      var def = map['default'];
      delete def['default'];
      var pr = core.Provider.make(def);
      core.enums.each(map,function(e,i,o,fx){
        if(core.valids.isFunction(e)) return fx(null);
        pr.provide(i,e);
        return fx(null);
      });
      return pr;
    }
  });

  core.Query = function(target,schema,fn){
    var _ = core;
    _.Asserted(_.valids.isString(target),'only string arguments are allowed!');
    var map = _.Util.clone(qmap);
    map.with = target;

    var ops = map.ops,
    sips = map.sips,
    cur = null,
    ax = {};

    var fid = ax.opsId = { fetch: 3, save: 2, update: 4, insert: 1,destroy: 5};
    ax.notify = _.Distributors();

    var push = function(q,n){
      q['$schema'] = schema;
      sips[ops.length] = [];
      ops.push(q);
    };

    if(core.valids.isFunction(fn)){
      fn.call(ax,map,function(name,fx){
         _.funcs.selfReturn(ax,name,fx);
      });
    };

    /*-------------------------beginning of filters---------------------------------------*/
    /* contains,stream,streamone,find,findone,limit,save,insert, index,destroy, update, yank,sort,filter,...*/

    _.funcs.selfReturn(ax,'where',function(q){
      if(_.valids.isString(q)){
        push({'op':'$contains', 'key': q},fid.fetch);
      };
      if(_.valids.isFunction(q)){
        push({'op':'$stream', 'key': q});
      }
      if(_.valids.isObject(q)){
        push({'op':'$find', 'key':q},fid.fetch);
      };
    });

    _.funcs.selfReturn(ax,'whereOne',function(q){
      if(_.valids.isString(q)){
        push({'op':'$contains', 'key': q, 'limit':1},fid.fetch);
      };
      if(_.valids.isFunction(q)){
        push({'op':'$streamOne', 'key': q},fid.fetch);
      }
      if(_.valids.isObject(q)){
        push({'op':'$findOne', 'key':q},fid.fetch);
      };
    });

    _.funcs.selfReturn(ax,'limit',function(n){
      if(_.valids.not.isNumber(n)) return;
      push({'op':'$limit', 'key':n});
    });


    _.funcs.selfReturn(ax,'every',function(total){
      if(_.valids.not.isNumber(total)) return;
      push({'op':'$byCount',key:{'total': total}});
    });

    _.funcs.selfReturn(ax,'ms',function(ms){
      if(_.valids.not.isNumber(ms)) return;
      push({'op':'$byMs',key:{'ms': ms || 1000}});
    });

    _.funcs.selfReturn(ax,'update',function(q){
      push({'op':'$update',key: q},fid.update);
    });

    _.funcs.selfReturn(ax,'insert',function(q){
      push({'op':'$insert',key: q},fid.insert);
    });

    _.funcs.selfReturn(ax,'index',function(q){
      push({'op':'$index',key: q});
    });

    _.funcs.selfReturn(ax,'save',function(q){
        if(q) this.insert(q);
        push({'op':'$save'},fid.save);
    });

    _.funcs.selfReturn(ax,'group',function(q){
        push({'op':'$group'});
    });

    _.funcs.selfReturn(ax,'containsNot',function(q){
        push({'op':'$containsNot'});
    });

    _.funcs.selfReturn(ax,'containsKey',function(q){
        push({'op':'$containsKey'});
    });

    _.funcs.selfReturn(ax,'containsNotKey',function(q){
        push({'op':'$containsNotKey'});
    });

    _.funcs.selfReturn(ax,'ungroup',function(q){
        push({'op':'$ungroup'});
    });

    _.funcs.selfReturn(ax,'filter',function(q){
        push({'op':'$filter',key: q});
    });

    _.funcs.selfReturn(ax,'yank',function(q){
        push({'op':'$yank',key: _.enums.toArray(arguments)},fid.update);
    });

    _.funcs.selfReturn(ax,'sort',function(q){
        push({'op':'$sort',key: q});
    });

    _.funcs.selfReturn(ax,'destroy',function(){
        push({'op':'$destroy'},fid.destroy);
    });

    /*-------------------------end of filters---------------------------------------*/

    _.funcs.selfReturn(ax,'xstream',function(fn){
      if(ops.length <= 0 || _.valids.not.isFunction(fn)) return;
      var xi = ops.length - 1;
      var ci = sips[xi];
      if(!ci) return;
      ci.push(fn);
    });

    _.funcs.selfReturn(ax,'flush',function(q){
        ops.length = 0;
    });

    _.funcs.selfReturn(ax,'use',function(tag,data){
      if(_.valids.not.isString(tag)) return;
      var t = tag[0] == '$' ? tag : ['$',tag].join('');
      push({'op':t, 'key':data});
    });

    _.funcs.selfReturn(ax,'define',function(tag){
      if(_.valids.not.isString(tag)) return;
      var t = tag[0] == '$' ? tag : ['$',tag].join('');
      _.funcs.selfReturn(ax,tag,function(data){
          push({'op':t, key: data});
      });
    });


    _.funcs.selfReturn(ax,'end',function(fn){
      var imap = _.Util.clone(map);
      core.Util.createProperty(imap,'queryKey',{
        get: function(){ return querySig; }
      });
      ax.notify.distribute(imap);
      // return imap;
    });

    _.funcs.selfReturn(ax,'onceNotify',function(fn){
      ax.notify.addOnce(fn);
    });

    _.funcs.selfReturn(ax,'offNotify',function(fn){
      ax.notify.remove(fn);
    });

    _.funcs.selfReturn(ax,'onNotify',function(fn){
      ax.notify.add(fn);
    });

    return ax;
  };

  core.Query.isQuery = function(q){
    if(q.queryKey && q.queryKey == querySig) return true;
    return false;
  };

  core.QueryStream = function(connection){
    // _.Asserted(Connection.isType(connection),'argument must be an instance of a connection');
    var ax = {}, _ = core;
    ax.watchers = [];
    ax.atoms = {};
    ax.mutators = core.Storage.make('queryWatchers');
    ax.proxy = _.Proxy();
    ax.current = null;
    var mix = ax.mix = _.Middleware(ax.proxy.proxy);

    _.funcs.selfReturn(ax,'where',function(tag,fn,atomic){
      if(!_.valids.isFunction(fn)){ return; }
      ax.unwhere(tag);
      ax.watchers.push(tag);
      ax.atoms[tag] = [];
      fn.mutator = function(d,next,end){
        var q = d.q, sm = d.sx;
        if(q.op.toLowerCase() !== tag && q.op !== tag) return next();
        return fn.call(connection,d.with,q,sm,q['$schema']);
      };
      ax.mutators.add(tag,fn);
      mix.add(fn.mutator);
    });

    _.funcs.selfReturn(ax,'unwhere',function(tag){
      var ind = ax.watchers.indexOf(tag);
      delete ax.watchers[ind];
      // delete ax.atoms[tag];
      var fn = ax.mutators.get(tag);
      if(_.valids.isFunction(fn)){ mix.remove(fn.mutator); }
    });

    _.funcs.selfReturn(ax,'hasWhere',function(tag){
      return ax.mutators.has(tag);
    });

    _.funcs.selfReturn(ax,'query',function(t){
      if(_.valids.not.isObject(t) || !_.Query.isQuery(t)) return;
      var docs = t.with,ops = t.ops,pipes = t.sips, fsm = [],binders = [];
      _.enums.eachSync(ops,function(e,i,o,fx){
        if(ax.watchers.indexOf(e.op) == -1) return fx(null);
        var inter ,sx = _.FutureStream.make(), cs = _.enums.last(fsm), li = pipes[i];
        //create a connection function just incase we want to completed with the previous fstream
        sx.connectStreams = function(){ if(cs) cs.then(sx.$bind(sx.complete)); };
        sx.reverseConnectStreams = function(){ if(cs) sx.then(cs.$bind(cs.complete)); };
        sx.totalIndex = o.length; sx.currentIndex = i;

        //you can identify a stream by its queryMap
        sx.qsMap = e;

        //if we have xstream linkage, run against stream
        if(li.length > 0){
          inter = _.FutureStream.make();
          // console.log('adding inter for:',e);
          // inter.then(function(){
          //   console.log('inter:',e,'completed');
          // });
          // inter.onError(function(f){
          //   console.log('inter:',e,'completedError',f);
          // });
          inter.loopStream();
          sx.chain(inter);
          _.enums.each(li,_.funcs.bindWith(sx),function(){
            mix.emit({'q': e, 'sx': sx, 'with': docs, 'init': cs ? false : true});
          });
        }else{
          mix.emit({'q': e, 'sx': sx, 'with': docs, 'init': cs ? false : true});
        }

        //connect previous streams
        if(cs){
          cs.errorChain(sx);
        }

        //add to stream cache for linking
        fsm.push(sx);
        //if we are using intermediate stream because people are looking,add also
        if(inter) fsm.push(inter);

        var fa = ax.atoms[e.op];
        if(_.valids.isList(fa)) fa.push(i);
        return fx(null);
      },function(i,err){

      });
      ax.current = {
        fx: fsm,
        docs: docs,
        query: t,
        bindings: binders
      };

      // return core.enums.last(fsm);
      var wf =  core.FutureStream.wait.apply(core.FutureStream,fsm);
      return wf;
    });

    return ax;
  };

  core.analyzeURI = function(pattern){
    var hasQuery = pattern.indexOf('?') != -1 ? true : false;
    var hasHash = pattern.indexOf('#') != -1 ? true : false;
    var searchInd = 1 + pattern.indexOf('?');
    var len = searchInd ? searchInd + 1 : pattern.length;
    var hostInd = pattern.substr(0,len).indexOf('://');
    var hostEnd = hostInd && hostInd != -1 ? 3 + hostInd : null;
    var hostStart = hostEnd ? pattern.substr(0,hostEnd) : null;
    var patt = pattern.substr(hostEnd,pattern.length);

    patt = !hostStart ? (patt[0] == '/' ? patt : '/' + patt) : '/' + patt;

    var hashInd = hasHash ? patt.indexOf('#') : -1;
    var slen = hasQuery ? len - 1 : len
    var clean = cleanup(patt);
    var qd = pattern.substr(slen,pattern.length);
    var rclean = clean.replace(qd,'').replace('?','');
    var hsplit = hasHash ? patt.split(/#/) : null;
    var hsw = hsplit ? hsplit[0].split('/') : null;
    var hswd = hsw ? hsw[hsw.length - 1] : null;

    return {
      url: pattern,
      patt: patt,
      cleanFull: clean,
      clean: rclean,
      hasHash: hasHash,
      hasQuery: hasQuery,
      query: pattern.substr(slen,pattern.length),
      protocolTag: hostStart,
      protocol: hostStart ? hostStart.replace('://','') : null,
      hashInd: hashInd,
      splits: splitUrl(rclean),
      hsplits: hsplit,
      hwords: hsw,
      hword: hswd
    };
  };

  core.uriValidators = {
    'string': function(f){
      return letters.test(f);
    },
    'text': function(f){
      return core.valids.isString(f);
    },
    'digits': function(f){
      var nim = parseInt(f);
      if(isNaN(nim)) return false;
      return core.valids.isNumber(nim);
    },
    'date': core.valids.isDate,
    'boolean': core.valids.isBoolean,
    'dynamic': core.funcs.always(true)
  };

  core.FunctionStore = core.Class({
    init: function(id,generator){
      this.id = id || (core.Util.guid()+'-store');
      this.registry = {};
      this.generator = generator;
    },
    clone: function(){
      return core.Util.clone(this.registry);
    },
    each: function(fn,fnc){
      return core.enums.each(this.registry,fn,fnc);
    },
    add: function(sid,fn){
      if(this.registry[sid]) return;
      return this.registry[sid] = fn;
    },
    overwrite: function(sid,fn){
      return this.registry[sid] = fn;
    },
    addAll: function(fns){
      var self = this;
      if(core.FunctionStore.isInstance(fns)){
        fns.registry.cascade(function(e,i){
          self.add(i,e);
        });
      }
      if(core.valids.isObject(fns)){
        core.enums.each(fns,function(e,i){
          self.add(i,e);
        });
      }
    },
    overwriteAll: function(fns){
      var self = this;
      if(core.FunctionStore.isInstance(fns)){
        fns.registry.cascade(function(e,i){
          self.overwrite(i,e);
        });
      }
      if(core.valids.isObject(fns)){
        core.enums.each(fns,function(e,i){
          self.overwrite(i,e);
        });
      }
    },
    remove: function(sid){
      delete this.registry[sid];
    },
    clear: function(){
      this.registry = {};
    },
    has: function(sid){
      return core.valids.exists(this.registry[sid]);
    },
    get: function(sid){
      if (!this.has(sid)) return null;
      return this.registry[sid];
    },
    Q: function(sid,fx){
      if (!this.has(sid)) return null;
      var fn = this.get(sid);
      return this.generator.call(null,fn,sid,fx);
    },
  });

  core.Storage = core.FunctionStore.extends({
    init: function(id){
      this.$super(core.valids.isString(id) ? id+':Storage' : 'Storage',core.funcs.identity);
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

            // ps.onEvent('drain',function(){ ps.close(); });

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

    core.Util.createProperty(target,[name,'toObject'].join('_'),{
      get: function(){
        return function(){
          var m = {};
          m[name] = valItem;
          return m;
        };
      }
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

  /** Schema provides a nice type system for object validation
    {
      name?: string,
      scores: collection<number,number>
      class*: {
        id: string,
        grade: number
      }
    }
  */
  core.Schema = function(target,map,meta,validators){
    var valids = core.Util.extends({},core.SchemaValidators,validators);
    var keys = core.enums.keys(map);

    var vacks = {};
    var toObj = {};

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
          obid = clean+'_toObject';
          vakid = clean+'_validate';

      if(optional) imeta.optional = true;

      if(scheme && core.valids.isObject(mz)){
        var subt = core.Schema({},mz,imeta,valids);
        core.Util.defineGetProperty(target,clean,function(){ return subt; });
        // vacks[clean] = subt.validate;
        vacks[clean] = core.funcs.bind(subt.validate,subt);
      }
      else if(!scheme || (scheme && !core.valids.isObject(mz))){
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


      if(target[obid])
        toObj[clean] = core.funcs.bind(target[obid],target);
      return fx(null);
    });

    core.Util.createProperty(target,'extends',{
      get: function(){
        return function(tg){
          return core.Schema(tg,map,meta,valids);
        };
      }
    });

    core.Util.createProperty(target,'toObject',{
      get: function(){
        return function(){
          var obj = {};
          core.enums.each(toObj,function(e,i,o,fn){
            if(core.valids.isFunction(e)) core.Util.extends(obj,e());
            return fn(null);
          });
          return obj;
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

  core.Hooks = core.Class({
    init: function(id){
      this.id = id;
      this.before = core.Mutator();
      this.in = core.Mutator();
      this.after = core.Mutator();

      this.before.addDone(this.in.fire);
      this.in.addDone(this.after.fire);

      this.$secure('distributeWith',function(ctx,args){
        return this.before.fireWith(ctx,args);
      });

      this.$secure('distribute',function(){
        return this.distributeWith(this,core.enums.toArray(arguments));
      });
    },
    disableMutations: function(){
      this.before.disableMutation = true;
      this.in.disableMutation = true;
      this.after.disableMutation = true;
    },
    enableMutations: function(){
      this.before.disableMutation = false;
      this.in.disableMutation = false;
      this.after.disableMutation = false;
    },
    emit: function(){
      this.distributeWith(this,arguments);
    },
    emitAfter: function(){
      this.after.distributeWith(this.after,arguments);
    },
    emitBefore: function(){
      this.before.distributeWith(this.before,arguments);
    },
    delegate: function(){
      this.in.delegate.apply(this,arguments);
    },
    delegateAfter: function(){
      this.after.delegate.apply(this,arguments);
    },
    delegateBefore: function(){
      this.before.delegate.apply(this,arguments);
    },
    size: function(){
      return this.in.size();
    },
    totalSize: function(){
      return this.in.size() + this.before.size() + this.after.size();
    },
    add: function(fn){
      this.in.add(fn);
    },
    addOnce: function(fn){
      this.in.addOnce(fn);
    },
    remove: function(fn){
      this.in.remove(fn);
    },
    addBefore: function(fn){
      this.before.add(fn);
    },
    addBeforeOnce: function(fn){
      this.before.addOnce(fn);
    },
    removeBefore: function(fn){
      this.before.remove(fn);
    },
    addAfter: function(fn){
      this.after.add(fn);
    },
    addAfterOnce: function(fn){
      this.after.addOnce(fn);
    },
    removeAfter: function(fn){
      this.after.remove(fn);
    },
    removeAll: function(){
      this.removeAllIn();
      this.removeAllAfter();
      this.removeAllBefore();
    },
    removeAllIn: function(){
      this.in.removeAll();
    },
    removeAllAfter: function(){
      this.after.removeAll();
    },
    removeAllBefore: function(){
      this.before.removeAll();
    },
  });

  core.EventStream = core.Class({
    init: function(){
      this.eventSpace = {};
      this.fired = [];
    },
    sizeOf: function(name){
      if(!this.has(name)) return -1;
      return this.events(name).size();
    },
    sizeOfBefore: function(name){
      if(!this.has(name)) return -1;
      return this.events(name).before.size();
    },
    sizeOfAfter: function(name){
      if(!this.has(name)) return -1;
      return this.events(name).after.size();
    },
    has: function(name){
      return core.valids.exists(this.eventSpace[name]);
    },
    events: function(name){
      if(this.eventSpace[name]) return this.eventSpace[name];
      var hk = this.eventSpace[name] = core.Hooks.make();
      hk.disableMutations();
      return this.eventSpace[name];
    },
    before: function(name,fn){
      if(!this.eventSpace[name]) return;
      var es = this.eventSpace[name];
      es.addBefore(fn);
      return this;
    },
    after: function(name,fn){
      if(!this.eventSpace[name]) return;
      var es = this.eventSpace[name];
      if(this.fired.indexOf(name) != -1) es.delegateAfter(fn);
      es.addAfter(fn);
      return this;
    },
    resetAfter: function(name){
      var ind = this.fired.indexOf(name);
      if(ind != -1){ delete this.fired[ind]; }
      return;
    },
    resetAllAfter: function(name){
      this.fired.lenght = 0;
    },
    beforeOnce: function(name,fn){
      if(!this.eventSpace[name]) return;
      var es = this.eventSpace[name];
      es.addBeforeOnce(fn);
      return this;
    },
    afterOnce: function(name,fn){
      if(!this.eventSpace[name]) return;
      var es = this.eventSpace[name];
      if(this.fired.indexOf(name) != -1) return es.delegateAfter(fn);
      es.addAfterOnce(fn);
      return this;
    },
    OffBefore: function(name,fn){
      if(!this.eventSpace[name]) return;
      var es = this.eventSpace[name];
      es.removeBefore(fn);
      return this;
    },
    offAfter: function(name,fn){
      if(!this.eventSpace[name]) return;
      var es = this.eventSpace[name];
      es.removeAfter(fn);
      return this;
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
      if(this.has('*')){
        var mk = this.events('*');
        mk.distributeWith(mk,[name].concat(rest));
        if(this.fired.indexOf('*') == -1) this.fired.push('*')
      }
      var ev = this.events(name);
      ev.distributeWith(ev,rest);
      this.fired.push(name);
    },
    hook: function(es){
      if(!core.EventStream.isType(es)) return;
      var self = this,k = function(){
        return es.emit.apply(es,arguments);
      };
      this.on('*',k);
      return {
        unhook: function(){
          self.off('*',k);
        }
      };
    },
    flush: function(name){
      if(!this.has(name)) return;
      this.events(name).removeAll();
    },
    flushAll: function(){
      core.enums.each(this.eventSpace,function(e){
        return e.removeAll();
      });
    },
    hookProxy: function(obj,fn){
      fn = fn || core.funcs.identity;
      obj[fn('flushAll')] = this.$bind(this.flushAll);
      obj[fn('flush')] = this.$bind(this.flush);
      obj[fn('offBefore')] = this.$bind(this.offAfter);
      obj[fn('offAfter')] = this.$bind(this.offBefore);
      obj[fn('beforeOnce')] = this.$bind(this.beforeOnce);
      obj[fn('afterOnce')] = this.$bind(this.afterOnce);
      obj[fn('before')] = this.$bind(this.before);
      obj[fn('after')] = this.$bind(this.after);
      obj[fn('beforeOnce')] = this.$bind(this.beforeOnce);
      obj[fn('afterOnce')] = this.$bind(this.afterOnce);
      obj[fn('OffBefore')] = this.$bind(this.offBefore);
      obj[fn('OffAfter')] = this.$bind(this.offAfter);
      obj[fn('emit')] = this.$bind(this.emit);
      obj[fn('once')] = this.$bind(this.once);
      obj[fn('offOnce')] = this.$bind(this.offOnce);
      obj[fn('on')] = this.$bind(this.on);
      obj[fn('off')] = this.$bind(this.off);
    }
  });

  core.Stream = core.Class({
    init: function(){
      this.packets = core.List();
      this.events = core.EventStream.make();
      this.emitSilently = false;

      this.events.hookProxy(this,function(n){
        return [n,'Event'].join('');
      });

      this.addEvent = core.funcs.bind(this.events.events,this.events);
      // this.onEvent = core.funcs.bind(this.events.on,this.events);
      // this.onceEvent = core.funcs.bind(this.events.once,this.events);
      // this.offEvent = core.funcs.bind(this.events.off,this.events);
      // this.offOnceEvent = core.funcs.bind(this.events.offOnce,this.events);

      this.events.events('dataCount');
      this.events.events('dataEnd');
      this.events.events('data');
      this.events.events('dataOnce');
      this.events.events('drain');
      this.events.events('close');
      this.events.events('end');
      this.events.events('resumed');
      this.events.events('paused');
      this.events.events('subscriberAdded');
      this.events.events('subscriberRemoved');

      var self = this, closed = false,gomanual = false,
      paused = false,loosepackets = false,locked = false,
      it = this.packets.iterator();

      this.goManual = function(){
        gomanual = true;
      };

      this.undoManual = function(){
        gomanual = false;
      };

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
      this.lock = function(){ locked = true; };
      this.unlock = function(){ locked = false; };
      this.isLocked = function(){ return !!locked; };

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
        // console.log('canpush:',canPush());
        var node = it.removeHead();
        this.events.emit('data',node.data,node);
        this.events.emit('dataOnce',node.data,node);
        if(gomanual) return;
        if(!this.isEmpty()) return this.__push();
        else this.events.emit('drain',this);
      });

      this.mutts = core.Middleware(this.$closure(function(f){
        if(subCount() <= 0 && !!loosepackets) return;
        this.packets.add(f);
        this.events.emit('dataCount',this.packets.size());
        if(!this.emitSilently) this.__push();
      }));

      this.mutts.add(function(d,next,end){
        if(self.isLocked()) return;
        return next();
      });

      this.onEvent('resumed',this.$closure(function(){
        // if(!gomanual) this.__push();
        this.__push();
      }));

      this.onEvent('subscriberAdded',this.$closure(function(){
        if(!gomanual) this.__push();
      }));
    },
    // hookEvents: function(es){
    //   var sub = this.events.hook(es);
    //   // this.onEvent('data',empty);
    //   // this.onEvent('dataOnce',empty);
    //   var hksub = sub.unhook;
    //   sub.unhook = function(){
    //     // this.offEvent('data',empty);
    //     // this.offEvent('dataOnce',empty);
    //     return hksub.call(this);
    //   };
    //   return sub;
    // },
    hookProxy: function(obj){
      obj.flushStream = core.funcs.bind(this.flush,this);
      obj.pushStream = core.funcs.bind(this.push,this);
      obj.transformStream = core.funcs.bind(this.transform,this);
      obj.transformStreamAsync = core.funcs.bind(this.transformAsync,this);
      obj.endStream = core.funcs.bind(this.end,this);
      obj.closeStream = core.funcs.bind(this.close,this);
      obj.pauseStream = core.funcs.bind(this.pause,this);
      obj.resumeStream = core.funcs.bind(this.resume,this);
      obj.addStreamEvent = core.funcs.bind(this.addEvent,this);
      obj.streamEvent = core.funcs.bind(this.onEvent,this);
      obj.streamOnceEvent = core.funcs.bind(this.onceEvent,this);
      obj.streamOnceEventOff = core.funcs.bind(this.offOnceEvent,this);
      obj.streamEventOff = core.funcs.bind(this.offEvent,this);
      obj.onStream = core.funcs.bind(this.on,this);
      obj.offStream = core.funcs.bind(this.off,this);
      obj.offOnceStream = core.funcs.bind(this.offOnce,this);
      obj.onceStream = core.funcs.bind(this.once,this);
      obj.emitStream = core.funcs.bind(this.emit,this);
      obj.toStream = core.funcs.bind(this.stream,this);
      obj.toStreamOnce = core.funcs.bind(this.streamOnce,this);
    },
    push: function(){
      return this.__push();
    },
    flush: function(){
      return this.packets.clear();
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
    endData: function(){
      if(this.isClosed()) return;
      this.events.emit('dataEnd',this);
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
      if(this.isLocked()) return;
      this.mutts.emit(n);
    },
    stream: function(sm,withEnd){
      if(!core.Stream.isType(sm)) return;
      var self = this,pk = sm.$closure(sm.emit),pe = sm.$closure(sm.end);
      this.on(pk);
      if(withEnd) this.onEvent('end',pe);
      sm.onEvent('close',this.$closure(function(){
        this.off(pk);
        if(withEnd) this.offEvent('end',pe);
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

  core.FilteredChannel = core.Stream.extends({
    init: function(id,picker){
      this.$super();
      this.contract = core.Contract(id,picker);
      this.contract.onPass(core.funcs.bind(this.mutts.emit,this.mutts));
    },
    emit: function(d){
      return this.contract.interogate(d);
    },
    changeContract: function(f){
      return this.contract.changeHandler(f);
    }
  });

  core.Configurable = core.Class({
    init: function(){
      this.configs = core.Storage.make('configs');
      this.events = core.EventStream.make();
      this.events.hookProxy(this);
    },
    config: function(map){
      this.configs.overwriteAll(map);
    },
    getConfigAttr: function(k){
      return this.configs.get(k);
    },
    hasConfigAttr: function(k){
      return this.configs.has(k);
    },
    rmConfigAttr: function(k){
      return this.configs.remove(k);
    },
    close: function(){
      this.config.clear();
      this.events.emit('close',this);
    }
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

      mut.bind = core.funcs.bind(function(fn){
        return core.funcs.bind(fn,this);
      },mut);

      mut.secure = core.funcs.bind(function(name,fn){
        mut[name] = core.funcs.bind(fn,this);
      },mut);

      mut.secureLock = core.funcs.bind(function(name,fn){
        mut[name] = core.funcs.bind(function(){
          if(this.isLocked()) return this;
          fn.apply(this,arguments);
          return this;
        },this);
      },mut);

      fn.call(mut,fnz,src,dests);
      return mut;
    }
  };

  core.Extendo = function(cores,obj,scope){
    var ext = {};
    core.Util.mutateFn(obj,ext,function(i,fn){
      return function(){
        return fn.apply(scope || obj,[cores].concat(core.enums.toArray(arguments)));
      };
    });
    return ext;
  };

});

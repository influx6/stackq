module.exports = (function(){

  var as = require('./as-contrib.js').AsContrib;
  var streams = as.Streams;
  var aps = as.AppStack;
  var ds = as.DS;
  var util = aps.Utility;
  var enums = as.enums;
  var valids = as.valids;
  var invs = as.funcs;
  var structs = {};
  var stackFiles = /\(?[\w\W]+\/([\w\W]+)\)?$/;

  aps.ASColors();

  structs.ErrorParser = function(e){
    if(valids.notExists(e) || !e.stack) return null;
    var stack = e.stack, list = e.stack.toString().split('\n'), parsed = [];
    parsed.push(list[0].split(":")[1].red.bold);
    list[0]="";
    util.each(list,function(e){
      if(valids.notExists(e)) return null;
      var cd = e.replace(/\s+/,' ').replace('at','')
          key = cd.split(/\s+/),
          cs = (key[2] || key[1] || key[0]).match(stackFiles);

      if(!cs) return;
      var par = [],by=cs[1].split(':');
      par.push('');
      par.push('By: '.white+(key.length >= 3 ? key[1].replace(":","") : "target").green+"   ");
      par.push('At: '.white+by[1].yellow+":"+by[2].replace(')','').yellow+"    ");
      par.push('In: '.white+by[0].cyan+"   ");
      parsed.push(par.join(' '));
    });
    return parsed.join('\n');
  };

  structs.StreamSelect = function(stream){
    if(!streams.isStreamable(stream))
      return null;

    var asm = as.Promise.create(),
        selects = { ops:{} },
        ops = select.ops,
        packets = ds.dsList();

    select.streams = aps.Streamable();
    select.streams.tell(packets.add);
    select.streams.tell(function(j){
      asm.resolve(true);
    });

    stream.bind(select.streams);

    var operationGenerator = function(fn){
      var pm = aps.Promise.create(),ps = pm.promise();
      asm.done(function(r){
        var item, endKick = false,
            count = 0,
            sm = aps.Streamable(),
            end = function(){ endKick = true; },
            move = packets.iterator();

        while(!endKick && move.moveNext()){
          item = move.current();
          if(!!fn.call(null,item,end)){
            sm.add(item);
            count += 1;
          }
        };

        if(count > 0) pm.resolve(sm);
        else pm.reject(sm);

      });
      return ps;
    };

    var createMux = function(id,fn){
      if(!valids.isString(id) && !valids.isFunction(fn)) return null;
      if(!!ops[id]) return null;
      return ops[id] = function(gn){
        gn = gn || funcs.always(true);
        return operationGenerator(function(item,end){
          return fn.call(null,gn,item,end);
        });
      };
    };

    createMux('one',function(fn,item,end){
      if(!!fn(item,end)){
        return end() || true;
      }
    });

    createMux('all',function(fn,item,end){
      return !!fn(item,end);
    });

    return {
      select: select,
      ops: ops,
      createMux: createMux,
    };
  };

  structs.Contract = function(n,pickerfn){

    pickerfn = valids.isFunction(pickerfn) ? pickerfn : null;

    var cd = {};
    cd.allowed = as.AppStack.Distributors();
    cd.rejected = as.AppStack.Distributors();

    cd.offPass = function(fn){
      if(!valids.isFunction(fn)) return null;
      this.allowed.remove(fn);
    };

    cd.offOncePass = function(fn){
      if(!valids.isFunction(fn)) return null;
      this.allowed.remove(fn);
    };

    cd.offReject = function(fn){
      if(!valids.isFunction(fn)) return null;
      this.rejected.remove(fn);
    };

    cd.offOnceReject = function(fn){
      if(!valids.isFunction(fn)) return null;
      this.rejected.remove(fn);
    };

    cd.onPass = function(fn){
      if(!valids.isFunction(fn)) return null;
      this.allowed.add(fn);
    };

    cd.oncePass = function(fn){
      if(!valids.isFunction(fn)) return null;
      this.allowed.addOnce(fn);
    };

    cd.onReject = function(fn){
      if(!valids.isFunction(fn)) return null;
      this.rejected.add(fn);
    };

    cd.onceReject = function(fn){
      if(!valids.isFunction(fn)) return null;
      this.rejected.addOnce(fn);
    };

    cd.interogate = function(m,picker){
      picker = ((valids.truthy(picker) && valids.isFunction(pikcer)) ?
        picker : (valids.falsy(pickerfn) ? function(i){ return i; } : pickerfn));
      if(valids.isString(n)){
        if(n == picker(m)) return this.allowed.distribute(m);
      }
      if(valids.isRegExp(n)){
        if(n.test(picker(m))) return this.allowed.distribute(m);
      }
      if(valids.isFunction(n)){
        if(!!n(picker(m),m)) return this.allowed.distribute(m);
      }
      return this.rejected.distribute(m);
    };

    return cd;
  };

  var choice_sig = util.guid();

  structs.Choice = function(fn){
    var q = {};
    q.denied = as.AppStack.Distributors();
    q.accepted = as.AppStack.Distributors();
    q.data = as.AppStack.Distributors();

    var check;

    q.isChoice = function(){ return choice_sig; };
    q.offNot = q.offNotOnce = function(fn){
      if(!valids.isFunction(fn)) return null;
      return this.denied.remove(fn);
    };

    q.offOk = q.offOkOnce = function(fn){
      if(!valids.isFunction(fn)) return null;
      return this.accepted.remove(fn);
    };

    q.offData = q.offDataOnce = function(fn){
      if(!valids.isFunction(fn)) return null;
      return this.data.remove(fn);
    };

    q.onNot = function(fn){
      if(!valids.isFunction(fn)) return null;
      return this.denied.add(fn);
    };

    q.onNotOnce = function(fn){
      if(!valids.isFunction(fn)) return null;
      return this.denied.addOnce(fn);
    };

    q.onOk = function(fn){
      if(!valids.isFunction(fn)) return null;
      return this.accepted.add(fn);
    };

    q.onOkOnce = function(fn){
      if(!valids.isFunction(fn)) return null;
      return this.accepted.addOnce(fn);
    };

    q.onData = function(fn){
      if(!valids.isFunction(fn)) return null;
      return this.data.add(fn);
    };

    q.onDataOnce = function(fn){
      if(!valids.isFunction(fn)) return null;
      return this.data.addOnce(fn);
    };

    q.analyze = function(d){
      check = d;
      this.data.distributeWith(this,[d]);
    };

    q.not = function(m){
      if(valids.falsy(m)) m = check;
      check = null;
      this.denied.distributeWith(this,[m]);
    };

    q.ok = function(m){
      if(valids.falsy(m)) m = check;
      check = null;
      this.accepted.distributeWith(this,[m]);
    };

    if(valids.isFunction(fn)) q.onData(fn);
    return q;
  };

  structs.Choice.isChoice = function(m){
    if(m.isChoice && valids.isFunction(m.isChoice)){
      return m.isChoice() === choice_sig;
    }
    return false;
  };

  structs.GreedQueue = function(){
    var q = {}, tasks = [];
    q.initd = as.AppStack.Distributors();
    q.done = as.AppStack.Distributors();
    q.reverse = false;

    q.addChoice = function(qm){
      if(structs.Choice.isChoice(qm)){
        qm.__hook__ = function(d){ return qm.analyze(d); };

        var ql = enums.last(tasks);

        if(!!ql && qm != ql) ql.onNot(qm.__hook__);

        tasks.push(qm);
        return qm;
      }
    };

    q.queue = function(fn){
      var qm = structs.Choice(fn);
      this.addChoice(qm);
      return qm;
    };

    q.dequeue = function(choice){
      if(!this.has(choice)) return null;
      var ind = tasks.indexOf(choice),
          cind = ind - 1,
          next = ind + 1,
          qm = tasks[ind],
          ql = tasks[cind],
          qx = tasks[next];

      if(!!ql){
        ql.offNot(qm.__hook__);
        if(!!qx){
          qm.offNot(qx.__hook__);
          ql.onNot(qx.__hook__);
        }
      }

      tasks[ind] = null;
      tasks = util.normalizeArray(tasks);
    };

    q.has = function(choice){
      return tasks.indexOf(choice) != -1;
    };

    q.emit = function(m){
      if(tasks.length <= 0) return null;
      var fm = enums.first(tasks);
      return fm.analyze(m);
    };

    q.each = function(fg,gn){
      stacks.ascontrib.enums.eachAsync(tasks,function(e,i,o,fn){
        return fg(e,fn);
      },function(_,err){
        if(valids.truthy(err)) return gn(err);
        return null;
      });
    };

    return q;
  }

  structs.WorkQueue = function(){
    var q = {}, tasks = [];
    q.initd = as.AppStack.Distributors();
    q.done = as.AppStack.Distributors();
    q.reverse = false;

    q.queue = function(fn){
      if(!valids.isFunction(fn)) return null;
      tasks.push(fn);
    };

    q.unqueue = function(fn){
      if(!valids.isFunction(fn)) return null;
      tasks[tasks.indexOf(fn)] = null;
      tasks = util.normalizeArray(tasks);
    };

    q.dequeueBottom = function(){
      return enums.yankLast(tasks);
    };

    q.dequeueTop = function(){
      return enums.yankFirst(tasks);
    };

    var next = function(m){
      if(tasks.length <= 0) return this.done.distribute(m);
      if(!!this.reverse){
        return this.dequeueBottom()(m);
      }
      return this.dequeueTop()(m);
    };

    q.emit = function(m){
      if(tasks.length <= 0) return null;
      this.initd.distribute(m);
      return next.call(this,m);
    };

    return q;
  };

  structs.Guarded = function(fn){
    var stacks = [];
    var dist = as.AppStack.Distributors();
    var safe = as.AppStack.Distributors();


    var guide = function guide(){
      var ret,stack = {};
      try{
        ret = fn.apply(fn,arguments);
      }catch(e){
        stack['error'] = e;
        stack['stack'] = e.stack;
        stack['target'] = fn;
        stacks['arguments'] = arguments;
        stacks.push(stack);
        dist.distributeWith(guide,[e]);
        return ret;
      }
      safe.distributeWith(guide,ret);
      return ret;
    };

    if(fn.__guarded){
      // util.each(fn.stacks,function(e,i,o){ stacks.push(e); });
      stacks.push(util.flatten(fn.stacks));
      fn.onError(function(e){
        return dist.distributeWith(fn,[e]);
      });
      // fn.onSafe(function(e){
      //   return safe.distributeWith(fn,[e]);
      // });
    }

    guide.__guarded = true;
    guide.stacks = stacks;
    guide.errorWatch = dist;
    guide.onError = function(fn){
      return dist.add(fn);
    };
    guide.onSafe = function(fn){
      return safe.add(fn);
    };

    return guide;
  };

  structs.GuardedPromise = function(fn){
    var pm = as.AppStack.Promise.create();
    var gm = structs.Guarded(fn);

    // gm.onError(function(e){ pm.reject(e); });
    // gm.onSafe(function(e){ pm.resolve(e); });
    // pm.done(function(){ console.log('done',arguments); });
    // pm.fail(function(){ console.log('fails',arguments); });

    gm.onError(pm.reject);
    gm.onSafe(pm.resolve);

    gm.promise = pm;
    return gm;
  };

  structs.TwoProxy = function(fn,gn){
    var bind = {};
    bind.first = structs.Proxy(fn);
    bind.second = structs.Proxy(gn);

    bind.fn = enums.bind(bind.first.proxy,bind.first);
    bind.gn = enums.bind(bind.second.proxy,bind.second);
    bind.useFn = enums.bind(bind.first.useProxy,bind.first);
    bind.useGn = enums.bind(bind.second.useProxy,bind.second);

    return bind;
  };

  structs.Proxy = function(fn){

      var prox = function(dn){
        var __binding = dn;

        this.proxy = function(d){
          if(__binding && util.isFunction(__binding)){
            return __binding.call(null,d);
          }
          return null;
        };

        this.useProxy = function(fn){
          if(!util.isFunction(fn)) return null;
          __binding = fn;
          return null;
        };
      };

      return new prox(fn);
    };

  structs.Middleware = function(fn){
      var md = {};
      var tasks = [];
      var reverse = [];
      var kick = false;
      var bind = structs.Proxy(fn);

      md.reverseStacking = false;

      md.withEnd = function(fn){
        bind.useProxy(fn);
      };

      md.add = function(fn){
        if(!util.isFunction(fn)) return null;
        tasks.push(fn);
      };

      md.remove = function(fn){
        if(!this.has(fn) || !util.isFunction(fn)) return null;
        tasks[tasks.indexOf(fn)] = null;
        tasks = util.normalizeArray(tasks);
      };

      md.has = function(fn){
        if(!util.isFunction(fn)) return false;
        return tasks.indexOf(fn) != -1;
      }

      var next = function(cur,data,iskill,list){
         var index = cur += 1;
         if(!!iskill || index >= list.length){
           return bind.proxy(data);
         }
         var item = list[index];
         if(valids.falsy(item)) return null;
         return item.call(null,data,function(newdata){
           if(valids.truthy(newdata)) data = newdata;
           return next(index,data,iskill,list);
         },function(newdata){
           if(valids.truthy(newdata)) data = newdata;
           return next(index,data,true,list);
         });
      };

      md.emit = function(data){
        kick = false;
        if(this.reverseStacking){
          return next(-1,data,kick,enums.reverse(tasks));
        }
        return next(-1,data,kick,tasks);
      }

    return md;
  };

  structs.JazzUnit = function(desc){
    var dm = ({desc:desc, status: null,stacks: null});
    var units = {};
    var stacks = [];
    // var pm = as.AppStack.Promise.create();
    var ds = as.AppStack.Distributors();
    var pmStack = [];
    var proxy;

    var guardpm = function(fn){
      var sg = structs.GuardedPromise(fn);
      stacks.push(sg.stacks);
      pmStack.push(sg.promise);
      return sg;
    };

    var report = function(state){
      dm.stacks = util.flatten(stacks);
      dm['endTime'] = new Date();
      var ms = new Date();
      dm['runTime'] = ms;
      ms.setTime(dm.endTime.getTime() - dm.startTime.getTime());
      dm['ms'] = ms.getMilliseconds();
      dm['state'] = state;
      dm['status'] = (state ? "Success!": "Failed!");
      return ds.distributeWith(units,[dm]);
    };

    units.proxy = function(){ return proxy; };
    units.state = function(){ return state; };
    units.wm = structs.Middleware(function(m){
      var wait = as.AppStack.Promise.when.apply(null,pmStack);
      wait.done(function(e){ report(true); });
      wait.fail(function(e){ report(false); });
    });

    units.isJazz = function(){ return true; };
    units.plug = function(fn){ ds.add(fn); return this; };
    units.plugOnce = function(fn){ ds.addOnce(fn); return this; };
    units.unplugOnce = units.unplug = function(fn){ ds.remove(fn); return this; };

    units.use = util.bind(function(d){
      dm['startTime'] = new Date();
      this.wm.emit(d);
      return this;
    },units);

    units.up = util.bind(function(gn){
      var gd = guardpm(gn);
      // gd.onError(function(f){ pm.reject(true); });
      this.wm.add(function(d,next,end){
        return (gd(d,guardpm) || next());
      });
      return this;
    },units);

    units.upasync = enums.bind(function(gn){
      var gd = guardpm(gn);
      this.wm.add(function(d,next,end){
        return (gd(d,next,guardpm));
      });
      return this;
    },units);

    units.countasync = enums.bind(function(count,gn){
      if(!valids.isNumber(count)) throw "first argument must be a number";
      if(!valids.isFunction(gn)) throw "second argument must be a function";
      var done = false;gd = guardpm(gn);
      this.wm.add(function(d,next,end){
        return (gd(d,function(m){
          if(done) return;
          count -= 1;
          if(count <= 0){
            done = true;
            return next(m);
          }
        },guardpm));
      });
      return this;
    },units);

    proxy = {
      "sync": util.bind(units.up,units),
      "async": util.bind(units.upasync,units),
      "asyncCount": util.bind(units.countasync,units),
      "for": util.bind(units.use,units)
    };

    return units;
  };

  structs.Formatter = util.bind(as.tags.formatter,as.tag);

  structs.Printer = util.bind(as.tags.printer,as.tag);

  structs.Jazz = function(desc,fn,printer){
    if(!valids.isFunction(fn) || !valids.isString(desc))
      throw "must provide a string and a function as agruments";
    var jz = structs.ConsoleView(structs.JazzUnit(desc),null,printer);
    fn(jz.proxy());
    return jz;
  };

  var gjzformat = structs.Formatter("{{title}}: {{message}}");
  structs.JzGroup = function(desc,fn,print){
    if(!valids.isString(desc)) throw "first argument must be a string";
    if(!valids.isFunction(fn)) return "second argument must be a function";
    var printer = structs.Printer(print);
    var headerAdded = false;
    var addHeader = function(buff){
      if(headerAdded) return null;
      buff.push((structs.Formatter("{{title}} {{message}}")("Test Group:".green.bold,desc.bold.yellow)).cyan);
      buff.push("\n");
      buff.push("----------------------------------------".cyan);
      buff.push("\n");
      headerAdded = true;
    };

    return fn(function(d,f){
      return structs.Jazz(d,f,function(m){
        var buff = [];
        addHeader(buff);
        buff.push(m);
        buff.push("\n");
        printer(buff.join(''));
      });
    });
  };

  structs.ConsoleView = function(jazz,formatter,prt){
    if(util.isNull(formatter) || !util.isFunction(formatter)){
      formatter = structs.Formatter("-> {{title}}: {{message}}".cyan);
    }

    var printer = structs.Printer(prt);

    if(util.isFunction(jazz.isJazz) && jazz.isJazz()){

      jazz.plug(function(map){
        var buffer = [],stacks = map.stacks;
        buffer.push("\n");
        buffer.push(formatter("Test",map.desc.green.bold));
        buffer.push("\n");
        buffer.push(formatter("Status",(map.state ? map.status.green : map.status.red).bold));
        buffer.push("\n");
        buffer.push(formatter("Run Time",(map.ms+"ms").cyan.bold));
        buffer.push("\n");

        if(stacks.length > 0){
          util.eachAsync(stacks,function(e,i,o,fn){
            if(valids.notExists(e)) return null;
            buffer.push(formatter("ErrorStack".cyan,structs.ErrorParser(e.error)));
            buffer.push("\n");
          },function(a,err){
            printer(buffer.join(''));
          });
        }else{
          printer(buffer.join(''));
        }

      });

      return jazz;
    }
    return jazz;
  };

  structs.Expects = (function(){
    var ex = {};

    ex.isList = ex.isArray = invs.errorEffect('is {0} an array',valids.isArray);

    ex.isObject = invs.errorEffect('is {0} an object',valids.isObject);

    ex.isNull = invs.errorEffect('is {0} value null',valids.isNull);

    ex.isUndefined = invs.errorEffect('is {0} undefined'.isUndefined);

    ex.isString = invs.errorEffect('is {0} a string',valids.isString);

    ex.isTrue = invs.errorEffect('is {0} a true value',valids.isTrue);

    ex.isFalse = invs.errorEffect('is {0} a false value',valids.isFalse);

    ex.truthy = invs.errorEffect('is {0} truthy',valids.truthy);

    ex.falsy = invs.errorEffect('is {0} falsy',valids.falsy);

    ex.isBoolean = invs.errorEffect('is {0} a boolean',valids.isBoolean);

    ex.isArgument = invs.errorEffect('is {0} an argument object',valids.isArgument);

    ex.isRegExp = invs.errorEffect('is {0} a regexp',valids.isRegExp);

    ex.matchType = invs.errorEffect('{0} matches {1} type',valids.matchType);

    ex.isFunction = invs.errorEffect('is {0} a function',valids.isFunction);

    ex.isDate = invs.errorEffect('is {0} a date object',valids.isDate);

    ex.isEmpty = invs.errorEffect('is {0} empty',valids.isEmpty);

    ex.isEmptyString = invs.errorEffect('is {0} an empty string',valids.isEmptyString);

    ex.isEmptyArray = invs.errorEffect('is {0} an empty array',valids.isEmptyArray);

    ex.isEmptyObject = invs.errorEffect('is {0} an empty object',valids.isEmptyObject);

    ex.isArrayEmpty = invs.errorEffect('is {0} an empty array',valids.isArrayEmpty);

    ex.isPrimitive = invs.errorEffect('is {0} a primitive',valids.isPrimitive);

    ex.isNumber = invs.errorEffect('is {0} a number',valids.isNumber);

    ex.isInfinity = invs.errorEffect('is {0} infinite',valids.isInfinity);

    ex.isIndexed = invs.errorEffect('is {0} an indexed object',valids.isIndexed);

    ex.is = invs.errorEffect('is {0} equal to {1}',valids.is);

    ex.isMust = invs.errorEffect('is {0} exact equals {1}',valids.exactEqual);

    ex.mustNot = invs.errorEffect('is {0} not exact equal with {1}',enums.negate(valids.exactEqual));

    ex.isNot = invs.errorEffect('is {0} not equal to {1}',enums.negate(valids.is));

    return ex;
  }());

  var ClassSig = util.guid();
  structs.Class.isChild = function(kc){
    if(kc.constructor.isClass && valids.isFunction(kc.constructor.isClass)){
      return kc.constructor.isClass() === ClassSig;
    }
    return false;
  };

  structs.Class = function(attr,static,_super){

    var klassSig = util.guid();

    var klass = function(){
      if(valids.exists(_super)){
        _super.apply(this,util.toArray(arguments));
      }
    };

    klass.isChild = function(kc){
      if(kc.isChild && util.isFunction(kc.isChild)){
        return kc.isChild() === klassSig;
      }
      return false;
    };

    klass.prototye = {};

    if(_super && _super.prototype){
      var __f = function(){};
      __f.protoype = _super.prototype;
      klass.prototype = new __f();
      klass.prototype.constructor = klass;
      klass.constructor = klass;
    };

    if(valids.exists(attr) && valids.isObject(attr)){
      util.extends(klass.prototype,attr);
    }

    if(valids.exists(static) && valids.isObject(static)){
      util.extends(klass,static);
    }

    klass.prototype.isChild = function(kc){
      return klass.isChild(kc);
    };
    
    klass.extends = function(at,st){
      var child =  structs.Class(klass.prototype,klass,klass);
      util.extends(child.prototype,at);
      util.extends(child,at);
      return child;
    };

    klass.addChainMethod = function(name,fn){
      klass.prototype[name] = util.bind(function(){
        fn.apply(this,arguments);
        return this;
      },klass.prototype);
    };

    klass.addMethod = function(name,fn){
      klass.prototype[name] = util.bind(fn,klass.prototype);
    };

    klass.addStaticMethod = function(name,fn){
      klass[name] = util.bind(fn,klass);
    };

    return klass;
  }

  return structs;
}());

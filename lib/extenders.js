module.exports = (function(core){

 /* former schemes code */

  var as = ds = streams = core;
  var util = as.Util;
  var enums = as.enums;
  var valids = as.valids;
  var invs = funcs = as.funcs;
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
  var bindByPass = function(fn,scope){
    return function(){
      var res = fn.apply(scope || this,arguments);
      return res ? res : (scope || this);
    };
  };

  core.ASColors();

  core.Assertor = valids.Assertor;

  core.Asserted = valids.Asserted;

  core.Switch = function(){
    var on = false;
    return {
      on: function(){
        on = true;
      },
      off: function(){
        on = false;
      },
      isOn: function(){
        return on == true;
      }
    };
  };

  core.ErrorParser = function(e){
    if(valids.notExists(e)) return null;
    if(!(e instanceof Error)) return e.toString();
    if(e instanceof Error && valids.notExists(e.stack)){
      return e.toString();
    }

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

  core.Contract = function(n,pickerfn){

    var handler = n;
    pickerfn = valids.isFunction(pickerfn) ? pickerfn : null;

    var cd = {};
    cd.allowed = as.Distributors();
    cd.rejected = as.Distributors();

    cd.changeHandler = function(f){
      if(core.valids.not.exists(f)) return;
      handler = f;
    };

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
      picker = ((valids.isFunction(picker)) ?
        picker : (!valids.isFunction(pickerfn) ? core.funcs.identity : pickerfn));
      if(valids.isString(handler)){
        if(handler == '*' || handler == picker(m)) return this.allowed.distribute(m);
      }
      // if(valids.isObject(handler)){
      //   if(handler.test(picker(m))) return this.allowed.distribute(m);
      // }
      if(valids.isRegExp(handler)){
        if(handler.test(picker(m))) return this.allowed.distribute(m);
      }
      if(valids.isFunction(handler)){
        if(!!handler(picker(m),m)) return this.allowed.distribute(m);
      }
      return this.rejected.distribute(m);
    };

    return cd;
  };

  var choice_sig = util.guid();

  core.Choice = function(fn){
    var q = {};
    q.denied = as.Distributors();
    q.accepted = as.Distributors();
    q.data = as.Distributors();

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

  core.Choice.isChoice = function(m){
    if(m.isChoice && valids.isFunction(m.isChoice)){
      return m.isChoice() === choice_sig;
    }
    return false;
  };

  core.GreedQueue = function(){
    var q = {}, tasks = [];
    q.initd = as.Distributors();
    q.done = as.Distributors();
    q.reverse = false;

    q.addChoice = function(qm){
      if(core.Choice.isChoice(qm)){
        qm.__hook__ = function(d){ return qm.analyze(d); };

        var ql = enums.last(tasks);

        if(!!ql && qm != ql) ql.onNot(qm.__hook__);

        tasks.push(qm);
        return qm;
      }
    };

    q.queue = function(fn){
      var qm = core.Choice(fn);
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

  core.WorkQueue = function(){
    var q = {}, tasks = [];
    q.initd = as.Distributors();
    q.done = as.Distributors();
    q.reverse = false;

    var initd = false;

    q.done.add(function(){ initd = false; });

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
      if(!!this.reverse){
        return this.dequeueBottom()(m);
      }
      return this.dequeueTop()(m);
    };

    q.emit = function(m){
      if(tasks.length <= 0) return this.done.distribute(m);
      if(!initd){
        initd = true;
        this.initd.distribute(m);
      }
      return next.call(this,m);
    };

    return q;
  };

  core.Guarded = function(fn){
    var stacks = [];
    var dist = as.Distributors();
    var safe = as.Distributors();

    var guide = function guide(){
      var ret,stack = {};
      try{
        ret = fn.apply(this,arguments);
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

  core.GuardedPromise = function(fn){
    var pm = as.Promise.create();
    var gm = core.Guarded(fn);

    // gm.onError(function(e){ pm.reject(e); });
    // gm.onSafe(function(e){ pm.resolve(e); });
    // pm.done(function(){ console.log('done',arguments); });
    // pm.fail(function(){ console.log('fails',arguments); });

    gm.onError(pm.reject);
    gm.onSafe(pm.resolve);
    // gm.onSafe(function(){
    //   console.log('i gotin sad');
    // });

    gm.promise = pm;
    return gm;
  };

  core.TwoProxy = function(fn,gn){
    var bind = {};
    bind.first = core.Proxy(fn);
    bind.second = core.Proxy(gn);

    bind.fn = enums.bind(bind.first.proxy,bind.first);
    bind.gn = enums.bind(bind.second.proxy,bind.second);
    bind.useFn = enums.bind(bind.first.useProxy,bind.first);
    bind.useGn = enums.bind(bind.second.useProxy,bind.second);

    return bind;
  };

  core.Proxy = function(fn){

      var prox = function(dn){
        var __binding = dn;

        this.proxy = function(){
          if(__binding && util.isFunction(__binding)){
            return __binding.apply(null,core.enums.toArray(arguments));
          }
          return null;
        };

        this.isBound = function(){ return !!__binding; };

        this.useProxy = function(fn){
          if(!util.isFunction(fn)) return null;
          __binding = fn;
          return null;
        };
      };

      return new prox(fn);
    };

  core.Middleware = function(fn){
      var md = {};
      var tasks = [];
      var reverse = [];
      var kick = false;
      var bind = core.Proxy(fn);

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

  core.JazzUnit = function(desc){
    var dm = ({desc:desc, status: null,stacks: null});
    var units = {};
    var stacks = [];
    // var pm = as.Promise.create();
    var ds = as.Distributors();
    var pmStack = [];
    var proxy;

    units.done = as.Promise.create();
    units.whenDone = function(fn){
      units.done.done(fn);
    };
    units.whenFailed = function(fn){
      units.done.fail(fn);
    };

    var guardpm = function(fn){
      var sg = core.GuardedPromise(fn);
      stacks.push(sg.stacks);
      pmStack.push(sg.promise.promise());
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
      // console.log('asking parse:',dm);
      return ds.distributeWith(units,[dm]);
    };

    units.proxy = function(){ return proxy; };
    units.state = function(){ return state; };
    units.wm = core.Middleware(function(m){
      var wait = as.Promise.when.apply(null,pmStack);
      wait.done(function(e){  report(true);  units.done.resolve(e); });
      wait.fail(function(e){  report(false); units.done.reject(e); });
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
      // gd.onError(function(f){ console.log('e:',f); });
      this.wm.add(function(d,next,end){
        return (gd(d,guardpm) || next());
      });
      return this;
    },units);

    units.upasync = enums.bind(function(gn){
      var gd = guardpm(gn);
      // gd.onError(function(f){ console.log('e:',f); });
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

  core.Formatter = util.bind(as.tags.formatter,as.tag);

  core.Printer = util.bind(as.tags.printer,as.tag);

  var gjzformat = core.Formatter("{{title}}: {{message}}");

  core.JazzCore = function(desc,fn,printer){
    if(!valids.isFunction(fn) || !valids.isString(desc))
      throw "must provide a string and a function as agruments";
    var jz = core.ConsoleView(core.JazzUnit(desc),null,printer);
    fn(jz.proxy());
    return jz;
  };

  core.Jazz = core.JzGroup = function(desc,fn,print){
    if(!valids.isString(desc)) throw "first argument must be a string";
    if(!valids.isFunction(fn)) return "second argument must be a function";
    var printer = core.Printer(print);
    var headerAdded = false;
    var addHeader = function(buff){
      if(headerAdded) return null;
      buff.push((core.Formatter("{{title}} {{message}}")("Test Group:".green.bold,desc.bold.yellow)).cyan);
      buff.push("\n");
      buff.push("----------------------------------------".cyan);
      buff.push("\n");
      headerAdded = true;
    };

    return fn(function(d,f){
      return core.JazzCore(d,f,function(m){
        var buff = [];
        addHeader(buff);
        buff.push(m);
        buff.push("\n");
        printer(buff.join(''));
      });
    });
  };

  core.ConsoleView = function(jazz,formatter,prt){
    if(util.isNull(formatter) || !util.isFunction(formatter)){
      formatter = core.Formatter("-> {{title}}: {{message}}".cyan);
    }

    var printer = core.Printer(prt);

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
            if(valids.notExists(e)) return fn && fn(null);
            buffer.push(formatter("ErrorStack".cyan,core.ErrorParser(e.error)));
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

  core.Expects = (function(){
    var ex = {};

    ex.isList = ex.isArray = invs.errorEffect('is {0} an array',valids.isArray);

    ex.isInstanceOf = invs.errorEffect('is {0} an instance of {1}',valids.isInstanceOf);

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

  core.TypeGenerator = function(fn){

    var sig = util.guid();

    var isType = function(cs){
      if(!core.valids.exists(cs)) return false;
      if(cs.getTypeSignature && valids.isFunction(cs.getTypeSignature) && valids.exists(cs.getTypeSignature())){
        return cs.getTypeSignature() === sig;
      }
      else if(cs.constructor.getTypeSignature && valids.isFunction(cs.constructor.getTypeSignature)){
        return cs.constructor.getTypeSignature() === sig;
      }
      return false;
    };


    var Shell =  function(gn,hn){

      var willuse = gn || fn;

      var shell = function Shell(args){
        var rargs = valids.isArgument(args) ? args : arguments;
        if(this instanceof arguments.callee){
          if(valids.exists(willuse))
            willuse.apply(this,rargs);
          if(valids.exists(hn) && valids.isFunction(hn)){
            hn.apply(this,rargs);
          };
          return this;
        };
        // else{
        //   return new arguments.callee(arguments);
        // }
      };

      shell.getTypeSignature = function(){
        return sig;
      };

      shell.prototype.getTypeSignature = function(){
        return sig;
      };

      return shell;

    };

    Shell.isType = function(cs){
      return isType(cs);
    };

    return Shell;
  };

  core.ClassType = (function(){
    var type = core.TypeGenerator();
    return function(f,hn){
      return { 'maker':type(f,hn),'type':type};
    };
  }());

  var classSig = core.Util.guid();

  core.Class = function(attr,static,_super){

    var spid = core.Util.guid();
    var type = core.ClassType(_super,function(){
      this.GUUID = core.Util.guid();
      this.___instantiated___ = true;
      if(valids.exists(this.init) && valids.isFunction(this.init)){
        this.init.apply(this,arguments);
      }
    });
    var klass = type.maker;
    var children = (_super && _super.___children___ ? _super.___children___.concat([_super.___puuid___]) : []);

    klass.___classSig___ = function(){ return classSig; };

    if(_super && _super.prototype){
      var __f = function(){};
      __f.protoype = _super.prototype;
      klass.prototype = new __f();
      klass.prototype.constructor = klass;
      klass.constructor = klass;
    };

    if(valids.exists(attr) && valids.isObject(attr)){
      util.extendWithSuper(klass.prototype,attr,_super);
    }
    if(valids.exists(static) && valids.isObject(static)){
      util.extends(klass,static);
    }

    klass.___puuid___ = spid;
    klass.___children___ = children;

    klass.isType = function(c){
      return type.type.isType(c);
    };

    klass.extends = function(at,st){
      var childguid = core.Util.guid(),
      child = core.Class(klass.prototype,klass,klass);
      util.extendWithSuper(child.prototype,at,klass);
      util.extends(child,klass,st);
      return child;
    };

    klass.mixin = function(attr,fx){
      var moded = util.isFunction(fx) ? util.extendWith({},attr,fx) : attr;
      util.extendWithSuper(klass.prototype,moded,_super);
      return klass;
    };

    klass.muxin = function(attr){
      return klass.mixin(attr,function(n,f){
        return bindByPass(f);
      });
    };

    klass.mixinStatic = function(attr){
      return util.extends(klass,attr);
    };

    klass.make = function(){
      return new klass(arguments);
    };

    klass.isChild = function(q){
      if(q){
        if(!klass.isType(q)) return false;
        if(core.valids.isList(q.___children___)){
          if(q.___children___.indexOf(klass.___puuid___) != -1) return true;
        }
      }
      return false;
    };

    klass.childInstance = function(q){
      if(valids.not.exists(q)) return false;
      var cx = klass.isChild(q) || klass.isChild(q.constructor);
      var sx = !!q && !!q.___instantiated___;
      return cx && sx;
    };

    klass.instanceBelongs = function(q){
      return klass.childInstance(q) || klass.isInstance(q);
    };

    klass.isInstance = function(kc){
      if(kc){ return kc instanceof klass; }
      return false;
    };

    klass.addChainMethod = function(name,fn){
      klass.prototype[name] = util.bind(function(){
        var res = fn.apply(this,arguments);
        return res ? res : this;
      },klass.prototype);
    };

    klass.extendMethods = function(attr){
      if(!valids.isObject(attr)) return null;
      for(var p in o){
        klass.addMethod(p,attr[p]);
      };
    };

    klass.extendStaticMethods = function(static){
      if(!valids.isObject(static)) return null;
      for(var p in static){
        klass.addStaticMethod(p,static[p]);
      };
    };

    klass.addMethod = function(name,fn){
      util.addMethodOverload(klass.prototype,name,fn);
    };

    klass.addStaticMethod = function(name,fn){
      util.addMethodOverload(klass,name,fn);
    };

    klass.prototype.$unsecure = function(name,fn){
      if(!valids.isFunction(fn) || !valids.isString(name)) return;
      this[name] = core.funcs.bind(function(){
       return fn.apply(this,arguments);
      },this);
    };

    klass.prototype.$secure = function(name,fn){
      if(!valids.isFunction(fn) || !valids.isString(name)) return;
      this[name] = core.funcs.bindByPass(function(){
        return fn.apply(this,arguments);
      },this);
    };

    klass.prototype.$rack = function(fn){
      if(core.valids.not.Function(fn)) return;
      return fn.call(this);
    };

    klass.prototype.$closure = klass.prototype.$bind = function(fn){
      return core.funcs.bind(function(){
        var res = fn.apply(this,arguments);
        return core.valids.exists(res) ? res : this;
      },this);
    };

    klass.prototype.___classSig___ = function(){ return classSig; };

    klass.prototype.constructor = klass;
    klass.constructor = klass;
    return klass;
  };

  core.Class.isType = function(c){
    if(core.valids.notExists(c) || core.valids.isPrimitive(c)) return false;
    if(c && c.___classSig___){
      return c.___classSig___() === classSig;
    }
    if(c && c.prototype.___classSig___){
      return c.prototype.___classSig___() === classSig;
    }
    if(c && c.constructor.prototype.___classSig___){
      return c.constructor.prototype.___classSig___() === classSig;
    }
    return false;
  };

  core.Buffer = (function(){
    var buf = core.Class({
      init: function(f){
        this.max = 8192;
        this.buffer = [];
        this.write(f);
      },
      canWrite: function(){
        return this.buffer.length !== 8192;
      },
      write: function(f){
        if(!this.canWrite()) return;
        if(buf.isType(f)){
          this.buffer = this.buffer.concat(f.buffer);
        }
        else if(core.valids.isList(f)){
          this.buffer = this.buffer.concat(f);
        }
        else{
          this.buffer.push(f);
        }
      },
      concat: function(f){
        return this.write(f);
      },
      toString: function(){
        return this.buffer.toString();
      },
      release: function(){
        var buf = this.buffer;
        this.buffer = [];
        return buf;
      },
      peek: function(){ return this.buffer; }
    });

    return function(f){
      if(core.valids.isList(f)) return buf.make(f);
      return buf.make();
    };
  }).call(this);

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
                  if(res === self){ then.complete(null); }
                  else if(res.then && res.onError && res.isFuture && res.isFuture()){
                    res.onError(function(e){
                      then.completeError(e);
                    });
                    res.then(function(f){
                      if(f === res) then.complete(null);
                      else then.complete(f);
                    });
                  }
                  else{
                    then.complete.call(then,res);
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
                else if(core.Future.isType(res)){
                  if(res === self){ then.complete(null); }
                  else if(res.then && res.onError && res.isFuture && res.isFuture()){
                    res.onError(function(e){
                      then.completeError(e);
                    });
                    res.then(function(f){
                      if(f === res) then.complete(null);
                      else then.complete(f);
                    });
                  }
                  else{
                    then.complete.call(then,res);
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
      isFuture: function(){ return true; },
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
        fx.doneArgs = slist;
        fx.errArgs = elist;

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
            return fn(elist);
          });
        },function(_,err){
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
    init: function(){},
  });

  core.FutureStream = core.Future.extends({
      init: function(){
        this.$super();
        var hooked = this.__hooked__ =  core.Switch();
        var inStream = this.__streamIn__ = core.Stream.make();
        var outStream = this.__streamOut__ = core.Stream.make();
        var reportStream = this.__streamOut__ = core.Stream.make();
        this.chains = [];
        this.in = function(){ return inStream; };
        this.out = function(){ return outStream; };
        this.changes = function(){ return reportStream; };
        this.isHooked = function(){ return hooked.isOn(); };
        this.hook = function(){ hooked.on(); };
        this.unhook = function(){ hooked.off(); };

        var self = this;
        this.onError(function(e){
          inStream.close();
          outStream.close();
        });
        // stream.hookEvents(this.events);
        inStream.addEvent('dataEnd');
        inStream.addEvent('dataBegin');
        inStream.addEvent('dataEnd');
        outStream.addEvent('dataBegin');
        outStream.addEvent('dataEnd');
        reportStream.addEvent('dataBegin');
        reportStream.addEvent('dataEnd');

        inStream.once(this.$bind(function(){  this.hook(); }));

        inStream.onEvent('dataEnd',this.$bind(function(f){
          if(inStream.isEmpty() && !this.isCompleted() && !this.isHooked()) this.complete(true);
        }));

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
      if(fn) this.proxys.add('noop',function(req){});
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
      return this.proxys.Q('noop');
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
    map.schema = schema;

    var ops = map.ops,
    sips = map.sips,
    cur = null,
    ax = {};

    ax.currentModel = target;
    ax.currentSchema = schema;

    var fid = ax.opsId = { fetch: 3, save: 2, update: 4, insert: 1,destroy: 5};
    ax.notify = _.Distributors();

    var push = function(q,n){
      q['$schema'] = schema;
      sips[ops.length] = [];
      ops.push(q);
    };

    /*-------------------------beginning of filters---------------------------------------*/
    /* contains,stream,streamone,find,findone,limit,save,insert, index,destroy, update, yank,sort,filter,...*/

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

    _.funcs.selfReturn(ax,'defineWith',function(fn){
      if(_.valids.not.isFunction(fn)) return;
      fn.call(ax,map,function(name,fx){
         _.funcs.selfReturn(ax,name,fx);
      });
    });

    _.funcs.selfReturn(ax,'define',function(tag){
      if(_.valids.not.isString(tag)) return;
      var t = tag[0] == '$' ? tag : ['$',tag].join('');
      _.funcs.selfReturn(ax,tag,function(data){
          push({'op':t, key: data});
      });
    });

    _.funcs.selfReturn(ax,'end',function(fn,shouldFlush){
      var imap = _.Util.clone(map);
      core.Util.createProperty(imap,'queryKey',{
        get: function(){ return querySig; }
      });
      ax.notify.distribute(imap);
      if(shouldFlush) ax.flush();
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

    core.Util.createProperty(ax,'queryKey',{ get: function(){ return querySig; }});

    ax.defineWith(fn);
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
      var t = tag[0] == '$' ? tag : ['$',tag].join('');
      ax.unwhere(t);
      ax.watchers.push(t);
      ax.atoms[t] = [];
      fn.mutator = function(d,next,end){
        var q = d.q, sm = d.sx, op = q.op.toLowerCase();
        if(op !== t && q.op !== t) return next();
        return fn.call(connection,d.with,q,sm,q['$schema']);
      };
      ax.mutators.add(t,fn);
      mix.add(fn.mutator);
    });

    _.funcs.selfReturn(ax,'unwhere',function(tag){
      var t = tag[0] == '$' ? tag : ['$',tag].join('');
      var ind = ax.watchers.indexOf(t);
      delete ax.watchers[ind];
      // delete ax.atoms[tag];
      var fn = ax.mutators.get(t);
      if(_.valids.isFunction(fn)){ mix.remove(fn.mutator); }
    });

    ax.hasWhere = _.funcs.bind(function(tag){
       return ax.mutators.has(tag);
    },ax);

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
      // this.counter = core.Counter();
      this.generator = generator;
    },
    peek: function(){ return this.registry; },
    isEmpty: function(){
      return this.size() <= 0;
    },
    size: function(){
      return core.enums.keys(this.registry).length;
    },
    clone: function(){
      return core.Util.clone(this.registry);
    },
    each: function(fn,fnc){
      return core.enums.each(this.registry,fn,fnc);
    },
    share: function(fs){
      if(!core.FunctionStore.isInstance(fs)) return;
      return fs.addAll(this);
    },
    shareOverwrite: function(fs){
      if(!core.FunctionStore.isInstance(fs)) return;
      return fs.overwriteAll(this);
    },
    add: function(sid,fn){
      if(this.registry[sid]) return;
      // this.counter.up();
      return this.registry[sid] = fn;
    },
    overwrite: function(sid,fn){
      // if(!this.has(sid)) this.counter.up();
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
      // this.counter.down();
      var f = this.registry[sid];
      delete this.registry[sid];
      return f;
    },
    clear: function(){
      // this.counter.blow();
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
      fn.sid = sid;
      var rest = core.enums.rest(arguments);
      return this.generator.apply(null,[fn].concat(rest));
    },
  });

  core.Storage = core.FunctionStore.extends({
    init: function(id){
      this.$super(core.valids.isString(id) ? id+':Storage' : 'Storage',core.funcs.identity);
    }
  });

  core.Store = core.FunctionStore.extends({
    register: function(){ return this.add.apply(this,arguments); },
    unregister: function(){ return this.remove.apply(this,arguments); },
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

    core.Util.createProperty(target,'validateBy',{
      get: function(){
        return function(name,f,fn){
          var fr = vacks[name];
          if(core.valids.isFunction(fr)) return fr(f,fn);
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
      obj[fn('pub')] = this.$bind(this.events);
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
      this.events.events('endOfData');
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
      paused = false,loosepackets = false,locked = false;

      var it = this.packets.iterator();

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

      var busy = core.Switch();
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
        busy.on();
        var node = it.removeHead();
        this.events.emit('data',node.data,node);
        this.events.emit('dataOnce',node.data,node);
        if(gomanual) return;
        if(!this.isEmpty()){
          return this.__push();
        }
        else this.events.emit('drain',this);
        busy.off();
      });

      this.mutts = core.Middleware(this.$closure(function(f){
        if(subCount() <= 0 && !!loosepackets) return;
        this.packets.add(f);
        this.events.emit('dataCount',this.packets.size());
        if(this.emitSilently) return;
        if(!busy.isOn()) this.__push();
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

      this.$emit = this.$bind(this.emit);

      var bindings = [];

      this.stream = this.$bind(function(sm,withEnd){
        if(!core.Stream.isType(sm)) return;
        var self = this,pk = sm.$closure(sm.emit),pe = sm.$closure(sm.end);
        this.on(pk);
        if(withEnd) this.onEvent('end',pe);
        sm.onEvent('close',this.$closure(function(){
          this.off(pk);
          if(withEnd) this.offEvent('end',pe);
        }));

        var br = {
          unstream: function(){
            return self.off(pk);
          }
        };

        bindings.push(br);
        return br;
      });

      this.streamOnce = this.$bind(function(sm){
        if(!core.Stream.isType(sm)) return;
        var self = this,pk = sm.$closure(sm.emit);
        this.once(pk);
        var br = {
          unstream: function(){
            return self.off(pk);
          }
        };

        bindings.push(br);
        return br;
      });

      this.destroyAllBindings = this.$bind(function(){
        return core.enums.each(function(e,i,o,fx){
          e.unstream();
          return fx(null);
        });
      });

      this.close = this.$bind(function(){
        if(this.isClosed()) return this;
        this.events.emit('close',this);
        this.events.flushAll();
        this.destroyAllBindings();
        return this;
      });

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
      return this;
    },
    push: function(){
      this.__push();
      return this;
    },
    flush: function(){
      this.packets.clear();
      return this;
    },
    condition: function(fn){
      this.mutts.add(function(d,next,end){
        if(!!fn(d)) return next(d);
        return;
      });
      return this;
    },
    conditionAsync: function(fn){
      this.mutts.add(fn);
      return this;
    },
    transform: function(fn){
      this.mutts.add(function(d,next,end){
        var res = fn(d);
        return next(res ? res : d);
      });
      return this;
    },
    transfromAsync: function(fn){
      this.mutts.add(fn);
      return this;
    },
    end: function(){
      if(this.isClosed()) return this;
      this.events.emit('end',this);
      this.resume();
      return this;
    },
    endData: function(){
      if(this.isClosed()) return this;
      this.events.emit('dataEnd',this);
      return this;
    },
    pause: function(){
      if(this.isPaused()) return this;
      this.__switchPaused();
      this.events.emit('paused',this);
      return this;
    },
    resume: function(){
      if(!this.isPaused()) return this;
      this.__switchPaused();
      this.events.emit('resumed',this);
      return this;
    },
    on: function(fn){
      this.events.on('data',fn);
      this.events.emit('subscriberAdded',fn);
      return this;
    },
    once: function(fn){
      this.events.once('dataOnce',fn)
      this.events.emit('subscriberAdded',fn);
      return this;
    },
    off: function(fn){
      this.events.off('data',fn);
      this.events.emit('subscriberRemoved',fn);
      return this;
    },
    offOnce: function(fn){
      this.events.off('dataOnce',fn);
      this.events.emit('subscriberRemoved',fn);
      return this;
    },
    emit: function(n){
      if(this.isLocked()) return this;
      this.mutts.emit(n);
      return this;
    },
  });

  core.FilteredChannel = core.Stream.extends({
    init: function(id,picker){
      this.$super();
      this.id = id;
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
    peekConfig: function(){
      return this.configs.peek();
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
      this.configs.clear();
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

  core.Mask = function(fx){
    var lock = false, mut = {};
    mut.lock = function(){ lock = true; };
    mut.unlock = function(){ lock = false; };
    mut.isLocked = function(){ return !!lock; };

    mut.GUUID = util.guid();

    mut.bind = core.funcs.bind(function(fn){
      return core.funcs.bind(fn,this);
    },mut);

    mut.secure = core.funcs.bind(function(name,fn){
      mut[name] = core.funcs.bindByPass(fn,this);
    },mut);

    mut.unsecure = core.funcs.bind(function(name,fn){
      mut[name] = core.funcs.bind(fn,this);
    },mut);

    mut.secureLock = core.funcs.bind(function(name,fn){
      mut[name] = core.funcs.bindByPass(function(){
        if(this.isLocked()) return;
        return fn.apply(this,arguments);
      },this);
    },mut);

    if(core.valids.Function(fx)){ fx.call(mut); };

    return mut;
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

  //a persistent streamer,allows the persistence of stream items
  core.Persisto = core.Configurable.extends({
    init: function(){
      this.$super();
      var self = this;
      this.busy = core.Switch();
      this.packets = core.List();
      this.router = core.Distributors();
      this.mux = core.Middleware(this.$bind(function(n){
        this.router.distribute(n);
      }));
      this.router.add(function(f){ self.packets.add(f); });

      // this.$push = this.$bind(this.push);

      this.pub('end');

      this.linkStream = this.$bind(function(stream){
        if(!core.Stream.instanceBelongs(stream)) return;
        var it = this.packets.iterator(), data,node;

        this.afterOnce('end',function(){
          stream.endData();
        });

        if(!this.packets.isEmpty()){
          while(it.moveNext()){
            data = it.current();
            node = it.currentNode();
            stream.emit(data,node);
          };

          if(!this.busy.isOn()){
            console.log('stream:',stream);
            stream.endData();
          }
        }

        this.router.add(stream.$emit);

        stream.dropConnection = this.$bind(function(){
          self.router.remove(stream.$emit);
          stream.endData();
        });

        core.Util.nextTick(function(){ it.close();});
      });

      this.linkPersisto = this.$bind(function(stream){
        if(!core.Persisto.instanceBelongs(stream)) return;

        var it = this.packets.iterator(), data,node;

        this.afterOnce('end',function(){
          stream.end();
        });

        if(!this.packets.isEmpty()){

          while(it.moveNext()){
            data = it.current();
            node = it.currentNode();
            stream.emit(data,node);
          };

          if(!this.busy.isOn()){
            stream.end();
          }
        }

        this.router.add(stream.$emit);

        stream.dropConnection = this.$bind(function(){
          self.router.remove(stream.$emit);
          stream.end();
        });

        core.Util.nextTick(function(){ it.close();});
      });

      this.copyStream = this.$bind(function(stream){
        if(!core.Stream.instanceBelongs(stream)) return;
        var it = this.packets.iterator();
        while(it.moveNext()){
          stream.push(it.current());
        };
        this.router.add(stream.$emit);
        stream.dropConnection = this.$bind(function(){ self.router.remove(stream.$emit); });
        core.Util.nextTick(function(){ it.close();});
        return stream;
      });

      this.copyPersisto = this.$bind(function(stream){
        if(!core.Persisto.instanceBelongs(stream)) return;
        var it = this.packets.iterator();
        while(it.moveNext()){
          stream.emit(it.current());
        };
        this.router.add(stream.$emit);
        stream.dropConnection = this.$bind(function(){ self.router.remove(stream.$emit); });
        core.Util.nextTick(function(){ it.close();});
        return stream;
      });

      this.emitEvent = this.events.$bind(this.events.emit);
      this.emit = this.$bind(function(k){
        this.busy.on();
        this.mux.emit(k);
      });
      this.$emit = this.$bind(this.emit);
      this.$close = this.$bind(this.close);
      this.$end = this.$bind(this.end);
  }})
  .muxin({
    flush: function(){
      this.packets.clear();
    },
    steal: function(){
      var sm = core.Stream.make();
      this.patch(sm);
      sm.dropConnection();
      return sm;
    },
    mutate: function(fx){
      if(stacks.valids.isFunction(fx)) fx.call(this,this.packets);
    },
    stream: function(){
      var sm = core.Stream.make();
      this.linkStream(sm);
      return sm;
    },
    flood: function(sm){
      if(!core.Streams.isInstance(sm)) return;
      this.linkStream(sm);
      return sm;
    },
    copy: function(ps){
      if(core.Stream.instanceBelongs(ps)){ return this.copyStream(ps); }
      if(core.Persisto.instanceBelongs(ps)){ return this.copyPersisto(ps); }
      return ps;
    },
    link: function(ps){
      if(core.Stream.instanceBelongs(ps)){ return this.linkStream(ps); }
      if(core.Persisto.instanceBelongs(ps)){ return this.linkPersisto(ps); }
      return ps;
    },
    end: function(){
      this.busy.off();
      this.emitEvent('end',true);
    },
    close: function(){
      this.flush();
      this.router.removeAll();
      this.packets.clear();
    },
  });

});

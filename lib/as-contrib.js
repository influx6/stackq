module.exports = (function(core){


    var asc = core,util = core.Util;

    var nativeSplice = Array.prototype.splice,
    nativeSlice = Array.prototype.slice;

    var enums = asc.enums = {},
        invs = asc.funcs = {},
        notify = asc.notify = {},
        tags = asc.tags = {},
        valids = valtors = asc.valids = {},
        vasync = asc.validAsync = {};


    /**  begin block of type notifiers **/
    notify.fail = function(mesg){
      throw (mesg);
    };

    notify.notice = function(mesg){
      console.log('Notice:',mesg)
    };

    notify.info = function(mesg){
      console.warn('Info:',mesg);
    };

    notify.warn = function(mesg){
      console.warn('Warning:',mesg);
    };

    notify.debug = function(mesg){
      console.warn('Debug:',mesg);
    };

    /**  begin block of type validators **/

    valtors.isInstanceOf = function(m,n){
      if(valids.isFunction(n)){
        return m instanceof n;
      }
      if(valids.isObject(n)){
        return m instanceof n.constructor;
      }
      return m instanceof n;
    };

    valtors.exactEqual = function(m,n){ return m === n; };
    valtors.is = util.bind(util.is,util);
    valtors.isArray = valtors.Array = util.bind(util.isArray,util);
    valtors.isList = valtors.List = valtors.isArray;
    valtors.isObject = valtors.Object = util.bind(util.isObject,util);
    valtors.isNull = valtors.Null = util.bind(util.isNull,util);
    valtors.isUndefined = valtors.Undefined = util.bind(util.isUndefined,util);
    valtors.isString = valtors.String = util.bind(util.isString,util);
    valtors.isTrue = valtors.True = util.bind(util.isTrue,util);
    valtors.isFalse = valtors.False = util.bind(util.isFalse,util);
    valtors.truthy = function(n){ return (!util.isNull(n) && !util.isUndefined(n) && n !== false); };
    valtors.falsy = function(n){ return !valtors.truthy(n); };

    valtors.isBoolean = valtors.Boolean = util.bind(util.isBoolean,util);
    valtors.isArgument = valtors.Argument = util.bind(util.isArgument,util);
    valtors.isType = valtors.Type = util.bind(util.isType,util);
    valtors.isRegExp = valtors.RegExp = util.bind(util.isRegExp,util);
    valtors.matchType = util.bind(util.matchType,util);
    valtors.isFunction = valtors.Function = util.bind(util.isFunction,util);
    valtors.isDate = valtors.Date = util.bind(util.isDate,util);
    valtors.isEmpty = valtors.Empty = util.bind(util.isEmpty,util);
    valtors.isEmptyString = valtors.EmptyString = util.bind(util.isEmptyString,util);
    valtors.isEmptyArray = valtors.EmptyArray = util.bind(util.isEmptyArray,util);
    valtors.isEmptyObject = valtors.EmptyObject = util.bind(util.isEmptyObject,util);
    valtors.isArrayEmpty = valtors.ArrayEmpty = util.bind(util.isArrayEmpty,util);
    valtors.isPrimitive = valtors.Primitive = util.bind(util.isPrimitive,util);
    valtors.isNumber = valtors.Number = util.bind(util.isNumber,util);
    valtors.isInfinity = valtors.Infinity = util.bind(util.isInfinity,util);
    valtors.isElement = valtors.Element = valtors.isKV = function(n){
      return true;
    };

    valtors.notExists = enums.notExists = function(n){
      return (util.isNull(n) || util.isUndefined(n));
    };

    valtors.exists = enums.exists = function(){
      return !valids.notExists.apply(valids,arguments);
    };

    valtors.isNot = enums.exists = function(){
      return !valids.is.apply(valids,arguments);
    };

    valtors.contains = function(f,m){
      if(f[m]) return true;
      if(f.hasOwnProperty && f.hasOwnProperty(m)) return true;
      return false;
    };

    valtors.containsKey = function(f,m){
      if(f.hasOwnProperty && f.hasOwnProperty(m)) return true;
      if(m in f) return true;
      return false;
    };

    valtors.isIndexed =  valtors.Indexed = function(n){
        if(!this.isArray(n) && !this.isString(n) && !this.isArgument(n)) return false;
        return true;
    };

    valtors.Assertor = function(condition,statement){
      if(!valids.isFunction(condition)) return null;
      if(!condition()) throw new Error(statement);
    };

    valtors.Asserted = function(condition,statement){
      if(!condition) throw new Error(statement);
    };

    invs.toString = function(f){
      if(valids.not.exists(f)) return f;
      if(valids.isObject(f)){
        if(valids.isFunction(f.toJSON)) return f.toJSON();
        if(valids.isFunction(f.toString)) return f.toString();
      }
      if(valids.isFunction(f.toString)){
        return f.toString();
      }
      return f;
    };

    invs.modifyLazy = function(fn,scope){
      return function(){
        var args = enums.toArray(arguments),
        fnz = enums.yankLast(args);
        if(!valids.isFunction(fnz)) return;
        return fnz(fn.apply(scope || this,args));
      };
    };

    invs.modifyLazyObject = function(from,to,scope,fx){
      var target = to || {};
      util.each(from,function(e,i,o,gn){
        if(!valids.isFunction(e) && gn) return gn(null);
        target[i] = invs.modifyLazy(valids.isFunction(fx) ? fx(e) : e,scope);
      });
    };

    invs.createbind = function(obj,name,fn){
      obj[name] = util.bind(fn,obj);
      return obj;
    };

    invs.selfReturn = function(obj,name,fn){
      obj[name] = function(){
        var r = fn.apply(obj,arguments);
        return r ? r : obj;
      };
      return obj;
    };

    invs.bindByPass = function(fn,scope){
      return function(){
        var res = fn.apply(scope || this,arguments);
        return (valids.exists(res) ? res : (scope || this));
      };
    };

    invs.restrictArgs = function(fn,n){
      if(valids.not.Function(fn)) return;
      return function(){
        var args = util.toArray(arguments,0,n);
        return fn.apply(this,args);
      };
    };

    invs.bindWith = function(c){
      return function(fn){
        return fn.call(c);
      };
    };

    invs.$f = invs.immediate = function(){
      var args = util.toArray(arguments),
          first = enums.first(args),
          rest = enums.rest(args);
      if(first && valids.isFunction(first)){
        return first.apply(null,rest);
      };
    };

    invs.detox = function(fn,total,scope){
      total = valids.isNumber(total) ? total : 1;
      var res;
      return function(){
        if(total <= 0){ return res; }
        total -= 1;
        return (res = fn.apply(scope || this,arguments));
      };
    };

    invs.throttle = function(fn,total,scope){
      total = valids.isNumber(total) ? total : 0;
      var current = 0, args = [];
      return function(){
        args = arguments.length > 0 ? enums.toArray(arguments) : args;
        current += 1;
        if(current >= total){
          return fn.apply(scope || this,args);
        };
        return null;
      };
    };

    invs.createValidator = valtors.createValidator = function(mesg,fn){
        var f = function(){
            return fn.apply(fn,arguments);
        };

        f.message = mesg;
        return f;
    };

    invs.errorReport = function(desc){
      return function(state,rdesc){
        if(!!state) return state;
        var e = new Error(rdesc || desc);
        throw e;
      };
    };

    invs.errorEffect = function(desc,fn){
      return function(){
        var args = util.toArray(arguments);
        var rd = util.templateIt(desc,args);
        return invs.errorReport(rd)(fn.apply(fn,args),rd);
      };
    };

    invs.checker = valtors.checker = function(){
        var validators = enums.toArray(arguments);

        return function(obj){
          return enums.reduce(validators,function(err,check){
            if(check(obj)) return err;
            else{
              err.push(check.message);
              return err;
            }
          },[]);
        };
    };

    invs.onCondition = valtors.onCondition = function(){
        var validators = enums.toArray(arguments);
        return function(fn,arg){
          var errors = enums.mapcat(function(isv){
            return isv(arg) ? [] : [isv.message];
          },validators);

          if(errors.length === 0) throw errors.join(',');

          return fn(arg);
        }
    };

    /**  begin block of function enumerations **/
    enums.keys = util.bind(util.keys,util);
    enums.values = util.bind(util.values,util);
    invs.bind = enums.bind = util.bind(util.proxy,util);
    invs.extends = enums.extends = util.bind(util.extends,util);
    enums.deepClone = util.bind(util.clone,util);
    enums.flat = util.bind(util.flatten,util);
    enums.iterator = util.bind(util.iterator,util);
    enums.nextIterator = util.bind(util.nextIterator,util);
    enums.each = util.bind(util.eachAsync,util);
    enums.filter = util.bind(util.filter,util);
    enums.map = util.bind(util.map,util);
    enums.flatten = util.bind(util.flatten,util);
    enums.explode = util.bind(util.explode,util);
    enums.eachSync = util.bind(util.eachSync,util);
    enums.eachAsync = util.bind(util.eachAsync,util);
    enums.createProperty = util.bind(util.createProperty,util);
    enums.matchArrays = util.bind(util.matchArrays,util);
    enums.matchObjects = util.bind(util.matchObjects,util);
    enums.cleanArray = util.bind(util.normalizeArray,util);
    enums.cleanArrayNT = function(a){
      return util.nextTick(function(){ return util.normalizeArray(a); });
    };

    invs.defer = function(){
      var args = enums.toArray(arguments);
      return function(fx){
        return fx.apply(this,args);
      };
    };

    enums.deferCleanArray = function(a){
      return invs.defer(a)(enums.cleanArrayNT);
    };

    invs.identity = enums.identity = function(n){
      return n;
    };

    invs.always = enums.always = function(n){
      return function(){
        return n;
      };
    };

    invs.negate = enums.negate = function(fn){
       return function(){
          return !fn.apply(null,arguments);
       };
    };

    valids.not = {};
    vasync.not = {};

    invs.modifyLazyObject(valids,vasync,valids);
    util.mutateFn(valids,valids.not,function(i,fn){
      return enums.negate(fn);
    });
    invs.modifyLazyObject(valids.not,vasync.not,valids.not);

    enums.getItem = function(f,item){
      return f[item];
    };

    enums.setItem = function(f,item,val){
      return f[item] = val;
    };

    enums.destroyItem = function(f,item,val){
      if(valids.not.containsKey(f,item)) return false;
      if(val && f[item] !== val) return false;
      return delete f[item];
    };

    enums.toArray = function(n,i,f){
      if(valtors.isArray(n) || valtors.isArgument(n)) return nativeSlice.call(n,i || 0,f || n.length);
      if(valtors.isString(n)) return enums.values(n);
      //if(valtors.isObject(n)) return [enums.keys(n),enums.values(n)];
      return [n];
    };

    enums.outofBoundsIndex = function(n,arr){
      if(valtors.isIndexed(arr)) return (n < 0 || n >= arr.len);
    };

    enums.Element = function(fn){
        return function(n){
          if(!enums.exists(n)) notify.fail('must supplied a valid type ');
          if(!valtors.isElement(n)) return notify.fail('Not supported on a non-keyValue type  {Array,String,Object,Arguments}!');
          return fn.call(null,n);
        }
    };

    enums.IndexedElement = function(fn){
        return function(n,i){
          if(!enums.exists(n)) notify.fail('must supplied a valid array-type argument');
          if(!valtors.isIndexed(n)) return notify.fail('Not supported on a non-index type!');
          if(valtors.isArgument(n)) n = nativeSlice.call(n,0,n.length);
          return fn.call(null,n,i);
        }
    };

    enums.IndexedNthOrder = function(fn){
      return enums.IndexedElement(function(n,ind){
        if(enums.exists(ind) && enums.outofBoundsIndex(n,n))
          return notify.fail('index can not be more than length!');

        return fn.call(null,n,ind);
      });
    };

    enums.nthRest = enums.IndexedNthOrder(function(a,n){
      return nativeSlice.call(a,n || 1,a.length);
    });

    enums.first = enums.IndexedNthOrder(function(n){
      return n[0];
    });

    enums.second = enums.IndexedNthOrder(function(n){
      return n[1];
    });

    enums.third = enums.IndexedNthOrder(function(n){
      return n[2];
    });

    enums.nth = enums.IndexedNthOrder(function(a,n){
      return a[n];
    });

    enums.last = enums.IndexedNthOrder(function(a,n){
      return a[a.length - 1];
    });

    enums.rest = function(n){
      return enums.nthRest(n,1);
    };

    enums.reverse = enums.IndexedElement(function(n){
      var res = [],len = n.length - 1;
      enums.each(n,function(e,i,o){
          res[len - i] = e;
      });
      return res;
    });

   enums.plucker = function(key){
    return function(n){
      return (n && n[key]);
    }
   };

   enums.reduce = function(n,fn,memo,context){
    var initial = arguments.length > 2;
    if(n == null) n = [];
    this.each(n,function(e,i,o){
      if(!initial){
        memo = e;
        initial = true;
      }else
        memo = fn.call(context,memo,e,i,o);
    });
    if(!initial) throw "Reduce unable to reduce empty array with no initila memo value!";
    return memo;
   };

   enums.reduceRight = function(arr,fn,memo,context){
    var initial = arguments.length > 2;
    if(arr == null) arr = [];
    var len  = arr.length;

    if(len !== +len){
      var keys = this.keys(arr);
      len = keys.length;
    }

    this.each(arr,function(e,i,o){
      var key = keys ? keys[--len] : --len;
      if(!initial){
          memo = o[key];
          initial = true;
      }else
        memo = fn.call(context,memo,o[key],key,o);
    });

    if(!initial) throw "Reduce unable to reduce empty array with no initila memo value!";
    return memo;
   };

   enums.applyOps = invs.applyOps = function(fn){
      return function(n){
        return fn.call(null,n);
      }
   };

   enums.onlyEven = enums.applyOps(function(n){
    if(!valtors.isArray(array)) return notify.fail('must supply a array type');
    return enums.map(n,function(e,i,o){
        return (e%2) === 0;
    });
   });

   enums.onlyOdd = enums.applyOps(function(n){
    if(!valtors.isArray(array)) return notify.fail('must supply a array type');
    return enums.map(n,function(e,i,o){
        return (e%2) !== 0;
    });
   });

   enums.doubleAll = enums.applyOps(function(n){
    if(!valtors.isArray(array)) return notify.fail('must supply a array type');
     return enums.map(n,function(e,i,o){
        return e * 2;
     });
   });

   enums.average = enums.applyOps(function(n){
    if(!valtors.isArray(n)) return notify.fail('must supply a array type');
    return (enums.reduce(n,function(memo,e){
        return memo + e;
    }) / n.length);
   });

   enums.anyOf = function(/*sets of funcs */){
     return this.reduceRight(arguments,function(truth,f){
        return truth || f();
     },true);
   };

   enums.allOf = function(/*sets of funcs */){
     return this.reduceRight(arguments,function(truth,f){
        return truth && f();
     },false);
   };

    enums.construct = function(first,rest){
      return this.cat([first],this.toArray(rest));
    };

   enums.cat = function(){
     var first = this.first(arguments);
     if(this.exists(first)){
        return first.concat.apply(first,this.rest(arguments));
     }
     return [];
   };

   enums.mapcat = function(fn,col){
      return this.cat.apply(this,[this.map(col,fn)]);
   };

   enums.butLast = function(coll){
      return this.toArray(coll).slice(0,-1);
   };

   enums.interpose = function(inter,col){
      return this.butLast(this.mapcat(function(e){
          return enums.construct(e,[inter]);
      },col));
   };

   enums.eachWith = function(fn,fnc){
     return enums.IndexedElement(function(n){
       return enums.each(function(e,i,o,fn){
         fn.call(e,i);
         return fn(null);
       },fnc);
     });
   };

   enums.eachBy = function(fx,fr,fnc){
     return function(n){
       return enums.each(n,function(e,i,o,fn){
         if(fx.call(this,e,i)) fr.call(this,e,i);
           return fn(null);
         },fnc);
     };
   };

   enums.pickWith = function(fn,completefn){
     return enums.IndexedElement(function(n){
        return function(k){
          var map={},keys = enums.toArray(arguments);
          return enums.map(n,function(e,i,o){
            map.elem = e; map.key = i; map.obj = o;
            return fn.apply(map,keys);
          },completefn);
        };
     });
   };

   enums.pickBy = function(fn,completefn){
     return function(n){
        return function(keys){
          var map={};
          var res =  enums.map(n,function(e,i,o){
            map.elem = e; map.key = i; map.obj = o;
            return fn.apply(map,keys);
          },function(_,err){
            completefn.call(this,res,err,_);
          },this);
          return res;
        };
     };
   };

  enums.containsBy = function(keys,fn){
    return function(map){
      return enums.reduceRight(keys,function(memo,f){
        return memo && fn.call(null,map,f);
      },true);
    };
  };

  enums.hasMatch = function(fr,fxc,fec,flip){
    flip = valids.isFunction(flip) ? flip : function(r){ return !!r; };
    return function(map,by,store){
      store = valids.isList(store) ? store : null;
      var state = true,ix = enums.nextIterator(by,function(e,i,o,fn){
        var res = !!fr.call(null,map,e,i,o);
        if(store) store.push(res);
        state = state && res;
        if(flip(res)){
          fn(null);
          return ix.next();
        }
        return fn(i);
      },function(_,err){
        if(err) return valids.isFunction(fec) ? fec.call(err,map,by) : null;
        return valids.isFunction(fxc) ? fxc.call(null,state,map,by) : null;
      });
      ix.next();
      return state;
    };
  };

  enums.hasAnyMatch = function(fr,fxc,fec,flip){
    var pw = enums.hasMatch(fr,fxc,fec,flip),store = [];
    return function(map,by){
      var res = pw(map,by,store);
      return store.indexOf(true) != -1;
    };
  };

  enums.hasAnyMatchWith = function(by,fr,fxc,fec,flip){
    var pw = enums.hasAnyMatch(fr,fxc,fec,flip),store = [];
    return function(map){
      return pw(map,by);
    };
  };

  enums.hasMatchWith = function(by,fr,fxc,fec,flip){
    var pw = enums.hasMatch(fr,fxc,fec,flip);
    return function(map){
      return pw(map,by);
    };
  };

  enums.pickMatch = function(by,fr,fxc,fec,flip){
    var pick = [],pw = enums.hasMatch(fr,fxc,fec,flip);
    return function(){
      var args = enums.toArray(arguments),ix = enums.nextIterator(args,function(m,i,o,fn){
        if(pw(m,by)) pick.push(m,i);
        fn(null)
        ix.next();
      });
      ix.next();
      return pick;
    };
  };

  enums.pickEveryMatch = function(by,fr,fxc,fec,flip){
    var pw = enums.hasMatch(fr,fxc,fec,flip);
    return function(fxn,fxc){
      if(!valids.isFunction(fxn)) return;
      return function(){
        var args = enums.toArray(arguments),ix = enums.nextIterator(args,function(m,i,o,fn){
          if(pw(m,by)) fxn(m,i);
          fn(null)
          ix.next();
        },fxc);
        ix.next();
      };
    };
  };

  enums.pickMatchBy = function(by,fr,fxc,fec,flip){
    var pw = enums.hasMatch(fr,fxc,fec,flip);
    return function(fxn,fxcn){
      if(!valids.isFunction(fxn)) return;
      return function(){
        var args = enums.toArray(arguments),ix = enums.nextIterator(args,function(m,i,o,fn){
          if(pw(m,by)) return fxn(m,function(e){
            fn(e); ix.next();
          },i);

          fn(null);
          ix.next();
        },fxcn);
        ix.next();
      };
    };
  };

  enums.pickOneMatch = function(by,fr,fxc,fec,flip){
    var pick = [],pw = enums.hasMatch(fr,fxc,fec,flip);
    return function(){
      var args = enums.toArray(arguments),ix = enums.nextIterator(args,function(m,i,o,fn){
        if(!pw(m,by)){
          fn(null)
          ix.next();
        }
        pick = m;
        fn(true);
      });
      ix.next();
      return pick;
    };
  };

  enums.removeWith = function(fn){
    return this.pickWith(function(keys){
        var is = fn.apply(this,enums.toArray(arguments));
        if(valtors.truthy(is)){
          delete this.obj[this.key];
          return is;
        }
    },function(o){
       if(valtors.isArray(o)) enums.cleanArray(o);
    });
  };

  enums.toElementPair = enums.Element(function(n){
     var paired = [];
     enums.each(n,function(e,i,o){
        paired.push([i,e]);
     });

     return paired;
  });

  enums.yankNth = function(list,i){
    if(!valtors.isList(list) || i >= list.length) return null;
    var item,index;
    if(valtors.isNumber(i)){
      index = i < 0 ? list.length + i : i;
       item = list[index];
      list[index] = null;
    }
    if(valtors.isString(i)){
      index = list.indexOf(i);
      if(index == -1) return null;
      list[index] = null;
      item = index;
    }
    list = util.normalizeArray(list);
    return item;
  };

  enums.length = function(obj){
    if(valids.isList(obj) || valids.isString(obj)) return obj.length;
    if(valids.isObject) return enums.keys(obj).length;
    return -1;
  }

  enums.yankFirst = function(list){
    if(!valtors.isList(list)) return null;
    return enums.yankNth(list,0);
  }

  enums.yankLast = function(list){
    if(!valtors.isList(list)) return null;
    return enums.yankNth(list,list.length - 1);
  }

  enums.deconstructPair = function(hooks,pairs){
    return enums.constructPair(hooks,pairs);
  };

  enums.constructPair = function(sets,hooks){
    return [enums.construct(enums.first(sets),enums.first(hooks)),
      enums.construct(enums.second(sets),enums.second(hooks))];
  },

  enums.zip = enums.IndexedElement(function(n){
    if(valtors.isEmpty(n)) return [[],[]];
    return enums.deconstructPair(enums.first(n),enums.zip(enums.rest(n)));
  });

  enums.unzip = enums.IndexedElement(function(n){
    if(valtors.isEmpty(n)) return [[],[]];
    return enums.constructPair(enums.first(n),enums.unzip(enums.rest(n)));
  });

  enums.range = function(n){
    var interpolator = function(i,g){
      g.push(i);
      if( i < n) return interpolator((i += 1),g);
      return g;
    };
    return  interpolator(0,[]);
  };

  enums.cycle = function(times,arr){
    if(times <= 0) return [];
    return enums.cat(arr,enums.cycle(times - 1,arr));
  };

  enums.someString = function(len,bit,base){
    return Math.random().toString(base || 36).substr(bit || 2,len)
  };

  enums.uniqueString = function(start){
    var counter = start || 0;
    return {
      gen: function(prefix,suffix){
        if(valtors.exists(suffix)) return [prefix,counter++,suffix].join('');
        return [prefix,counter++].join('');
      }
    };
  };

  invs.doIn = function(fn,ms){
    var kt = setTimeout(fn,ms);
    return kt;
  };

  invs.effect = function(fn){
    return function(n){
      fn.apply(null,enums.toArray(n));
      return n;
    }
  };

 invs.visit = function(mapfn,resfn,arr){
    if(valtors.isArray(arr))
       return resfn(_this.map(arr,mapfn));
     else
      return resfn(arr);
 };

 invs.trampoline = function(fn){
  var res = fn.apply(fn,enums.rest(arguments));

  while(valtors.isFunction(res)) res = res();

  return res;
 };

 invs.apply = function(fn){
    return function(){
      return fn.apply(this,enums.toArray(arguments));
    };
 };

 invs.fApply = function(fn){
    return function(n){
       var ret = fn.call(null,n);
       return (valtors.exists(ret) ? ret : n);
    }
 };

 invs.invokeOn = function(n,method){
    if(!valtors.isFunction(method)) notify.fail('second argument must be function type!');
    return function(){
     var ret = method.apply(n,enums.toArray(arguments));
     return (valtors.exists(ret) ? ret : n);
    };
 };

 invs.invokeWith = function(n,method){
   if(!valtors.exists(n[method])) return notify.fail('Method:{'+method+'} does not exist on object');
   return function(f){
     var args = enums.toArray(arguments);
     var ret = n[method].apply(n,arguments);
     return (valtors.exists(ret) ? ret : n);
   }
 };

 invs.fnull = function(func){
  var rest = enums.rest(arguments);
  return function(){
    var args = enums.map(arguments,function(e,i,o){
        return enums.exists(e) ? e : rest[i];
    },null,null,true);

    return func.apply(null,args);
  };
 };

  invs.dispatch = function(){
    var sets = enums.toArray(arguments), len = sets.length;

    return function(target){
        var ret, args = enums.rest(arguments);

        for(var i = 0; i < len; i++){
          ret = sets[i].apply(null,[target].concat(args));
          if(valtors.truthy(ret)) return ret;
        }

        return ret;
    }
  };

  invs.gatherArgs = function(fn,n,arg){
    var sets = arg || [n];
    return function(){
      var max = sets[0], len = sets.length;
      sets = sets.concat(enums.toArray(arguments));

      n -= 1;
      if(n <= 0){
        var arg = enums.rest(sets); sets = null;
        return fn(arg);
      }
      return invs.gatherArgs(fn,n,sets);
    };
  };

 invs.partial = function(fn,n){
  return invs.gatherArgs(function(a){
    return function(){
      return fn.apply(null,a.concat(enums.toArray(arguments)));
    }
  },(n || 1));
 };

 invs.curried = function(fn,n){
  return invs.gatherArgs(function(a){
    return fn.apply(null,enums.reverse(a));
  },n);
 };

 invs.doWhen = function(state,fn){
    if(valtors.truthy(state)) fn(state);
    return null;
 };

 invs.invoke = function(name,method){
    return function(target){
        if(!enums.exists(target)) notify.fail('target must exist / a valid object');
        var mt = target[name], rest= enums.rest(arguments);

        return invs.doWhen((enums.exists(mt) && method === mt),function(){
            return mt.apply(target,rest);
        });
    }
 };

invs.compose = function(){
  var fns = enums.toArray(arguments);

  return function(){
    var composed = enums.reduceRight(fns,function(memo,e,i){
        return function(){
          var ret =  e.apply(this,[memo.apply(this,arguments)]);
          // if(!enums.exists(ret)) throw "No returned value received at chain: "+e.toString();
          return ret;
        }
    });

    return composed.apply(this,enums.toArray(arguments));
  }
};

invs.effectCountOnce = function(fn,count){
  var counter = 0,runned = false;
  return function(n){
     if(!!runned) return;
     if(counter >= count){
       runned = true;
       fn.call(null,n);
     }
     counter += 1;
  };
};

invs.effectEveryCount = function(fn,count){
  var counter = 0;
  return function(n){
     if(counter >= count){
       fn.call(null,n);
       counter = 0;
     }
     counter += 1;
  };
};

invs.onValues = invs.compose(invs.applyOps,invs.values);
invs.onKeys = invs.compose(invs.applyOps,invs.keys);

invs.MixinCreator = function(fn/*,mixins fn..*/){
  var target = function(){
        var _ = this;
        return invs.bind(function(){
          fn.apply(this,arguments);
          return _;
        },_);
      },
      rest = enums.rest(arguments),
      mixins = function(){
        return enums.map(rest,function(e,i){
          if(valtors.isFunction(e)) return e();
          if(valtors.isObject(e)) return enums.deepClone(e);
        });
      };

  //target.fn.constructor = fn;

  //target.prototype = target.fn = invs.extends.apply(null,[{}].concat(mixins()));
  return function(){
     target.prototype = invs.extends.apply(null,[{}].concat(mixins()));
     target.prototype.constructor = fn;
     target.fn = target.prototype;

     return (new target()).apply(null,enums.toArray(arguments));
  };
};

tags.formatter = function(format){
  if(!util.isString(format)) return null;
  return function(title,message){
    try{
      if(util.isObject(message)){
        return format.replace("{{title}}",title).replace("{{message}}",JSON.stringify(message));
      }else{
        return format.replace("{{title}}",title).replace("{{message}}",message);
      }
    }catch(e){
      return format.replace("{{title}}",title).replace("{{message}}",message);
    }
  };
};

tags.printer = function(p){
  if(valids.isFunction(p)) return p;
  return console.log;
};

tags.prefix = function(format,printer){
  var prt = tags.printer();
  var fp = tags.formatter(format || "{{title}} ->  {{message}}");
  return function(name,data){
    return prt(fp(name,data));
  };
};

tags.tag = tags.prefix();

tags.tagDefer = function(name,fn){
  return function(data){
    return tags.tag(name,(fn && util.isFunction(fn) ? fn(data) : data));
  };
};

tags.jsonDefer = function(name,fn,fx,ix){
  return tags.tagDefer(name,function(f){
    var data;
    try{
      var tx = null;
      if(util.isFunction(f.toJson)) data = f.toJson();
      else if(util.isFunction(f.toJSON)) tx = f.toJSON();
      else if(util.isFunction(f.toObject)) tx = f.toObject();
      data = JSON.stringify(util.isObject(tx) ? tx : f,fx,ix);
    }catch(e){
      data = f;
    }
    if(util.isFunction(fn)) return fn(data);
    return data;
  });
};

invs.curry = function(fx,f){
  var argz = enums.toArray(arguments,1);
  return function(){
    var args = enums.toArray(arguments), rargs = args.concat(argz);
    return fx.apply(this,rargs);
  };
};

invs.null = function(){};

return asc;

});

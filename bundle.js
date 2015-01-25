(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    invs.singleQuote = function(f){
      return "'"+f+"'";
    };

    invs.doubleQuote = function(f){
      return '"'+f+'"';
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

},{}],2:[function(require,module,exports){
(function (process){
module.exports = (function(core){

  var empty = {};
  var AppStack = core;
  var _pusher = Array.prototype.push;
  var identity = function(f){ return f;};
  var bindByPass = function(fn,scope){
    return function(){
      var res = fn.apply(scope,arguments);
      return res ? res : (scope || this);
    };
  };

  AppStack.noConflict = function(){
      root.AppStack = previousAppStack;
      return this;
  };

  AppStack.Counter = function(){
      var counter = {};
      counter.tick = 0;

      counter.up = function(){
        this.tick += 1;
      };

      counter.down = function(){
        if(this.tick <= 0) return null;
        this.tick -= 1;
      };

      counter.blow = function(){
        this.tick = 0;
      };

      counter.count = function(){ return this.tick; };

      return counter;
  }

  AppStack.Util = {

      //meta_data
      name:"AppStack.Util",
      description: "a set of common,well used functions for the everyday developer,with cross-browser shims",
      licenses:[ { type: "mit", url: "http://mths.be/mit" }],
      author: "Alexander Adeniyi Ewetumo",
      version: "0.3.0",

      days: ['Sunday',"Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"],
      months: ['January',"February", "March", "April","May", "June", "June","August","September","October","November","December"],
      symbols: ["!", "\\",":",";",".","=",",","/","|","#", "$", "%", "&", "'", "(", ")", "*","?","+","@","^","[","]","{","}","-","+","_","<",">"],
      letters: ["a", "b", "c", "d", "e", "f", "g", "h","i","j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],

      inherit : function(child,parent){

         var creationShell = function(){};
         creationShell.prototype = parent.prototype ? parent.prototype : parent.constructor.prototype;

         child.prototype = new creationShell();

         child.prototype.constructor = child;
        //  if(parent.prototype) child.superParent = child.prototype.superParent = parent.prototype;
         if(parent.prototype && parent.prototype.constructor) parent.prototype.constructor = parent;

         return true;
      },

      capitalize: function(m){
        if(!this.isString(m)) return;
        var f = this.toArray(m);
        f[0] = f[0].toUpperCase();
        return f.join('');
      },

      map: function(obj,callback,completer,scope,conf){
         if(!obj || !callback) return false;
         var result = [];

         this.forEach(obj,function iterator(o,i,b){
          var r = callback.call(scope,o,i,b);
          if(!!allow || r) result.push(r);
        },completer,scope || this,conf);
         return result;
      },

      iterator: function(obj,callback,complete,scope,conf){
        if(!this.isValid(obj)) return;
        if(!callback || typeof callback !== 'function') return false;
        if(typeof complete !== 'function') complete = function(){};

        var hasLen = (this.isArray(obj) ? true : (this.isString(obj) ? true : false));
        var keys = hasLen ? obj : this.keys(obj);
        var self = this;
        var zconf = this.extends({
          reverse: false,
          nulls: false,
          from: 0,
          to: keys.length
        },conf);

        zconf.to = zconf.to == Infinity ? keys.length : zconf.to;

        var getKey = function(ix){
          if(self.isArray(obj) || self.isString(obj)) return ix;
          return keys[ix];
        };

        var ind = zconf.from,
            errStop = null,
            max = zconf.to,
            min = max - 1,
            over = max + 1,
            fix = 0,
            key,
            val;

        if(!max) return;

        for(; ind < over; ind++){
          fix = zconf.reverse ? max - ind : ind;
          key = getKey(fix),
          val = obj[key];

          if(self.isValid(errStop)) break;

          if( ind >= max){
            if(self.isFunction(complete)) complete.call(scope || self, obj,errStop);
            return;
          }

          if(!zconf.nulls && (self.isUndefined(val) || self.isNull(val))) continue;

          callback.call(scope || self,val,key,obj,function(err){
            if(self.isValid(err)){
              if(self.isFunction(complete)) complete.call(scope || self, obj,err);
              errStop = err;
            }
          });
        }


      },

      nextIterator: function(obj,callback,complete,scope,conf){
        if(!this.isValid(obj)) return null;
        if(!callback || typeof callback !== 'function') return null;
        if(typeof complete !== 'function') complete = function(){};

        var hasLen = (this.isArray(obj) ? true : (this.isString(obj) ? true : false));
        var keys = hasLen ? obj : this.keys(obj);
        var total = keys.length;
        var self = this;
        var zconf = this.extends({
          reverse: false,
          nulls: false,
          from: 0,
          to: keys.length
        },conf);

        zconf.to = zconf.to >= Infinity ? keys.length : zconf.to;

        var getKey = function(ix){
          if(self.isArray(obj) || self.isString(obj)) return ix;
          return keys[ix];
        };

        var ind = zconf.from <= -1 ? total + zconf.from : zconf.from,
            canNext = true,
            errStop = null,
            max = zconf.to <= -1 ? Math.abs(total + zconf.to) : zconf.to,
            min = max - 1,
            over = max + 1,
            fix = 0,
            ret,
            cret,
            key,
            val;


        if(ind > total) ind = 0;

        if(!max){
           canNext = false;
           return ret || cret;
        }

        var callNext = function(){
          if(ind > over){
             canNext = false;
            return ret || cret;
          };

          fix = zconf.reverse ? max - ind : ind;

          if(fix == max){
            fix = Math.abs(fix - 1);
            ind += 1;
          }
          else if(fix > max){
            fix = Math.abs((fix - Math.abs(max - fix)) - 1);
            ind += 1;
          }

          key = getKey(fix),
          val = obj[key];

          if(self.isValid(errStop)){
            canNext = false;
            return ret || cret;
          }

          if( ind > max){
            canNext = false;
            if(self.isFunction(complete)) cret = complete.call(scope || self, obj,errStop);
            return ret || cret;
          }

          if(!zconf.nulls && (self.isUndefined(val) || self.isNull(val))){
            ind += 1;
            return ret || cret;
          }

          ind += 1;


          ret = callback.call(scope || self,val,key,obj,function(err){
            if(self.isValid(err)){
              if(self.isFunction(complete)) cret = complete.call(scope || self, obj,err);
              errStop = err;
            }
            return ret || cret;
          });

          return ret || cret;
        };

        var hasNext = function(){
          return !!canNext;
        };

        return {
          hasNext: hasNext,
          next: function(){
            if(!hasNext()) return;
            return callNext.call(null);
          },
          current: function(){
            return val;
          },
          returned: function(){
            return ret || cret;
          },
          retCall: function(){
            return ret;
          },
          comCall: function(){
            return cret;
          }
        }
      },

      forEach: function(obj,callback,complete,scope,conf){
        return this.iterator.apply(this,arguments);
      },

      eachAsync: function(){
        return this.iterator.apply(this,arguments);
      },

      eachSync: function(obj,iterator,complete,scope,conf){
            if(!iterator || typeof iterator !== 'function') return false;
            if(typeof complete !== 'function') complete = function(){};


            var self = this,step = 0, keys = this.keys(obj),fuse;
            var zconf = this.extends({
              reverse: false,
              nulls: false,
              from: 0,
              to: keys.length
            },conf);

            zconf.to = zconf.to == Infinity ? keys.length : zconf.to;

            var ind = zconf.from,
                errStop = null,
                max = zconf.to,
                min = max - 1,
                over = max + 1;

            if(!keys.length) return false;

            fuse = function(){
              var ind = zconf.reverse ? max - step : step;
              var key = keys[ind];
              var item = obj[key];

              (function(z,a,b,c){
                  if(!zconf.allow){
                    if(self.isUndefined(item) || self.isNull(item)){ step += 1; return fuse(); }
                  }
                  iterator.call(z,a,b,c,function completer(err){
                      if(err){
                        complete.call(z,c,err);
                        complete = function(){};
                      }else{
                        step += 1;
                        if(step === keys.length) return complete.call(z,c);
                        else return fuse();
                      }
                  });
             }((scope || this),item,key,obj));
            };

            fuse();
      },



      mixin : function(from,to){
         for(var e in from){
            if(e in to) return;
            to[e] = from[e];
         }
      },

      mutateFn : function(from,to,mutatefn){
        var e,fn,val;
         for(e in from){
          fn = from[e];
          if(!AppStack.Util.isFunction(fn)) continue;
          to[e] = mutatefn(e,fn);
         }
      },

      mutateObj : function(from,to,mutatefn){
         for(var e in from){
          var fn = from[e];
          to[e] = mutatefn(e,fn);
         }
      },

      // destructive extends
      extends:function(){
        var obj = arguments[0];
        var args = Array.prototype.splice.call(arguments,1,arguments.length);
        var desc;
        this.forEach(args,function(o,i,b){
        if(o  !== undefined && typeof o === "object"){
           for(var prop in o){
             desc = Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(o,prop) : empty;
             var g = o.__lookupGetter__(prop), s = o.__lookupSetter__(prop);
             if(g || s){ this.createProperty(obj,prop,{get:g, set:s},desc); }
             else obj[prop]= o[prop];
              }
            }
        },null,this);
        return obj;
      },

      extendWith : function(to,o,fn,override){
         var self = this,fn = (fn || function(e,fn){ return fn; }),desc;
         var ov = this.isBoolean(override) ? override : true;
            if(o  !== undefined && typeof o === "object"){
             for(var prop in o){
               if(!ov && to[prop]) continue;
               desc = Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(o,prop) : empty;
               var g = o.__lookupGetter__(prop), s = o.__lookupSetter__(prop);
               if(g || s){ this.createProperty(obj,prop,{get:g, set:s},desc); }
               else to[prop]= fn(prop,o[prop]);
            }
          }
          return to;
      },

      extendWithSuper: function(kc,attr,sup,ov){
        var self = this;
        var parent = (sup ? (sup.prototype ? sup.prototype : sup.constructor.prototype) : sup);
        if(self.isValid(parent)){
          self.extendWith(kc,attr,function(name,fn){
            if(!parent || !self.isFunction(fn)) return fn;
            if(!self.isFunction(parent[name])) return fn;
            return function(){
              if(parent){
                var tmp = this.$super;
                this.$super = parent[name];
                var ret = fn.apply(this,self.toArray(arguments));
                this.$super = tmp;
                return ret;
              }else{
                return fn.apply(this,self.toArray(arguments));
              }
            };
          },ov);
        }else{
          this.extends(kc,attr);
        }
      },

      addMethodOverload: function(obj,name,fn){
        var self = this;
        var old = obj[name];
        if(old){
          obj[name] = function(){
            if(fn.length == arguments.length)
              return fn.apply(obj,arguments);
            else if(self.isFunction(old)){
              return old.apply(obj,arguments);
            }
          };
        }else{
          obj[name] = fn;
        }
      },

      padNumber: function(n){
        return n > 9 ? ''+n : '0'+n;
      },

      instanceOf: function(ob,oj){
        return (ob instanceof oj);
      },

      escapeHTML: function(html){
        return String(html)
          .replace(/&(?!\w+;)/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },

      clinseString: function(source){
        return String(source).replace(/"+/ig,'');
      },

      chunk: function Chunk(word,spot,res){
        if(!word.length || !this.isString(word)) return res;
        var self = this,o = this.toArray(word), out = res || [];
        out.push(this.makeSplice(o,0,spot || 1).join(''));
        if(o.length) return self.chunk(o.join(''),spot,out);
        return out;
      },


      toArray: function(o,from,to){
        if(this.isArgument(o))
          return Array.prototype.splice.call(o,from || 0,to || o.length);
        if(this.isString(o) || this.isObject(o)) return this.values(o);
        return [o];
      },

      fixJSCode: function(js){
        return String(js)
        .replace(/\/*([^/]+)\/\n/g, '')
        .replace(/\n/g, '')
        .replace(/ +/g, ' ');
      },

      clinse : function(o){
        if(this.isNull(o)) return "null";
        if(this.isUndefined(o)) return "Undefined";
        if(this.isNumber(o)) return (""+o);
        if(this.isString(o)) return o;
        if(this.isBoolean(o)) return o.toString();
        return o;
      },


      processIt: function(o){
        if(this.isArray(o)) return this.map(o,function(e){ return this.clinse(e); },this);
        if(this.isFunction(o) || this.isObject(o)) return (o.name ? o.name : this.isType(o));
        return this.clinse(o);
      },


      templateIt: function(source,keys,fx){
       if(!this.isString(source) && !this.isArray(keys)) return;

        var src = source;
        var self = this;
        this.forEach(keys,function(e,i,o,fr){
            var reggy = new RegExp("\\{"+(i)+"\\}");
            src = src.replace(reggy,self.createRepresentation(e) || '[Object]');
            fr(null);
        },function(){
          if(typeof fx == 'function') fx(src);
        });

        return src;
      },

      createRepresentation: function(m,indent){
        if(!this.isValid(m)) return '[unknown]';
        var res;
        try{
          res = JSON.stringify(m,null,indent || 2);
        }catch(e){
          res = JSON.stringify(m,function(i,f){
            return f.toString();
          },indent || 2);
        }

        return res;
      },

      fixPath: function(start,end){
          var matchr = /\/+/,pile;
          pile = (start.split(matchr)).concat(end.split(matchr));
          this.normalizeArray(pile);

          pile = this.map(pile,function(e,i,o){
            if(e == '.') return '.';
            return e;
          });

          if(pile[0].match(/(\.+)/)) return pile.join('/');
          return "/"+pile.join('/');
       },

      clockIt : function(fn){
          var start = Time.getTime();
          fn.call(this);
          var end = Time.getTime() - start;
          return end;
      },

      guid: function(){
          return 'xxxxxxxx-xyxx-yxyxxyy-yxxx-xxxyxxyxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
          }).toUpperCase();
      },

      revGuid: function(rev){
          return ((rev && this.isNumber(rev) ? rev : '1')+'-xxyxyxyyyyxxxxxxyxyxxxyxxxyyyxxxxx').replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16); });
      },

      //use to match arrays to arrays to ensure values are equal to each other,
      //useStrict when set to true,ensures the size of properties of both
      //arrays are the same
      matchArrays: function(a,b,beStrict){
             if(this.isArray(a) && this.isArray(b)){
              var alen = a.length, i = 0;
              if(beStrict){
               if(alen !== (b).length){ return false; }
             }

             for(; i < alen; i++){
               if(a[i] === undefined || b[i] === undefined) break;
               if(b[i] !== a[i]){
                return false;
                break;
              }
            }
            return true;
          }
      },

      //alternative when matching objects to objects,beStrict criteria here is
      //to check if the object to be matched and the object to use to match
      //have the same properties
      matchObjects: function(a,b,beStrict){
             if(this.isObject(a) && this.isObject(b)){

              var alen = this.keys(a).length, i;
              for(i in a){
               if(beStrict){
                if(!(i in b)){
                 return false;
                 break;
               }
             }
             if((i in b)){
              if(b[i] !== a[i]){
               return false;
               break;
             }
           }
         }
         return true;
       }
      },

      memoizedFunction : function(fn){
           var _selfCache = {},self = this;
           return function memoized(){
            var memory = self.clone(arguments,[]),
            args = ([].splice.call(arguments,0)).join(",");
            if(!_selfCache[args]){
             var result = fn.apply(this,memory);
             _selfCache[args] = result;
             return result;
           }
           return _selfCache[args];
         };
      },


      createChainable: function(fn){
         return function chainer(){
          fn.apply(this,arguments);
          return this;
        }
      },

      chain: function(o){
        if(!this.isObject(o)) return;
        var self = this,orig = o, chained = { implode: function(){ self.explode(this); } };
        this.forEach(o,function(e,i,o){
          if(this.has(orig,i) && this.isFunction(e) && !(i === 'implode')) chained[i] = function(){ orig[i].apply(orig,arguments); return chained; }
        },null,this);
        return chained;
      },

      //takes a single supplied value and turns it into an array,if its an
      //object returns an array containing two subarrays of keys and values in
      //the return array,if a single variable,simple wraps it in an array,
      arranize: function(args){
          if(this.isObject(args)){
            return [this.keys(args),this.values(args)];
          }
          if(this.isArgument(args)){
           return [].splice.call(args,0);
          }
          if(!this.isArray(args) && !this.isObject(args)){
            return [args];
          }
      },

      //simple function to generate random numbers of 4 lengths
      genRandomNumber: function () {
        var val = (1 + (Math.random() * (30000)) | 3);
        if(!(val >= 10000)){
          val += (10000 * Math.floor(Math.random * 9));
        }
        return val;
      },

      makeArray: function(){
       return ([].splice.call(arguments,0));
      },

      makeSplice: function(arr,from,to){
       return ([].splice.call(arr,from,to));
      },

      //for string just iterates a single as specificed in the first arguments
      forString : function(i,value){
             if(!value) return;
             var i = i || 1,message = "";
             while(true){
              message += value;
              if((--i) <= 0) break;
            }

            return message;
      },

      isEmptyString: function(o,ignorespace){
           if(this.isString(o)){
            if(o.length === 0) return true;
            if(o.match(/^\s+\S+$/) && !ignorespace) return true;
          }
      },

      isEmptyArray: function(o){
          if(this.isArray(o)){
            if(o.length === 0 || this.isArrayEmpty(o)){ return true; }
          }
      },

      isEmptyObject: function(o){
          if(this.isObject(o)){
            if(this.keys(o).length === 0){ return true; }
          }
      },

      isEmpty: function(o){
          if(this.isString(o)) return this.isEmptyString(o,true);
          if(this.isArray(o)) return this.isEmptyArray(o);
          if(this.isObject(o)) return this.isEmptyObject(o);
          return false;
      },

      isArrayEmpty: function(o){
        if(!this.isArray(o)) return false;

        var i = 0,step = 0, tf = 0,len = o.length,item;
        for(; i < len; i++){
          item = o[i];
          if(typeof item === "undefined" || item === null || item === undefined) ++tf;
          if( ++step === len && tf === len) return true;
        };
        return false;
      },

      makeString : function(split){
         var split = split || "",
         args = this.makeArray.apply(null,arguments);
         return args.splice(1,args.length).join(split);
      },

      createProxyFunctions: function(from,to,context){
          if(!context) context = to;

          this.forEach(from,function proxymover(e,i,b){
             if(!this.isFunction(e)) return;
             to[i] = function(){
              return b[i].apply(context,arguments);
            }
          },null,this);
      },

      toJSON: function(obj,showfunc,indent,custom){
        var self = this;
        indent = indent || 5;
        if(!showfunc) return JSON.stringify(obj,null,indent);
        return JSON.stringify(obj,function(i,v){
          if(custom) return custom(i,v);
          if(self.isFunction(v)) return v.toString();
          return v;
        },indent);
      },

      hasGetProperty: function(obj,name){
        return this.isValid(obj.__lookupGetter__(name));
      },

      hasSetProperty: function(obj,name){
        return this.isValid(obj.__lookupSetter__(name));
      },

      findGetProperty: function(obj,name){
        return obj.__lookupGetter__(name);
      },

      findSetProperty: function(obj,name){
        return obj.__lookupSetter__(name);
      },

      defineGetProperty: function(obj,name,fns){
        return obj.__defineGetter__(name,fns);
      },

      defineSetProperty: function(obj,name,fn){
        return obj.__defineSetter__(name,fn);
      },

      defineGSProperty: function(obj,name,fns){
        if(this.isFunction(fns.get)) this.defineGetProperty(obj,name,fns.get);
        if(this.isFunction(fns.set)) this.defineSetProperty(obj,name,fns.set);
      },

      createProperty: function(obj,name,fns,properties){
        properties = this.mixin({
          enumerable: true,
          configurable: true,
          // writable: true,
        },properties || empty);

         if(!("defineProperty" in Object) && Object.__defineGetter__ && Object.__defineSetter__){
          if(fns.get) obj.__defineGetter__(name,fns.get);
          if(fns.set) obj.__defineSetter__(name,fns.set);
          if(properties) obj.defineProperty(name,properties);
          return;
        }

        if(!this.hasGetProperty(obj,name) && !this.hasSetProperty(obj,name)){
          Object.defineProperty(obj,name,{
            'get': fns.get, 'set': fns.set
          },properties);
        }
        return true;
      },

      // returns the position of the first item that meets the value in an array
      any: function(o,value,fn){
         if(this.isArray(o)){
          return this._anyArray(o,value,fn);
        }
        if(this.isObject(o)){
          return this._anyObject(o,value,fn);
        }
      },

      contains: function(o,value){
         var state = false;
         this.forEach(o,function contain_mover(e,i,b){
          if(e === value) {
           state = true;
           }
         },null,this);

         return state;
      },

      merge: function(a,b,explosive){
        var out = this.clone(a);
        var self = this;
        this.forEach(b,function(e,i,o){
            if(self.has(a,i) && self.has(b,i) && !explosive) return;
            if(self.has(a,i) && self.has(b,i) && !!explosive){
              out[i] = e;
              return;
            }
            out[i] = e;
        });
        return out;
      },


      push: function(a,val,key){
        if(this.isArray(a) || this.isString(a)) return Array.prototype.push.call(a,val);
        if(this.isObject(a)) return a[key] = val;
      },

      matchReturnType: function(a,b){
        if(!this.matchType(a,this.isType(b))) return;
        if(this.isObject(a)) return {};
        if(this.isString(a) || this.isArray(a)) return [];
        return;
      },

      intersect: function(a,b,withKey){
        var out = this.matchReturnType(a,b);
        if(this.isString(a)){ a = this.values(a); b = this.values(b); }

        this.forEach(a,function(e,i,o){
            if(withKey === false && this.contains(b,e)) this.push(out,e,i);
            if(this.hasOwn(b,i,e)) this.push(out,e,i);
            return;
        },null,this);

        if(this.isString(a)) return this.normalizeArray(out).join('');
        if(this.isArray(a)) return this.normalizeArray(out);
        return out;
      },

      disjoint: function(a,b,withKey){
        var out = this.matchReturnType(a,b);

        if(this.isString(a)){ a = this.values(a); b = this.values(b); }

        this.forEach(a,function(e,i,o){
            if(withKey === false && !this.contains(b,e)) this.push(out,e,i);
            if(!this.hasOwn(b,i,e)) this.push(out,e,i);
            return;
        },null,this);

        this.forEach(b,function(e,i,o){
            if(withKey === false && !this.contains(a,e)) this.push(out,e,i);
            if(!this.hasOwn(a,i,e)) this.push(out,e,i);
            return;
        },null,this);

        if(this.isString(a)) return this.normalizeArray(out).join('');
        if(this.isArray(a)) return this.normalizeArray(out);
        return out;
      },

      _anyArray: function(o,value,fn){
           for(var i=0,len = o.length; i < len; i++){
            if(value === o[i]){
             if(fn) fn.call(this,o[i],i,o);
             return true;
             break;
           }
         }
         return false;
      },

      _anyObject: function(o,value,fn){
         for(var i in o){
          if(value === i){
           if(fn) fn.call(this,o[i],i,o);
           return true;
           break;
         }
       }
       return false;
      },

        //mainly works wth arrays only
        //flattens an array that contains multiple arrays into a single array
      flatten: function(arrays,result){
         var self = this,flat = result || [];
         this.forEach(arrays,function(a){

          if(self.isArray(a)){
           self.flatten(a,flat);
         }else{
           flat.push(a);
         }

       },null,self);

         return flat;
      },

      filter: function(obj,fn,completer,scope,conf){
         if(!obj || !fn) return false;
         var result=[],scope = scope || this;
         conf = conf || {};
         this.forEach(obj,function filter_mover(e,i,b){
           if(fn.call(scope,e,i,b)){
              if(!!conf['allow'] || e) result.push(e);
              //result.push(e);
          }
        },completer,scope,conf);
         return result;
      },

      //returns an array of occurences index of a particular value
      occurs: function(o,value){
         var occurence = [];
         this.forEach(o,function occurmover(e,i,b){
           if(e === value){ occurence.push(i); }
         },null,this);
         return occurence;
      },

      //performs an operation on every item that has a particular value in the object
      every: function(o,value,fn){
         this.forEach(o,function everymover(e,i,b){
           if(e === value){
            if(fn) fn.call(this,e,i,b);
          }
        },null,this);
         return;
      },

      delay: function(fn,duration){
         var args = this.makeSplice(arguments,2);
         return setTimeout(function(){
          fn.apply(this,args)
        },duration);
      },

      nextTick: function(fn){
          if(typeof process !== 'undefined' || !(process.nextTick)){
            return process.nextTick(fn);
          }
          return setTimeout(fn,0);
      },

      rshift: function(o){
            if(!this.isArray(o) || o.length <= 0) return;
            var ind = o.length - 1;
            var data =  o[ind];
            delete o[ind];
            o.length = ind;
            return data;
      },

      shift: function(o){
            if(!this.isArray(o) || o.length <= 0) return;
            var data =  o[0];
            delete o[0];
            this.normalizeArray(o);
            return data;
      },

      unshift: function(o,item){
            if(!this.isArray(o)) return;
            var temp,i = o.length;
            for(; i > 0; i--){
              o[i] = o[i-1];
            }

            o[0] = item;
            return o;
      },

      explode: function(){
             if(arguments.length == 1){
              if(this.isArray(arguments[0])) this._explodeArray(arguments[0]);
              if(this.matchType(arguments[0],"object")) this._explodeObject(arguments[0]);
            }
            if(arguments.length > 1){
              this.forEach(arguments,function(e,i,b){
               if(this.isArray(e)) this._explodeArray(e);
               if(this.matchType(e,"object")) this._explodeObject(e);
             },null,this);
            }
      },

      _explodeArray: function(o,force){
           if(this.isArray(o)){
            this.forEach(o,function exlodearray_each(e,i,b){
             delete b[i];
           },null,this);
            o.length = 0;
          };

          return o;
      },

      _explodeObject: function(o){
         if(this.matchType(o,"object")){
          this.forEach(o, function exploder_each(e,i,b){
           delete b[i];
         },null,this);
          if(o.length) o.length = 0;
        }

        return o;
      },

      is: function(prop,value){
         return (prop === value) ? true : false;
      },


      eString : function(string){
        var a = (string),p = a.constructor.prototype;
        p.end = function(value){
          var k = this.length - 1;
          if(value){ this[k] = value; return this; }
          return this[k];
        };
        p.start = function(value){
          var k = 0;
          if(value){ this[k] = value; return this; }
          return this[0];
        };

        return a;
      },


      //you can deep clone a object into another object that doesnt have any
      //refernce to any of the values of the old one,incase u dont want to
      //initialize a vairable for the to simple pass a {} or [] to the to arguments
      //it will be returned once finished eg var b = clone(a,{}); or b=clone(a,[]);
      clone: function(from,tto,noDeep){
            if(!this.isArray(from) && !this.isObject(from)) return from;
            var to = null;
            var self = this;
            if(tto) to = tto;
            else if(this.isArray(from)) to = [];
            else if(this.isObject(from)) to = {};

            this.forEach(from,function cloner(e,i,b){
              if(!noDeep){
               if(self.isArray(e)){
                 to[i] = self.clone(e,[]);
                 return;
               }
               if(this.isObject(e)){
                 to[i] = self.clone(e,{});
                 return;
               }
              }

             to[i] = e;
           },null,this);
          return to;
      },

      isType: function(o){
            return ({}).toString.call(o).match(/\s([\w]+)/)[1].toLowerCase();
      },

      matchType: function(obj,type){
            return ({}).toString.call(obj).match(/\s([\w]+)/)[1].toLowerCase() === type.toLowerCase();
      },

      isRegExp: function(expr){
           return this.matchType(expr,"regexp");
      },

      isString: function(o){
         return this.matchType(o,"string");
      },

      isObject: function(o){
         return this.matchType(o,"object");
      },

      isArray: function(o){
         return this.matchType(o,"array");
       },

      isDate: function(o){
        return this.matchType(o,"date");
      },

      isFunction: function(o){
         return (this.matchType(o,"function") && (typeof o == "function"));
       },

      isPrimitive: function(o){
         if(!this.isObject(o) && !this.isFunction(o) && !this.isArray(o) && !this.isUndefined(o) && !this.isNull(o)) return true;
         return false;
      },

      isUndefined: function(o){
         return (o === undefined && (typeof o === 'undefined') && this.matchType(o,'undefined'));
      },

      isNull: function(o){
         return (o === null && this.matchType(o,'null'));
      },

      isValid: function(o){
        return (!this.isNull(o) && !this.isUndefined(o) && !this.isEmpty(o));
      },

      isNumber: function(o){
         return this.matchType(o,"number") && o !== Infinity;
      },

      isInfinity: function(o){
         return this.matchType(o,"number") && o === Infinity;
       },

      isArgument: function(o){
         return this.matchType(o,"arguments");
      },

      isFalse: function(o){
        return (o === false);
      },

      isTrue: function(o){
        return (o === true);
      },

      isBoolean: function(o){
        return this.matchType(o,"boolean");
      },

      has: function(obj,elem,value,fn){
       var self = this,state = false;

       this.any(obj,elem,function __has(e,i){
        if(value){
         if(e === value){
          state = true;
          if(fn && self.isFunction(fn)) fn.call(e,i,obj);
          return;
        }
        state = false;
        return;
       }

       state = true;
       if(fn && self.isFunction(fn)) fn.call(e,i,obj);
      });

       return state;
      },

      hasOwn: function(obj,elem,value){

         if(Object.hasOwnProperty){
                if(!value) return Object.hasOwnProperty.call(obj,elem);
                else return (Object.hasOwnProperty.call(obj,elem) && obj[elem] === value);
          }

          var keys,constroKeys,protoKeys,state = false,fn = function own(e,i){
            if(value){
             state = (e === value) ? true : false;
             return;
           }
           state = true;
         };

         if(!this.isFunction(obj)){
            /* when dealing pure instance objects(already instantiated
             * functions when the new keyword was used,all object literals
             * we only will be checking the object itself since its points to
             * its prototype against its constructors.prototype
             * constroKeys = this.keys(obj.constructor);
             */

             keys = this.keys(obj);
            //ensures we are not dealing with same object re-referening,if
            //so,switch to constructor.constructor call to get real parent
            protoKeys = this.keys(
             ((obj === obj.constructor.prototype) ? obj.constructor.constructor.prototype : obj.constructor.prototype)
             );

            if(this.any(keys,elem,(value ? fn : null)) && !this.any(protoKeys,elem,(value ? fn : null)))
              return state;
          }

         /* when dealing with functions we are only going to be checking the
         * object itself vs the objects.constructor ,where the
         * objects.constructor points to its parent if there was any
         */
         //protoKeys = this.keys(obj.prototype);
         keys = this.keys(obj);
         constroKeys = this.keys(obj.constructor);

         if(this.any(keys,elem,(value ? fn : null)) && !this.any(constroKeys,elem,(value ? fn : null)))
           return state;
      },

      proxy: function(fn,scope){
                   scope = scope || this;
                   return function(){
                    return fn.apply(scope,arguments);
                  };
      },

      //allows you to do mass assignment into an array or array-like object
      //({}),the first argument is the object to insert into and the rest are
      //the values to be inserted
      pusher: function(){
           var slice = [].splice.call(arguments,0),
           focus = slice[0],rem  = slice.splice(1,slice.length);

           this.forEach(rem,function pushing(e,i,b){
            _pusher.call(focus,e);
          });
           return;
      },

      keys: function(o){
        var keys = [];
        for(var i in o){
           keys.push(i);
        }
        return keys;
      },

      values: function(o){
        if(this.isArray(o) || this.isString(o))
          return Array.prototype.slice.call(o,0,o.length);
        var vals = [];
        for(var i in o){
           vals.push(o[i]);
        }
        return vals;
      },

        //normalizes an array,ensures theres no undefined or empty spaces between arrays
      normalizeArray: function(a){
              if(!a || !this.isArray(a)) return;

              var i = 0,start = 0,len = a.length;

              for(;i < len; i++){
               if(!this.isUndefined(a[i]) && !this.isNull(a[i]) && !(this.isEmpty(a[i]))){
                a[start]=a[i];
                start += 1;
              }
            }

            a.length = start;
            return a;
      },

      ns : function(space,fn,scope){
         var obj = scope || {},
            space = space.split('.'),
            len = space.length,
            pos = len - 1,
            index = 0,
            current = obj;

         this.forEach(space,function(e,i){
             if(!current[e]) current[e] = {};
             current[e].parent = current;
             current = current[e];
             if(i === pos){
              current.parent[e] = fn;
             }
         },null,this);

         // obj = obj[space[0]];
         delete obj.parent;
         return obj;
      },

      reduce: function(obj,fn,scope){
        var final = 0;
        this.forEach(obj,function(e,i,o){
          final = fn.call(scope,e,i,o,final)
        },null,scope);

        return final;
      },

      joinEqualArrays: function(arr1,arr2){
          if(arr1.length !== arr2.length) return false;
          var f1 = arr1.join(''), f2 = arr2.join('');
          if(f1 === f2) return true;
          return false;
      },

      sumEqualArrays: function(arr1,arr2){
          if(arr1.length !== arr2.length) return false;
          var math = function(e,i,o,prev){
            return (e + prev);
          },f1,f2;

          f1 = this.reduce(arr1,math); f2 = this.reduce(arr2,math);
          if(f1 === f2) return true;
          return false;
      },

      matchObjects: function(a,b){
        if(JSON.stringify(a) === JSON.stringify(b)) return true;
        return false;
      },

      objectify: function(obj,split,kvseperator){
        var self = this,u = {},split = obj.split(split);
        this.forEach(split,function(e,i,o){
            if(self.isArray(e)){
              u[i] = self.objectify(e.join(split),split,kvseperator);
              return;
            }
            if(self.isObject(e)) return u[i] = e;

            var point = e.split(kvseperator);
            u[point[0]] = point[1];
        });
        return u;
      },


  };

  AppStack.Util.String = AppStack.Util.makeString;
  AppStack.Util.bind = AppStack.Util.proxy;
  AppStack.Util.each = AppStack.Util.iterator;

  // AppStack.Callbacks = (function(SU){
  //
  //          var flagsCache = {},
  //             su = SU,
  //             makeFlags = function(flags){
  //                if(!flags || su.isEmpty(flags)) return;
  //                if(flagsCache[flags]) return flagsCache[flags];
  //
  //                var object = flagsCache[flags] = {};
  //                su.forEach(flags.split(/\s+/),function(e){
  //                      object[e] = true;
  //                });
  //
  //                return object;
  //             },
  //             callbackTemplate = function(fn,context,subscriber){
  //                return {
  //                   fn:fn,
  //                   context: context || null,
  //                   subscriber: subscriber || null
  //                }
  //             },
  //             occursObjArray = function(arr,elem,value,fn){
  //                var oc = [];
  //                su.forEach(arr,function(e,i,b){
  //                   if(e){
  //                      if((elem in e) && (e[elem] === value)){
  //                        oc.push(i);
  //                        if(fn && su.isFunction(fn)) fn.call(null,e,i,arr);
  //                      }
  //                   }
  //                },null,this);
  //
  //                return oc;
  //
  //             },
  //            callback = function(fl){
  //                 var  list = [],
  //                      fired = false,
  //                      firing = false,
  //                      fired = false,
  //                      fireIndex = 0,
  //                      fireStart = 0,
  //                      fireLength = 0,
  //                      flags = makeFlags(fl) || {},
  //
  //                      _fixList = function(){
  //                         if(!firing){
  //                            su.normalizeArray(list);
  //                         }
  //                      },
  //                      _add = function(args){
  //                         su.forEach(args,function(e,i){
  //                            if(su.isArray(e)) _add(e);
  //                            if(su.isObject(e)){
  //                               if(!e.fn || (e.fn && !su.isFunction(e.fn))){ return;}
  //                               if(!su.isNull(e.context) && !su.isUndefined(e.context) && !su.isObject(e.context)){ return; }
  //                               if(flags.unique && instance.has('fn',e.fn)){ return; }
  //                               list.push(e);
  //                            }
  //                         });
  //                      },
  //
  //                      _fire = function(context,args){
  //                         firing = true;
  //                         fired = true;
  //                         fireIndex = fireStart || 0;
  //                         for(;fireIndex < fireLength; fireIndex++){
  //                            if(!su.isUndefined(list[fireIndex]) && !su.isNull(list[fireIndex])){
  //                               var e = list[fireIndex];
  //                               if(!e || !e.fn) return;
  //                               if(flags.forceContext){
  //                                  e.fn.apply(context,args);
  //                               }else{
  //                                  e.fn.apply((e.context ? e.context : context),args);
  //                               }
  //                               if(flags.fireRemove) delete list[fireIndex];
  //                            }
  //                         }
  //                         firing = false;
  //
  //                         // if(list){
  //                         //    if(flags.once && fired){
  //                         //       instance.disable();
  //                         //    }
  //                         // }else{
  //                         //    list = [];
  //                         // }
  //
  //                         return;
  //                      },
  //
  //                      instance =  {
  //                         size: function(){ return list ? list.length : -1; },
  //
  //                         add: function(){
  //                            if(list){
  //                               if(arguments.length === 1){
  //                                  if(su.isArray(arguments[0])) _add(arguments[0]);
  //                                  if(su.isObject(arguments[0])) _add([arguments[0]]);
  //                                  if(su.isFunction(arguments[0])){
  //                                     _add([
  //                                           callbackTemplate(arguments[0],arguments[1],arguments[2])
  //                                     ]);
  //                                  }
  //                               }else{
  //                                  _add([
  //                                        callbackTemplate(arguments[0],arguments[1],arguments[2])
  //                                  ]);
  //                               }
  //
  //                               fireLength = list.length;
  //                            };
  //                            return this;
  //                         },
  //
  //                         fireWith: function(context,args){
  //                            if(this.fired() && flags.once) return;
  //
  //                            if(!firing ){
  //                               _fire(context,args);
  //                            }
  //                            return this;
  //                         },
  //
  //                         fire: function(){
  //                            var args = su.arranize(arguments);
  //                            (function(_){
  //                               _.fireWith(_,args);
  //                            })(instance);
  //                            return this;
  //                         },
  //
  //                         remove: function(fn,context,subscriber){
  //                            if(list){
  //                               if(fn){
  //                                  this.occurs('fn',fn,function(e,i,b){
  //                                     if(context && subscriber && (e.subscriber === subscriber) && (e.context === context)){
  //                                        delete b[i];
  //                                        su.normalizeArray(b);
  //                                        return;
  //                                     }
  //                                     if(context && (e.context === context)){
  //                                        delete b[i];
  //                                        su.normalizeArray(b);
  //                                        return;
  //                                     }
  //                                     if(subscriber && (e.subscriber === subscriber)){
  //                                        delete b[i];
  //                                        su.normalizeArray(b);
  //                                        return;
  //                                     }
  //
  //                                     delete b[i];
  //                                     su.normalizeArray(b);
  //                                     return;
  //                                  });
  //                                  return this;
  //                               }
  //
  //                               if(context){
  //                                  this.occurs('context',context,function(e,i,b){
  //                                     if(subscriber && (e.subscriber === subscriber)){
  //                                        delete b[i];
  //                                        su.normalizeArray(b);
  //                                        return;
  //                                     }
  //
  //                                     delete b[i];
  //                                     su.normalizeArray(b);
  //                                     return;
  //
  //                                  });
  //                                  return this;
  //                               }
  //
  //                               if(subscriber){
  //                                  this.occurs('subscriber',subscriber,function(e,i,b){
  //                                     if(context && (e.context === context)){
  //                                        delete b[i];
  //                                        su.normalizeArray(b);
  //                                        return;
  //                                     }
  //
  //                                     delete b[i];
  //                                     su.normalizeArray(b);
  //                                     return;
  //                                  });
  //                                  return this;
  //                               }
  //                            }
  //
  //                            return this;
  //                         },
  //
  //                         flush: function(){
  //                           //  su.explode(list);
  //                            list.length = 0;
  //                            return this;
  //                         },
  //
  //                         disable: function(){
  //                            list = undefined;
  //                            return this;
  //                         },
  //
  //                         disabled: function(){
  //                            return !list;
  //                         },
  //
  //                         has: function(elem,value){
  //                           var i=0,len = list.length;
  //                           for(; i < len; i++){
  //                               if(su.has(list[i],elem,value)){
  //                                     return true;
  //                                     break;
  //                               }
  //                           }
  //                               return false;
  //                         },
  //
  //                         occurs: function(elem,value,fn){
  //                            return occursObjArray.call(this,list,elem,value,fn);
  //                         },
  //
  //                         fired: function(){
  //                            return !!fired;
  //                         }
  //
  //                      };
  //
  //                 return instance;
  //          };
  //
  //          return {
  //            create : callback,
  //            name:"AppStack.Callbacks",
  //            description: "Callback API with the pub-sub pattern implementation(the heart of Promise and Events)",
  //            licenses:[ { type: "mit", url: "http://mths.be/mit" }],
  //            author: "Alexander Adeniyi Ewetumo",
  //            version: "0.3.0",
  //          };
  //
  // })(AppStack.Util);

  AppStack.Env =  {
           name: "AppStack.Env",
           version: "1.0.0",
           description: "simple environment detection script",
           licenses:[ { type: "mit", url: "http://mths.be/mit" }],
           author: "Alexander Adeniyin Ewetumo",
           detect: (function(){
              var envs = {
                 unop: function(){ return "unknown" },
                 node: function(){ return "node" },
                 headless: function(){ return "headless" },
                 browser: function(){ return "browser" },
                 rhino: function(){ return "rhino" },
                 xpcom: function(){ return "XPCOMCore" },
              };

              //will check if we are in a browser,node or headless based system
              if(typeof XPCOMCore !== "undefined"){
                 return envs.xpcom;
              }
              else if(typeof window === "undefined" && typeof java !== 'undefined'){
                 return envs.rhino;
              }
              else if(typeof window !== "undefined" && typeof window.document !== 'undefined'){
                 return envs.browser;
              }
              else if(typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
                 return envs.node;
              }else{
                 return detect = envs.unop;
              }
           })()

  };

  // AppStack.Events = (function(AppStack){
  //
  //       var util = AppStack.Util;
  //       return function(){
  //
  //           var e = {
  //                name: "AppStack.Events",
  //                version: "1.0.0",
  //                description: "Publication-Subscription implementation using Callback API",
  //                licenses:[ { type: "mit", url: "http://mths.be/mit" }],
  //                author: "Alexander Adeniyin Ewetumo",
  //
  //               events:{},
  //
  //               get: function(es){
  //                 return this.events[es];
  //               },
  //
  //               sizeOf: function(es){
  //                 if(this.events[es]) return this.events[es].size();
  //                 return -1;
  //               },
  //
  //               set: function(es,flag){
  //                   if(!this.events) this.events = {};
  //                   if(!this.events[es]){
  //                     var flags = (flag && typeof flag === 'string') ? flag.concat(' unique') : "unique";
  //                     return (this.events[es] = AppStack.Callbacks.create(flag));
  //                   }
  //                   return this.events[es];
  //               },
  //
  //               unset: function(es){
  //                   if(!this.events) this.events = {};
  //                   if(!this.events[es]) return;
  //                   var e = this.events[es];
  //                   if(e) e.flush() && e.disable();
  //                   delete this.events[es];
  //                   return true;
  //               },
  //
  //               once: function(es,callback,context,subscriber){
  //                  if(!this.events) this.events = {};
  //                   if(!es || !callback){ return; }
  //
  //                   var e = this.set(es,'fireRemove');
  //                   e.add(callback,context,subscriber);
  //
  //                   return;
  //               },
  //
  //               on:function(es,callback,context,subscriber){
  //                  if(!this.events) this.events = {};
  //                   if(!es || !callback){ return; }
  //
  //                   var e = this.set(es);
  //                   e.add(callback,context,subscriber);
  //
  //                   return;
  //                },
  //
  //               off: function(es,callback,context,subscriber){
  //                   if(arguments.length  === 0){
  //
  //                      return this;
  //                   };
  //                   var self = this;
  //                   if(es === 'all'){
  //                     if(this.events == null) return;
  //                     util.each(this.events,function(e,i,o){
  //                       self.unset(i);
  //                     });
  //                     return;
  //                   }
  //
  //                   var e = this.events[es];
  //                   if(!e) return;
  //
  //                   if(!callback && !context && !subscriber){ e.flush(); return this; }
  //
  //                   e.remove(callback,context,subscriber);
  //                   return this;
  //
  //                },
  //
  //               emit: function(event){
  //                  if(!event || !this.events){ return this; }
  //
  //                  var args = ([].splice.call(arguments,1)),
  //                      e = this.events[event];
  //
  //                  if(!e) return this;
  //
  //                   e.fire.apply(null,args);
  //
  //                  return this;
  //               },
  //
  //               flush: function(event){
  //                  if(!event || !this.events){ return this; }
  //
  //                  var e = this.events[event];
  //                  if(e) e.flush();
  //                  return this;
  //               },
  //
  //               flushAll: function(){
  //                 util.each(this.events,function(e){ e.flush(); });
  //                 return this;
  //               }
  //
  //           };
  //
  //           //compatibility sake
  //           e.removeListener = e.off;
  //           e.removeAllListeners = function(){ return this.off('all'); };
  //
  //           return e;
  //       };
  //
  // })(AppStack);

  AppStack.HashHelpers = function Helpers(scope){

    var util =  AppStack.Util,
    validatorDefault = function(){ return true; },
    HashMaps = {
      target: scope,
      clone: function(){
        return util.clone(this.target);
      },
      cascade: function(fn){
        util.each(this.target,function(e,i,o){
           return fn(e,i,o);
        });
      },
      fetch: function(key){
        return HashMaps.target[key];
      },
      exists: function(key,value){
        if(!(key in HashMaps.target)) return false;
        if(!util.isUndefined(value) && !util.isNull(value)) return (HashMaps.target[key] === value)
        return true;
      },
      hasVal: function(fn){
        for(var m in HashMaps.target){
          if(fn(HashMaps.target[m])){
            return m;
            break;
          }
        }
        return false;
      },
      remove: function(key,value){
        if(HashMaps.exists.call(HashMaps.target,key,value)) return (delete HashMaps.target[key]);
      },
      add: function(key,value,validator,force){
        if(!validator) validator = validatorDefault;
        if(HashMaps.exists.call(HashMaps.target,key) || !validator(value)) return;
        HashMaps.target[key] = value;
        return true;
      },
      modify: function(key,value,validator){
        if(!validator) validator = validatorDefault;
        if(!validator(value)) return ;
        if(!HashMaps.exists.call(HashMaps.target,key)) return HashMaps.add(key,value,validator);
        HashMaps.target[key] = value;
        return true;
      },
      get: function(key){
        return this.fetch(key);
      },
      KV: function(){
        return [util.keys(this.target), util.values(this.target)];
      }
    };

    return HashMaps;
  };

  AppStack.MapDecorator = AppStack.HashHelpers;


  AppStack.ASColors = (function(AppStack){

    var env,
    tool = AppStack.Util;

    if(typeof window !== 'undefined' && typeof window.document !== 'undefined') env = 'browser';
    else env = 'node';

    //----------------------the code within this region belongs to the copyright listed below
      /*
      colors.js

      Copyright (c) 2010

      Marak Squires
      Alexis Sellier (cloudhead)

      Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to deal
      in the Software without restriction, including without limitation the rights
      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:

      The above copyright notice and this permission notice shall be included in
      all copies or substantial portions of the Software.

      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
      THE SOFTWARE.

      */
    var Styles = {
      web:{
          'bold'      : ['<b>',  '</b>'],
          'italic'    : ['<i>',  '</i>'],
          'underline' : ['<u>',  '</u>'],
          'inverse'   : ['<span class="inverse">',  '</span>'],
          //grayscale
          'white'     : ['<span class="white">',   '</span>'],
          'grey'      : ['<span class="grey">',    '</span>'],
          'black'     : ['<span class="black">',   '</span>'],
          //colors
          'blue'      : ['<span class="blue" >',    '</span>'],
          'cyan'      : ['<span class="cyan" >',    '</span>'],
          'green'     : ['<span class="green">',   '</span>'],
          'magenta'   : ['<span class="magenta">', '</span>'],
          'red'       : ['<span class="red">',     '</span>'],
          'yellow'    : ['<span class="yellow">',  '</span>']
      },
      terminal:{
        'bold'      : ['\033[1m',  '\033[22m'],
          'italic'    : ['\033[3m',  '\033[23m'],
          'underline' : ['\033[4m',  '\033[24m'],
          'inverse'   : ['\033[7m',  '\033[27m'],
          //grayscale
          'white'     : ['\033[37m', '\033[39m'],
          'grey'      : ['\033[90m', '\033[39m'],
          'black'     : ['\033[30m', '\033[39m'],
          //colors
          'blue'      : ['\033[34m', '\033[39m'],
          'cyan'      : ['\033[36m', '\033[39m'],
          'green'     : ['\033[32m', '\033[39m'],
          'magenta'   : ['\033[35m', '\033[39m'],
          'red'       : ['\033[31m', '\033[39m'],
          'yellow'    : ['\033[33m', '\033[39m'],


      }

    },

    sets = ['bold', 'underline', 'italic', 'inverse', 'grey', 'black', 'yellow', 'red', 'green', 'blue', 'white', 'cyan', 'magenta'],


    //----------------------end of the copyrighted code-----------------------------------

    css = ".white{ color: white; } .black{color: black; } .grey{color: grey; } "
    + ".red{color: red; } .blue{color: blue; } .yellow{color: yellow; } .inverse{ background-color:black;color:white;}"
    + ".green{color: green; } .magenta{color: magenta; } .cyan{color: cyan; } ";

    //basicly we pollute global String prototype to gain callabillity without using method assignments
    return (function(){

      var styles, sproto = String.prototype;
      if(sproto['underline'] && sproto['white'] && sproto['green']) return;


      if(env === 'browser'){
        styles = Styles.web;
        if(typeof document !== 'undefined' && typeof document.head !== 'undefined'){
          var style = "<style>"+css+"</style>",clean = document.head.innerHTML;
          document.head.innerHTML = style+"\n"+clean;
        }
      }
      if(env === 'node')  styles = Styles.terminal;


      tool.forEach(sets,function(e,i,o){
        var item = styles[e];
        tool.createProperty(sproto,e,{
          get: function(){
            return item[0] + this.toString() + item[1];
          },
          set: function(){}
        });

      });

    });


  })(AppStack);

  AppStack.Promise = (function(){

       var Arr = Array.prototype,
        Obj = Object.prototype,
        util = AppStack.Util,
        typeOf = function(o,type){
          var res = ({}).toString.call(o).replace(/\[object /,'').replace(/\]$/,'').toLowerCase();
          if(type) return (res === type);
          return res;
        },
        Splice = function(arg,b,e){
          return Arr.splice.call(arg,b || 0,e || arg.length);
        },
        getKeys = function(o){
          var keys = [];
          for(var i in o){ keys.push(i); }
          return keys;
        },
        eachSync = function(obj,iterator,complete,scope,breaker){
                if(!iterator || typeof iterator !== 'function') return false;
                if(typeof complete !== 'function') complete = function(){};


                var step = 0, keys = getKeys(obj),fuse;

                // if(typeof obj === 'string') obj = this.values(obj);

                if(!keys.length) return false;

                fuse = function(){
                  var key = keys[step];
                  var item = obj[key];

                  (function(z,a,b,c){
                    if(breaker && (breaker.call(z,a,b,c))){ /*complete.call(z);*/ return; }
                    iterator.call(z,a,b,c,function completer(err){
                        if(err){
                          complete.call(z,err);
                          complete = function(){};
                        }else{
                          step += 1;
                          if(step === keys.length) return complete.call(z);
                          else return fuse();
                        }
                    });
                 }((scope || this),item,key,obj));
                };

                fuse();
          },
        Promise = (function(){

          var generator = function(fn){

            var fire = function(arr,args,ctx){
              return eachSync(arr,function(e,i,o,c){
                if(e && typeOf(e,'function'))
                  e.apply(ctx,(typeOf(args,'array') ? args : [args]));
                c(false);
              });
            },
            proxy = function(fn,scope){
              return function(){
                var args = Arr.splice.call(arguments,0,arguments.length);
                return fn.apply(scope,args);
              };
            },
            p = {
              cfg: {
                resolved: false,
                rejected: false,
              },
              state: util.bind(function(){
                if(this.cfg.resolved && !this.cfg.rejected) return "resolved";
                if(!this.cfg.resolved && this.cfg.rejected) return "rejected";
                if(!this.cfg.resolved && !this.cfg.rejected) return "pending";
              },p),
              resLists:{ done: [], fail: [], notify: [] },
              lists:{ done: [], fail: [], notify: [] }
            };

            p.destroy = function(){
               util.explode(resLists.done);
               util.explode(resLists.fail);
               util.explode(resLists.notify);
               util.explode(lists.done);
               util.explode(lists.fail);
               util.explode(lists.notify);
            };

            p.done = util.bind(function(fn){
              if(typeof fn !== 'function') return this;
              var args = this.resLists.done;
              if(this.cfg.resolved && !this.cfg.rejected){ fn.apply(args[1],args[0]); return this; };
              if(this.lists.done.indexOf(fn) !== -1) return;
              this.lists.done.push(fn);
              return this.promise();
            },p);

            p.fail = util.bind(function(fn){
              if(typeof fn !== 'function') return this;
              var args = this.resLists.fail;
              if(!this.cfg.resolved && this.cfg.rejected){ fn.apply(args[1],args[0]); return this; };
              if(this.lists.fail.indexOf(fn) !== -1) return;
              this.lists.fail.push(fn);
              return this.promise();
            },p);

            p.progress = util.bind(function(fn){
              if(typeof fn !== 'function') return this;
              var args = this.resLists.notify;
              if(this.cfg.resolved || this.cfg.rejected){ fn.apply(args[1],args[0]); return this; };
              if(this.lists.notify.indexOf(fn) !== -1) return;
              this.lists.notify.push(fn);
              return this.promise();
            },p);

            p.then = util.bind(function(done,fail,progressfn){
              var self = this;
              var defer = generator();


              if(!!done){
                  self.done(function(){
                    var args = Arr.splice.call(arguments,0,arguments.length);
                    var ret = done.apply({},args);

                    if(!ret) return self.done(function(){
                      var args = Arr.splice.call(arguments,0,arguments.length);
                      defer.resolveWith(args,defer);
                    });

                    if(typeof ret['isPromise'] !== 'undefined' && ret.isPromise()){
                      ret.done(function(){
                        var args = Arr.splice.call(arguments,0,arguments.length);
                        defer.resolveWith(args,defer);
                      });
                    }else defer.resolve(ret);
                });
              }

              if(!!fail){
                self.fail(function(n){
                    var args = Arr.splice.call(arguments,0,arguments.length);
                    var ret = fail.apply({},args);

                    if(!ret) return self.fail(function(){
                      var args = Arr.splice.call(arguments,0,arguments.length);
                      defer.rejectWith(args,defer);
                    });

                    if(typeof ret['isPromise'] !== 'undefined' && ret.isPromise()){
                      ret.fail(function(){
                        var args = Arr.splice.call(arguments,0,arguments.length);
                        defer.rejectWith(args,defer);
                      });

                    }else defer.reject(ret);
                });
              }

             if(!!progressfn){
               self.progress(function(){

                    var args = Arr.splice.call(arguments,0,arguments.length);
                    var ret = progressfn.apply({},args);



                    if(!ret) return self.progress(function(){
                      var args = Arr.splice.call(arguments,0,arguments.length);
                      defer.notifyWith(args,defer);
                    });

                    if(typeof ret['isPromise'] !== 'undefined' && ret.isPromise()){
                      ret.progress(function(){
                        var args = Arr.splice.call(arguments,0,arguments.length);
                        defer.notifyWith(args,defer);
                      });
                    }else defer.notify(ret);
               });
             }

              return defer;
            },p);

            p.resolveWith = util.bind(function(args,ctx){
              if(this.cfg.resolved || this.cfg.rejected) return;
              this.cfg.rejected = false;
              this.cfg.resolved = true;
              this.resLists.done = [args,ctx];
              this.resLists.notify = [args,ctx];
              fire(this.lists.done,args,ctx);
              fire(this.lists.notify,args,ctx);
              return this;
            },p);

            p.rejectWith = util.bind(function(args,ctx){
              if(this.cfg.resolved || this.cfg.rejected) return;
              this.cfg.rejected = true;
              this.cfg.resolved = false;
              this.resLists.fail = [args,ctx];
              this.resLists.notify = [args,ctx];
              fire(this.lists.fail,args,ctx);
              fire(this.lists.notify,args,ctx);
              return this;
            },p);

            p.notifyWith = util.bind(function(args,ctx){
              if(this.cfg.resolved || this.cfg.rejected) return;
              // this.cfg = "resolved",
              this.resLists.notify = [args,ctx];
              fire(this.lists.notify,args,ctx);
              return this;
            },p);

            p.resolve = util.bind(function(){
              var args = Arr.splice.call(arguments,0,arguments.length);
              this.resolveWith(args,this);
              return this;
            },p);

            p.reject = util.bind(function(){
              var args = Arr.splice.call(arguments,0,arguments.length);
              this.rejectWith(args,this);
              return this;
            },p);

            p.notify = util.bind(function(){
              var args = Arr.splice.call(arguments,0,arguments.length);
              this.notifyWith(args,this);
              return this;
            },p);

            p.promise = util.bind(function(){
              var shell = {},self = this;
              shell.fail = function(fn){
                  self.fail(fn);
                  return this;
              };
              shell.progress = function(fn){
                  self.progress(fn);
                  return this;
              };
              shell.done = function(fn){
                  self.done(fn);
                  return this;
              };

              shell.state = proxy(this.state,this);
              shell.then = proxy(this.then,this);
              shell.promise = function(){return this; }
              shell.isPromise = function(){ return true; }

              self.promise = function(){
                return shell;
              };

              return shell;
            },p);

            p.isPromise = function(){ return true; };

            if(fn && typeof fn === 'function'){
              try{
                fn(p);
              }catch(e){
                p.reject(e);
              };
              return p;
            }
            if(fn && typeof fn !== 'function' && fn !== null && fn !== false && fn !== 'undefined') return p.resolve(fn);
            if(typeof fn !== 'function' && fn === false) return p.reject(fn);

            return p;
          };

          return {
            name:"AppStack.Promise",
            description: "A Promise A spec compatible promise object",
            licenses:[ { type: "mit", url: "http://mths.be/mit" }],
            author: "Alexander Adeniyi Ewetumo",
            create: function(fn){
              return generator(fn);
            },
            when: function(){
              var args = Arr.splice.call(arguments,0,arguments.length),
              len = args.length,
              counter = 0,
              // set = [],
              argd = [],
              defer = generator();

              eachSync(args,function(e,i,o,c){
                // if(e && typeof e !== 'function') return c(false);
                var a = (e['isPromise'] && e.isPromise()) ? e : generator(e);
                a.then(function(){
                  counter += 1;
                  if(counter === len) defer.resolve(argd);
                },function(){
                  defer.reject(argd);
                },function(){
                  var res = Arr.splice.call(arguments,0,arguments.length);
                  argd.push(res.length == 1 ? res[0] : res);
                });

                // set.push(a);
                c(false);
              });

              return defer;
            },
          };
        })();

        return Promise;

  })();

  AppStack.Distributors = function(){
      var chain = {
        name:"AppStack.Distributors",
        description: "creates a callback stack call",
        licenses:[ { type: "mit", url: "http://mths.be/mit" }],
        author: "Alexander Adeniyi Ewetumo",
      },
      Empty = function(){},
      util = AppStack.Util;

      chain.callbacks = [];
      chain.doneCallbacks = [];
      chain._locked = false;

      chain.removeAll = function(){
        this.callbacks.length = 0;
      };

      chain.remove = function(fn){
        if(this.disabled()) return;
        var ind = this.callbacks.indexOf(fn);
        if((ind == -1) || this.locked() || this.disabled()) return;
        delete this.callbacks[ind];
      };

      chain.removeDone = function(fn){
        if(this.disabled()) return;
        var ind = this.doneCallbacks.indexOf(fn);
        if((ind == -1) || this.locked() || this.disabled()) return;
        delete this.doneCallbacks[ind];
      };

      chain.addDone = function(fn){
        if(this.doneCallbacks.indexOf(fn) != -1 || this.locked() || this.disabled()) return;
        this.doneCallbacks.push(fn);
      };

      chain.addDoneOnce = function(fn){
        if(this.doneCallbacks.indexOf(fn) != -1 || this.locked() || this.disabled()) return;
        var self = this;
        var fns = function FNS(){
          var args = util.toArray(arguments), ret = fn.apply(this,args);
          self.removeDone(FNS);
          return ret;
        };

        this.doneCallbacks.push(fns);
      };

      chain.add = function(fn){
        if(this.callbacks.indexOf(fn) != -1 || this.locked() || this.disabled()) return;
        this.callbacks.push(fn);
      };

      chain.addOnce = function(fn){
        if(this.callbacks.indexOf(fn) != -1 || this.locked() || this.disabled()) return;
        var self = this;
        fn.__once = true;
        this.callbacks.push(fn);
      };

      chain.distributeWith = function(context,args){
        if(this.disabled()) return;
        if(this.callbacks.length <= 0) return;
        var self = this;
        util.each(this.callbacks,function(e,i,o,fn){
            e.apply(context,args);
            if(e.__once) o[i] = Empty;
            return fn(null);
        },function(_,err){
          self.distributeDoneWith(context,args);
          // util.normalizeArray(this.callbacks);
        });
      };

      chain.distribute = function(){
        if(this.disabled()) return;
        var args = util.toArray(arguments);
        this.distributeWith(this,args);
      };

      chain.distributeDoneWith = function(context,args){
        if(this.disabled()) return;
        if(this.doneCallbacks.length <= 0) return;
        util.each(this.doneCallbacks,function(e,i,o,fn){
            e.apply(context,args);
            return fn(null);
        },function(_,err){
          util.normalizeArray(this.doneCallbacks);
        });
      };

      chain.distributeDone = function(){
        if(this.disabled()) return;
        var args = util.toArray(arguments);
        this.distributeDoneWith(this,args);
      };

      chain.lock = function(){
        this._locked = true;
      };

      chain.disable = function(){
        this.callbacks = null;
      };

      chain.disabled = function(){
        return this.callbacks === null;
      };

      chain.locked = function(){
        return this._locked === true;
      };

      chain.close = function(){
        util.explode(this.callbacks);
        this.disable();
      };

      chain.isEmpty = function(){
          return this.callbacks.length === 0;
      };

      chain.size = function(){
        return this.callbacks.length;
      };

      return chain;
  };

  AppStack.MiddlewareStack = function(){
    var util = AppStack.Util, ware = {
      name:"AppStack.Middleware",
      description: "creates a basic middle top-down continues next call function stack",
      licenses:[ { type: "mit", url: "http://mths.be/mit" }],
      author: "Alexander Adeniyi Ewetumo",
    };
    ware.middlewares = [];
    ware.argument = [];
    ware._locked = false;

    ware._nextCaller = function(index){
      return this.fireWith(this.argument[0],this.argument[1],index);
    };

    ware.add = function(fn,once){
      if(this.locked() || this.disabled()) return;

      var self = this,
          len = this.middlewares.length,
          next = null, fns = null,
          pipe = [];

      fns = function(){
        var args = util.toArray(arguments);
        var ind  = self.middlewares.indexOf(pipe);
        var ret  = fn.apply(this,args);
        if(once){
          if(ind === -1) return;
          delete self.middlewares[ind];
          util.normalizeArray(this.middlewares);
        }
        return ret;
      };

      next = function(){
        var inx = len + 1;
        return self._nextCaller(inx);
      };

      pipe.push(fns);
      pipe.push(next);

      this.middlewares.push(pipe);
    };

    ware.fireWith = function(context,args,start){
      if(this.disabled()) return;

      if(!!start && start > this.middlewares.length) return;

      var len = this.middlewares.length,
          i = start || 0,
          root = this.middlewares[i];

        var fn = root[0], next  = root[1];

        this.argument[0] = context;
        this.argument[1] = args;

        return fn.apply(context,util.flatten([args,next]));
    };

    ware.close = function(){
      util.explode(this.middlewares);
      this.disable();
    }

    ware.fire = function(){
      if(this.disabled()) return;
      var args = util.toArray(arguments);
      this.fireWith(this,args);
    };

    ware.lock = function(){
      this._locked = true;
    };

    ware.disable = function(){
      this.middlewares = null;
    };

    ware.disabled = function(){
      return this.middlewares === null;
    };

    ware.locked = function(){
      return this._locked === true;
    };

    ware.isEmpty = function(){
        return this.middlewares.length === 0;
    };

    return ware;
  };

  AppStack.MutatorArgs = function(args){
    this.args = AppStack.Util.toArray(AppStack.Util.isArgument(args) ? args : arguments);
  };

  AppStack.MutatorArgs.make = function(){
    return new AppStack.MutatorArgs(arguments);
  };

  AppStack.Mutator = function(fn){
    var util = AppStack.Util,
    mutator = {
      name:"AppStack.Mutator",
      description: "uses function stacks to create a top-down mutating tree where a return type can be mutated",
      licenses:[ { type: "mit", url: "http://mths.be/mit" }],
      author: "Alexander Adeniyi Ewetumo",
    };

    mutator._locked = false;
    mutator.mutators = [];
    mutator.history = [];
    mutator.disableMutation = false;
    mutator.done = AppStack.Distributors();

    var Empty = function(){};

    mutator.size = AppStack.Util.proxy(function(){ return this.mutators.length; },mutator);
    mutator.addDone = AppStack.Util.proxy(mutator.done.add,mutator.done);
    mutator.addDoneOnce = AppStack.Util.proxy(mutator.done.addOnce,mutator.done);
    mutator.removeDone = AppStack.Util.proxy(mutator.done.remove,mutator.done);

    mutator.removeAll = AppStack.Util.proxy(function(){
      this.removeListeners();
      this.removeAllDone();
    },mutator);

    mutator.removeListeners = AppStack.Util.proxy(function(){
      this.mutators.length = 0;
    },mutator);

    mutator.removeAllDone = AppStack.Util.proxy(function(){
      this.done.removeAll();
    },mutator);

    mutator.remove = AppStack.Util.proxy(function(fn){
      if(typeof fn != 'function') return;
      if(this.disabled()) return;
      var index = this.mutators.indexOf(fn);
      if(index !== -1){
        delete this.mutators[index];
        util.normalizeArray(this.mutators);
      }
    },mutator);

    mutator.add = AppStack.Util.proxy(function(fn){
      if(typeof fn != 'function') return;
      if(this.mutators.indexOf(fn) != -1 || this.locked() || this.disabled()) return;
      this.mutators.push(fn);
    },mutator);

    mutator.addOnce = AppStack.Util.proxy(function(fn){
      if(typeof fn != 'function') return;
      if(this.mutators.indexOf(fn) != -1 || this.locked() || this.disabled()) return;
      self = this;
      fn.__once = true;
      this.mutators.push(fn);
    },mutator);

    mutator.delegate = AppStack.Util.proxy(function(fn){
      if(this.disabled()) return;
      var self = this, count = 0,last = this.history[this.history.length - 1] || [];
      return fn.apply(null,(last instanceof AppStack.MutatorArgs ? last.args : last));
    },mutator);

    mutator.fireWith = AppStack.Util.proxy(function(context,argds){
      if(this.disabled()) return;

      var self = this, count = 0,len = this.mutators.length,next;
      this.history.length = 0;
      this.history.push(argds);

      next = function(i){
        // console.log(self.history.length,argds);
        var args = self.history[self.history.length - 1];
        // if(args && args.length <= 0) args = argds;
        if(self.mutators.length <= i){
          self.done.distributeWith(context,(args instanceof AppStack.MutatorArgs ? args.args : args));
          return;
        }
        var current = self.mutators[i];
        if(typeof current != 'function') return;
        var returned = current.apply(context,(args instanceof AppStack.MutatorArgs ? args.args : args));
        if(current.__once) self.mutators[i] = Empty;
        if(!!returned && !self.disableMutation){
          if(returned instanceof AppStack.MutatorArgs){
            self.history.push(returned);
          }else{
            self.history.push([returned]);
          }
        }
        next(i+1);
        count += 1;
      };

      next(0);
    },mutator);

    mutator.fire = AppStack.Util.proxy(function(){
      if(this.disabled()) return;
      var args = util.toArray(arguments);
      this.fireWith(this,args)
    },mutator);

    mutator.lock = AppStack.Util.proxy(function(){
      this._locked = true;
    },mutator);

    mutator.disable = AppStack.Util.proxy(function(){
      this.mutators = null;
    },mutator);

    mutator.disabled = AppStack.Util.proxy(function(){
      return this.mutators === null;
    },mutator);

    mutator.locked = AppStack.Util.proxy(function(){
      return this._locked === true;
    },mutator);

    mutator.isEmpty = AppStack.Util.proxy(function(){
      return this.mutators.length === 0;
    },mutator);

    mutator.close = AppStack.Util.proxy(function(){
      util.explode(this.mutators);
      this.disable();
    },mutator);

    mutator.add(fn);
    return mutator;
  };

  AppStack.MutatorPromise = function(fn){

    var util = AppStack.Util, mutator = {
      name:"AppStack.MutatorPromise",
      description: "uses promise to create a top-down mutating tree where a return type can be mutated",
      licenses:[ { type: "mit", url: "http://mths.be/mit" }],
      author: "Alexander Adeniyi Ewetumo",
    };

    mutator._locked = false;
    mutator.mutators = AppStack.Promise.create();
    mutator.history = [];

    mutator.add = function(fn){
      if(this.locked() || this.disabled()) return;
      var current = this.history[this.history.length - 1];

      this.history.push(current.then(function(){
        var args = util.toArray(arguments);
        return fn.apply(this,args);
      }));
    };

    mutator.fireWith = function(context,args){
      if(this.disabled()) return;
      var self = this,
        first = this.history[0],
        last = this.history[this.history.length - 1];

      first.resolveWith(args,context);

      last.done(function(){
        var args = util.toArray(arguments)
        self.mutators.resolveWith(args,this);
      });
    }

    mutator.close = function(){
      util.explode(this.history);
      this.mutators.destroy();
      util.explode(this.mutators);
      this.disable();
    };

    mutator.fire = function(){
      if(this.disabled()) return;
        var args = util.toArray(arguments);
        this.fireWith(this,args);
    };

    mutator.lock = function(){
      this._locked = true;
    };

    mutator.disable = function(){
      this.mutators = null;
    };

    mutator.disabled = function(){
      return this.mutators === null;
    };

    mutator.locked = function(){
      return this._locked === true;
    };


    mutator.history.push(AppStack.Promise.create());
    mutator.add(fn);
    return mutator;
  };

  AppStack.StateManager = (function(){

      var util = AppStack.Util, manager = {};

      manager.StateObject = function(focus,list){
         if(!focus) throw "Please supply an object to use as state center!";

            var bit = -1;
            var self = this;

            this.f = focus;
            this.states = AppStack.HashHelpers({});

            this.initialized = function(){
              return bit !== -1;
            };

            this.deactivate = function(){
               bit = 0;
            };

            this.activated = function(){
              return bit === 1;
            };

            this.activate = function(){
              bit = 1;
            };

            this.deactivate = function(){
              return bit === 0;
          };

            this.addState = function(name,fn){
              this.states.add(name,function(args){
                if(self.activated() && self.initialized()) return fn.apply(self.f,args);
                return null;
              })
            };

            if(list) util.each(list,function(e,i,o){
                if(!util.isFunction(e)) return;
                self.addState(i,e);
            });

            this.close = function(){
              util.explode(this.states.target);
              util.explode(this.states);
            };

      };

      manager.Manager = function(focus,actions){
        if(!focus) throw "Please supply an object to use as state center!";
        if(!util.isArray(actions)) throw "Please supply an array with the names of your states functions";

        var man = {
          focus: focus,
          actionLists: actions,
          sets: AppStack.HashHelpers({}),
          current: null,
          default: null,
        };

        man.setDefaultState = function(name){ this.default = name; this.resetStates(); };
        man.resetStates = function(){ this.current = this.sets.get(this.default); this.current.activate(); }
        man.addState = function(name,lists){
            var vals = util.keys(lists).join('');
            util.each(this.actionLists,function(e,i){
               if(!(e in lists)) throw "no method state is defined for "+i;
            });
            this.sets.add(name,new manager.StateObject(focus,lists));
        };
        manager.changeTarget = function(o){
          this.focus = o;
          util.each(this.sets.target,function(e,i){
              if('f' in e) e.f = o;
          });
        }

        man.switchState = function(name){
          if(!this.sets.exists(name)) return;
          var request = this.sets.get(name)
          if(!this.current || this.current === request) return;
          this.current.deactivate();
          this.current = request;
          this.current.activate();
        };

        man.managerReady = function(){
          return util.instanceof(this.current,manager.StateObject);
        };

        man.closeStates = function(){
          util.each(this.sets.target,function(e){
            e.close();
          });
        }

        util.each(actions,function(e,i,o){
            if(e in man) throw "Please dont try to override the standard function name '"+ev+"'";
            this[e] = function(){
              if(this.current == null) return;
              var args = util.toArray(arguments);
              return this.current.states.get(e)(args);
            }
        },man);


        return man;
      };

      return manager;
  })();

  AppStack.Injector = function(){
    return {
      fnCondition: function(){},
      focus:[],
      consumers: AppStack.Distributors(),
      on: function(fn){ this.consumers.add(fn); }
     };
  };

  AppStack.ArrayInjector = function(fn){
    var ij = AppStack.Injector();
    ij.inject = function(){
      this.consumers.distribute(AppStack.Util.clone(this.focus));
      AppStack.Util.explode(this.focus);
    };

    ij.push = function(n){
      var args = AppStack.Util.toArray(arguments);
      AppStack.Util.forEach(args,function(e,i,o){
          this.focus.push(e);
          this.fnCondition();
      },null,this);
    };

    return ij;
  };


  AppStack.PositionArrayInjector = function(){
    var ij = AppStack.ArrayInjector();
    ij._inject = ij.inject;

    ij.push = function(pos,n){
      this.focus[pos] = n;
      this.fnCondition();
      return this;
    };

    ij.inject = function(){
      this.focus = AppStack.Util.normalizeArray(this.focus);
      this._inject();
    };

    return ij;
  };


  AppStack.ArrayDecorator = function(array){
    if(!AppStack.Util.isArray(array)) return;
    var limit,target = array, util = AppStack.Util;
    return {
      limit:function(n){
        limit = n;
      },
      limited: function(){
        return AppStack.Util.isNumber(limit);
      },
      add: function(n){
        if(limit && AppStack.Util.isNumber(n) && target.length >= limit) return;
        AppStack.Util.each(AppStack.Util.toArray(arguments),function(e,i){
          if(target.indexOf(e) === -1) target.push(e);
        });
      },
      remove: function(n){
        var i;
        if((i = target.indexOf(n)) === -1) return;
        delete target[i];
      },
      cascade: function(fn,cfn){
        AppStack.Util.each(target,fn,this,null,cfn);
      },
      clone: function(){
        return AppStack.Util.clone(target);
      },
      explode: function(){
        AppStack.Util.explode(target);
      },
      unsafe: function(fn){
        return fn.call(null,target);
      },
      nth: function(n){
        if(n >= target.length) return;
        return target[n];
      },
      has: function(n){
        return target.indexOf(n);
      },
      empty: function(){
        return target.length === 0;
      },
      length: function(){
        return target.length;
      },
      KV: function(){
        return [util.keys(target),util.values(target)];
      },
      normalize: function(){
        AppStack.Util.normalizeArray(target);
      }
    }
  };

  //pollution of global Objects

  var numbPrototype = Number.prototype;
  var funcPrototype = Function.prototype;

  // if(funcPrototype && (typeof funcPrototype.bind === 'function')){
  //   funcPrototype.bind =
  // }

  if(typeof numbPrototype['times'] === null){
    numbPrototype.times = function(fn){
      var count = this.valueOf();
      for(i =0; i < count; i++) fn(i+1);
    }
  }

});

}).call(this,require('_process'))
},{"_process":6}],3:[function(require,module,exports){
module.exports = (function(core){

  var as = ds = core, util = as.Util;

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

    // ds.LazyList = function(max){
    //   var core = ds.DS();
    //   // var events = as.Events();
    //   // events.set('empty');
    //
    //   util.extends(core,{
    //     // events: events,
    //     max: max,
    //     root: null,
    //     tail: function(){},
    //     counter: as.Counter(),
    //     size: util.bind(function(){ return this.counter.count(); },core),
    //     isEmpty: util.bind(function(){
    //        return ((this.root && this.tail()) === null);
    //     },core),
    //     isFull: util.bind(function(){
    //       return (this.counter.count() >= this.max && this.max !== null);
    //     },core),
    //     iterator: util.bind(function(){
    //       return ds.LazyListIterator(this);
    //     },core),
    //     clear: util.bind(function(){
    //       if(this.root) this.root.reset();
    //     },core),
    //     add: util.bind(function(data){
    //       if(this.isFull()) return;
    //       if(this.isEmpty()){
    //         this.root = this.tail = ds.ListNode(data);
    //         this.tail = function(){ return this.root; };
    //         this.root.left = this.tail;
    //         this.tail.right = this.root;
    //         this.counter.up();
    //         return this.tail;
    //       }
    //
    //       var cur = this.tail;
    //       var left = cur.left;
    //       var right = cur.right;
    //
    //       this.tail = ds.ListNode(data);
    //       this.tail.right = this.root;
    //       this.tail.left = cur;
    //
    //       cur.right = this.tail;
    //
    //       this.root.left = this.tail;
    //
    //       this.counter.up();
    //       return this.tail;
    //     },core),
    //     append: util.bind(function(d){ return this.add(d); },core),
    //     prepend: util.bind(function(data){
    //       if(this.isFull()) return;
    //       if(this.isEmpty()){
    //         this.root = this.tail = ds.ListNode(data);
    //         this.root.left = this.tail;
    //         this.tail.right = this.root;
    //         this.counter.up();
    //         return this.root;
    //       }
    //       var cur = this.root;
    //       var left = cur.left;
    //       var  right = cur.right;
    //
    //       this.root = ds.ListNode(data);
    //
    //       this.root.left = this.tail;
    //       this.root.right = cur;
    //
    //       this.tail.right = this.root;
    //
    //       cur.left = this.root;
    //
    //       this.counter.up();
    //
    //       return this.root;
    //     },core),
    //     removeHead: util.bind(function(){
    //       if(this.isEmpty()){
    //         // this.events.emit('empty',this);
    //         return;
    //       }
    //
    //       var root = this.root;
    //       left = root.left;
    //       right = root.right;
    //
    //       if(root === this.tail){
    //         this.tail = this.root = null;
    //         this.counter.blow();
    //       }
    //       else{
    //         this.root = right;
    //         this.root.left = left;
    //         left.right = right;
    //         root.left = root.right = null;
    //       }
    //
    //       // this.events.emit('removeHead',root);
    //       this.counter.down();
    //       return root;
    //     },core),
    //     removeTail: util.bind(function(){
    //       if(this.isEmpty()){
    //         // this.events.emit('empty',this);
    //         return;
    //       }
    //
    //       var tail = this.tail;
    //       left = tail.left;
    //       right = tail.right;
    //
    //       if(tail === this.root){
    //         this.tail = this.root = null;
    //         this.counter.blow();
    //       }
    //       else{
    //         this.tail = left;
    //         this.tail.right = right;
    //         right.left = this.tail;
    //         tail.left = tail.right = null;
    //       }
    //
    //       // this.events.emit('removeTail',tail);
    //       this.counter.down();
    //       return tail;
    //     },core),
    //     cascadeBy: util.bind(function(fn){
    //       return this.dit.cascadeBy(fn);
    //     },core),
    //     isList: function(){
    //       return true;
    //     }
    //     isLazyList: function(){
    //       return true;
    //     }
    //   });
    //
    //   core.dit = core.iterator();
    //   return core;
    // };
    //
    // ds.LazyListIterator = function(d){
    //   if(!(d.isLazyList && d.isLazyList())) return;
    //
    //   var ls = ds.Iterator(d);
    //
    //   util.extends(ls,{
    //      moveNext:  function(){
    //           return this.move(function(ds,list){
    //               if(list.track === null){
    //                 list.track = ds.root;
    //                 return true;
    //               }
    //                 return false;
    //             },
    //             function(ds,list){
    //               if(list.track.right !== ds.root){
    //                 list.track = list.track.right();
    //                 return true;
    //               }
    //               return false;
    //             },
    //             function(ds,list){
    //               if(list.track.right() !== ds.root) return true;
    //               return false;
    //             });
    //       },
    //       movePrevious: function(){
    //         return this.move(function(ds,list){
    //             if(list.track === null){
    //                 list.track = ds.tail();
    //                 return true;
    //             }
    //             return false;
    //         },function(ds,list){
    //               if(list.track.left !== ds.tail){
    //                   list.track = list.track.left;
    //                   return true;
    //               }
    //               return false;
    //         },function(ds,list){
    //               if(list.track.left !== ds.tail) return true;
    //               return false;
    //         });
    //
    //       },
    //       append:function(data){
    //         var node = ds.ListNode(data);
    //         if(this.state !== (-1 && 0)){
    //
    //           var current = this.currentNode();
    //
    //           var left = current.left();
    //           var right = current.right();
    //
    //
    //           current.right = funtion(){ node; };
    //           node.right = right;
    //           node.left = current;
    //           right.left = node;
    //
    //         }else this.ds.append(data);
    //
    //         // this._append(node);
    //         this.ds.counter.up();
    //         return node;
    //       },
    //       prepend: function(data){
    //         var node = ds.ListNode(data);
    //         if(this.state !== (-1 && 0)){
    //           var current = this.currentNode(),
    //           left = current.left, right = current.right;
    //
    //           current.left = node;
    //           node.right = current;
    //           node.left = left;
    //           left.right = node;
    //         }else this.ds.prepend(data);
    //
    //
    //         // this._prepend(node);
    //         this.ds.counter.up();
    //         return node;
    //       },
    //       remove: function(data,fn){
    //         var node,it = this.ds.iterator();
    //
    //         if(fn == null) fn = function(i,d){
    //             return (i.current() === d ? i.currentNode() : null);
    //         };
    //
    //         while(it.moveNext()){
    //           node = fn(it,data);
    //           if(node === null) continue;
    //           break;
    //         }
    //
    //         if(!node) return false;
    //         var left = node.left, right = node.right;
    //
    //         left.right = right;
    //         right.left = left;
    //
    //         node.left = node.right = null;
    //
    //         this.ds.counter.down();
    //         // this._remove(node);
    //         return node;
    //       },
    //       removeHead: function(){
    //         if(!util.isValid(this.ds)) return null;
    //
    //         var node = this.ds.removeHead();
    //         this.tack = this.track === this.ds.root ? this.ds.root : null;
    //
    //         // this._removeHead(node);
    //         return node;
    //       },
    //       removeTail: function(){
    //         if(!util.isValid(this.ds)) return null;
    //
    //         var node = this.ds.removeTail();
    //         this.tack = this.track === this.ds.tail ? this.ds.tail : null;
    //
    //         // this._removeTail(node);
    //         return node;
    //       },
    //       removeAll: function(data,fn){
    //         var node,left,right,res = [], it = this.ds.iterator();
    //
    //         if(fn == null) fn = function(i,d){
    //             return (i.current() === d ? i.currentNode() : null);
    //         };
    //         while(it.moveNext()){
    //           node = fn(it,data);
    //           if(node === null) continue;
    //           left = node.left; right = node.right;
    //           left.right = right;
    //           right.left = left;
    //           res.push(node);
    //           this.ds.counter.down();
    //         }
    //
    //         util.each(res,function(e){ e.left = e.right = null; });
    //
    //         // this._removeAll(res);
    //         return res;
    //       },
    //       findAll: function(data,fn){
    //         if(fn == null) fn = function(i,d){
    //             return (i.current() === d ? i.currentNode() : null);
    //         };
    //
    //         var node,res = [], it = this.ds.iterator();
    //         while(it.moveNext()){
    //           var node = fn(it,data);
    //           if(!node) continue;
    //           res.push(node);
    //         }
    //
    //         if(res.length === 0) return;
    //
    //         // this._findAll(res);
    //         return res;
    //       },
    //       find: function(data,fn){
    //         if(fn == null) fn = function(i,d){
    //             return (i.current() === d ? i.currentNode() : null);
    //         };
    //
    //         var node,it = this.ds.iterator();
    //         while(it.moveNext()){
    //           var node = fn(it,data);
    //           if(!node) continue;
    //           break;
    //         }
    //
    //         if(!node) return false;
    //
    //         // this._find(node);
    //         return node;
    //       },
    //       cascadeBy:function(fn){
    //         var it = this.ds.iterator();
    //         while(it.moveNext()) fn(it.current(),it.currentNode());
    //         return it;
    //       }
    //   });
    //
    //   return ls;
    // }

    ds.List = function(max){
      var core = ds.DS();
      // var events = as.Events();
      // events.set('empty');

      util.extends(core,{
        // events: events,
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

      // var events = as.Events();
      // events.set('error');
      // events.set('begin');
      // events.set('end');
      // events.set('done');
      // events.set('prepend');
      // events.set('append');
      // events.set('removeAll');
      // events.set('findAll');
      // events.set('find');
      // events.set('remove');
      // events.set('removeTail');
      // events.set('removeHead');
      return {
        ds: d,
        // atEnd: as.Distributors(),
        state:0,
        track: null,
        // events: events,
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
            // this.events.emit('error',new Error('List is not initialized or has no nodes!'));
            return false;
          }

          if(pre(this.ds,this)){
            this.state = 1;
            // this.events.emit('begin',this.current(),this.currentNode());
            // this.events.emit('node',this.current(),this.currentNode());
            if(this.ds.size() === 1){
              this.state = 0;
              // this.events.emit('end',this.current(),this.currentNode());
              // this.events.emit('done',this);
            }
            return true;
          }
          else if(cur(this.ds,this)){
            this.state = 2;
            // this.events.emit('node',this.current(),this.currentNode());
            return true;
          }
          else if(post(this.ds,this)){
            this.state = -1;
            return true;
          }

          // this.events.emit('end',this.current(),this.currentNode());
          // this.events.emit('done',this);
          this.reset();
          return false;
        },
        reset: function(){
            this.state = 0;
            this.track =  null;
            // this.events.emit('reset');
            return false;
        },
        close: function(){
          this.reset();
          // this.events.off('all');
          this.events = null;
        },
        // _prepend: function(item){
        //   if(util.isFunction(item.isNode) && item.isNode())
        //   //   return  this.events.emit('prepend',item.data,item);
        //   // return this.events.emit('prepend',item);
        // },
        // _append: function(item){
        //   if(util.isFunction(item.isNode) && item.isNode())
        //     return  this.events.emit('append',item.data,item);
        //   return this.events.emit('append',item);
        // },
        // _remove: function(item){
        //   if(util.isFunction(item.isNode) && item.isNode())
        //     return  this.events.emit('remove',item.data,item);
        //   return this.events.emit('remove',item);
        // },
        // _removeHead: function(item){
        //   if(util.isFunction(item.isNode) && item.isNode())
        //     return  this.events.emit('removeHead',item.data,item);
        //   return this.events.emit('removeHead',item);
        // },
        // _removeTail: function(item){
        //   if(util.isFunction(item.isNode) && item.isNode())
        //     return  this.events.emit('removeTail',item.data,item);
        //   return this.events.emit('removeTail',item);
        // },
        // _removeAll: function(item){
        //   if(util.isFunction(item.isNode) && item.isNode())
        //     return  this.events.emit('removeAll',item.data,item);
        //   return this.events.emit('removeAll',item);
        // },
        // _find: function(item){
        //   if(util.isFunction(item.isNode) && item.isNode())
        //     return  this.events.emit('find',item.data,item);
        //   return this.events.emit('find',item);
        // },
        // _findAll: function(item){
        //   if(util.isFunction(item.isNode) && item.isNode())
        //     return  this.events.emit('findAll',item.data,item);
        //   return this.events.emit('findAll',item);
        // },
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

},{}],4:[function(require,module,exports){
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
      ascontrib.enums.eachAsync(tasks,function(e,i,o,fn){
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
        stack['arguments'] = arguments;
        stacks.push(stack);
        dist.distributeWith(guide,[e]);
        return ret;
      }
      safe.distributeWith(guide,ret);
      return ret;
    };

    if(fn.__guarded){
      // util.each(fn.stacks,function(e,i,o){ push(e); });
      push(util.flatten(fn.stacks));
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

    klass.prototype.$dot = function(fn){
      if(core.valids.not.Function(fn)) return;
      var fx = core.funcs.bindByPass(fn,this);
      return fx.call(this);
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

    // klass.prototype.$rack = function(fn){
    //   if(core.valids.not.Function(fn)) return;
    //   return fn.call(this);
    // };

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
      catchError: function(fn){
	return this.onError.apply(this,arguments);
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
    if(valids.not.String(pattern)) return;
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

      this.setUpBefore = this.$bind(function(){
        this.before.addDone(this.in.fire);
      });
      this.setUpAfter = this.$bind(function(){
        this.in.addDone(this.after.fire);
      });

      this.setUp = this.$bind(function(){
        this.setUpBefore();
        this.setUpAfter();
      });

      this.$secure('distributeWith',function(ctx,args){
        return this.before.fireWith(ctx,args);
      });

      this.$secure('distribute',function(){
        return this.distributeWith(this,core.enums.toArray(arguments));
      });

      this.setUp();
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
    removeAllListeners: function(){
      this.removeAllListenersIn();
      this.removeAllListenersAfter();
      this.removeAllListenersBefore();
    },
    removeAllListenersIn: function(){
      this.in.removeListeners();
    },
    removeAllListenersAfter: function(){
      this.after.removeListeners();
    },
    removeAllListenersBefore: function(){
      this.before.removeListeners();
    },
    removeAll: function(){
      this.removeAllIn();
      this.removeAllAfter();
      this.removeAllBefore();
      this.setUp();
    },
    removeAllIn: function(){
      this.in.removeAll();
      this.setUpAfter();
    },
    removeAllAfter: function(){
      this.after.removeAll();
    },
    removeAllBefore: function(){
      this.before.removeAll();
      this.setUpBefore();
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
        if(this.fired.indexOf('*') === -1) this.fired.push('*')
      }
      var ev = this.events(name);
      ev.distributeWith(ev,rest);
      if(this.fired.indexOf(name) === -1){ this.fired.push(name);}
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
      this.events(name).removeAllListeners();
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

      this.isFree = this.$bind(function(){
        if(subCount() <= 0 && !!loosepackets) return true;
        return false;
      });

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
    clearSubscribers: function(){
      this.events.flush('data');
      this.events.flush('dataOnce');
    },
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
      if(this.isLocked() || this.isFree()) return this;
      this.mutts.emit(n);
      return this;
    },
  });

  core.FilteredChannel = core.Stream.extends({
    init: function(id,picker,fx){
      this.$super();
      this.id = id;
      this.contract = core.Contract(id,picker);
      this.contract.onPass(core.funcs.bind(this.mutts.emit,this.mutts));

      var bindings = {};

      this.bindOut = this.$bind(function(chan){
        if(!core.FilteredChannel.instanceBelongs(chan) || valids.contains(bindings,chan.GUUID)) return;

        bindings[chan.GUUID] = {
           out: this.stream(chan),
           in: { unstream: function(){}}
        };
      });

      this.bindIn = this.$bind(function(chan){
        if(!core.FilteredChannel.instanceBelongs(chan) || valids.contains(bindings,chan.GUUID)) return;
        bindings[chan.GUUID] = {
           in: chan.stream(this),
           out: { unstream: function(){}}
        };
      });

      this.unbind = this.$bind(function(chan){
        if(!core.FilteredChannel.instanceBelongs(chan) || valids.not.contains(bindings,chan.GUUID)) return;
        var p = this.bindings[chan.GUUID];
        p.in.unstream(); p.out.unstream();
      });

      this.unbindAll = this.$bind(function(chan){
        enums.each(bindings,function(e,i,o,fn){
          if(chan && i === chan.GUUID) return fn(null);
          e.in.unstream(); e.out.unstream();
          return fn(null);
        });
      });

    },
    emit: function(d){
      return this.contract.interogate(d);
    },
    changeContract: function(f){
      return this.contract.changeHandler(f);
    },
    mutate: function(fn){
      this.mutts.add(fn);
    },
    unmutate: function(fn){
      this.mutts.remove(fn);
    },
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
      if(valids.isFunction(fx)) fx.call(this,this.packets);
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
      if(core.Stream.instanceBelongs(ps)){ this.copyStream(ps); }
      if(core.Persisto.instanceBelongs(ps)){ this.copyPersisto(ps); }
      return ps;
    },
    link: function(ps){
      if(core.Stream.instanceBelongs(ps)){ this.linkStream(ps); }
      if(core.Persisto.instanceBelongs(ps)){ this.linkPersisto(ps); }
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

  core.StreamUp = function(fn){
    return function(stream,fx){
      if(!core.Stream.instanceBelongs(stream)) return;
      return fn.call(null,stream,fx);
    };
  };

  core.CollectStream = core.StreamUp(function(stream,fx){
    var data = [];
    var collector = function(f){ data.push(f); };
    var end = function(){
      fx.call(null,data);
      stream.off(collector);
    };

    stream.on(collector);
    stream.afterOnceEvent('dataEnd',end);
  });

  core.StreamPackets = core.Persisto.extends({
      init: function(body,uuid){
        core.Asserted(valids.exists(body),"body is required (body)");
        this.$super();
        this.traces = [];
        this.body = body || {};
        this.uuid = uuid || core.Util.guid();
        this.type = 'packet';

        var lock = false, from;

        this.$secure('locked',function(){ return !!lock; });

        this.$secure('lock',function(){ lock = !lock; });

        this.$secure('useFrom',function(f){ if(valids.exists(from)){return;}; from = f; });
        this.$secure('from',function(){ return from; });
      },
      toString: function(){
        return [this.message,this.uuid,this.type].join(':');
      }
    },{
      isPacket: function(p){
        return core.StreamPackets.instanceBelongs(p);
      },
      clone: function(p,b,u){
        if(!core.StreamPackets.isPacket(p)){ return; }
        var pp = core.StreamPackets.make(b || p.body,u || p.uuid);
        pp.config(p.peekConfig());
        pp.config(p.body);
        p.link(pp);
        return pp;
      },
      proxy: function(fx){
        return {
          make: function(){
            var f = core.StreamPackets.make.apply(core.StreamPackets,arguments);
            if(valids.Function(fx)) fx.call(f,f);
            return f;
          },
          clone: function(){
            var f = core.StreamPackets.clone.apply(core.StreamPackets,arguments);
            if(valids.Function(fx)) fx.call(f,f);
            return f;
          },
        };
      }
  }).muxin({});

  core.ChannelStore = core.Configurable.extends({
    init: function(id){
      this.$super();
      this.id = id;
      this.inStore = core.Store.make('taskStorage');
      this.outStore = core.Store.make('replyStorage');
    },
    in: function(id){
      return this.inStore.get(id);
    },
    out: function(id){
      return this.outStore.get(id);
    },
    hasOut: function(id){
      return this.outStore.has(id);
    },
    hasIn: function(id){
      return this.inStore.has(id);
    },
  }).muxin({
    '$newChannel': function(tag,picker){
      core.Asserted(arguments.length  > 0,'please supply the tag for the channel');
      core.Asserted(valids.exists(tag),'tag of the channel must exists');
      return core.FilteredChannel.make(tag,picker);
    },
    newIn: function(id,tag,picker){
      var chan = this.$newChannel(tag,picker);
      this.inStore.add(id,chan);
      return function(fn){
        if(valids.Function(fn)) fn.call(chan,chan);
        return chan;
      };
    },
    newOut: function(id,tag,picker){
      var chan = this.$newChannel(tag,picker);
      this.outStore.add(id,chan);
      return function(fn){
        if(valids.Function(fn)) fn.call(chan,chan);
        return chan;
      };
    },
    inBindIn: function(id,chan){
      if(!core.FilteredChannel.instanceBelongs(chan)) return;
      if(!this.hasIn(id)) return;
      this.in(id).bindIn(chan);
      this.emit('inBindIn',{id:id,chan:chan});
    },
    inBindOut: function(id,chan){
      if(!core.FilteredChannel.instanceBelongs(chan)) return;
      if(!this.hasOut(id)) return;
      this.out(id).bindIn(chan);
      this.emit('inBindOut',{id:id,chan:chan});
    },
    outBindIn: function(id,chan){
      if(!core.FilteredChannel.instanceBelongs(chan)) return;
      if(!this.hasIn(id)) return;
      this.in(id).bindOut(chan);
      this.emit('outBindIn',{id:id,chan:chan});
    },
    outBindOut: function(id,chan){
      if(!core.FilteredChannel.instanceBelongs(chan)) return;
      if(!this.hasOut(id)) return;
      this.out(id).bindOut(chan);
      this.emit('outBindOut',{id:id,chan:chan});
    },
    unBindIn: function(id,chan){
      if(!core.FilteredChannel.instanceBelongs(chan)) return;
      if(!this.hasIn(id)) return;
      this.in(id).unbind(chan);
      this.emit('unBindIn',{id:id,chan:chan});
    },
    unBindOut: function(id,chan){
      if(!core.FilteredChannel.instanceBelongs(chan)) return;
      if(!this.hasOut(id)) return;
      this.out(id).unbind(chan);
      this.emit('unBindOut',{id:id,chan:chan});
    },
    hookBinderProxy: function(obj){
      if(valids.not.Object(obj)) return;
      obj.inBindIn = core.funcs.bind(this.inBindIn,this);
      obj.inBindOut = core.funcs.bind(this.inBindOut,this);
      obj.outBindIn = core.funcs.bind(this.outBindIn,this);
      obj.outBindIn = core.funcs.bind(this.outBindIn,this);
      obj.unBindIn = core.funcs.bind(this.unBindIn,this);
      obj.unBindOut = core.funcs.bind(this.unBindOut,this);
    },
    tweakIn: function(fc,fcc){
      return this.inStore.each(function(e,i,o,fx){
        if(valids.Function(fc)) fc.call(e,e,i);
        fx(null);
      },fcc)
    },
    tweakOut: function(fc,fcc){
      return this.outStore.each(function(e,i,o,fx){
        if(valids.Function(fc)) fc.call(e,e,i);
        fx(null);
      },fcc)
    },
    pauseIn: function(id){
      var t = this.in(id);
      if(t) t.pause();
      this.emit('pauseIn',id);
    },
    resumeIn: function(id){
      var t = this.in(id);
      if(t) t.resume();
      this.emit('resumeIn',id);
    },
    pauseOut: function(id){
      var t = this.out(id);
      if(t) t.pause();
      this.emit('pauseOut',id);
    },
    resumeOut: function(id){
      var t = this.out(id);
      if(t) t.resume();
      this.emit('resumeOut',id);
    },
    resumeAllIn: function(fx){
      this.tweakIn(function resumer(f){ f.resume(); },fx);
      this.emit('resumeAllIn',this);
    },
    pauseAllIn: function(fx){
      this.tweakIn(function pauser(f){ f.pause(); },fx);
      this.emit('pauseAllIn',this);
    },
    resumeAllOut: function(fx){
      this.tweakOut(function resumer(f){ f.resume(); },fx);
      this.emit('resumeAllOut',this);
    },
    pauseAllOut: function(fx){
      this.tweakOut(function pauser(f){ f.pause(); },fx);
      this.emit('pauseAllOut',this);
    },
    unbindAllIn: function(fx){
      this.tweakIn(function unbinder(f){ f.unbindAll(); },fx);
      this.emit('unbindAllIn',this);
    },
    unbindAllOut: function(fx){
      this.tweakOut(function unbinder(f){ f.unbindAll(); },fx);
      this.emit('unbindAllOut',this);
    },
  });

  core.ChannelMutators = function(fx){
    var channels = [], freed = [];
    return {
      bind: function(chan){
        if(!core.FilteredChannel.instanceBelongs(chan)) return;
        if(this.has(chan)) return;
        chan.mutate(fx);
        var free = freed.pop();
        if(free) channels[free] = chan;
        else channels.push(chan);
      },
      unbind: function(chan){
        if(!core.FilteredChannel.instanceBelongs(chan)) return;
        if(!this.has(chan)) return;
        chan.unmutate(fx);
        var ind = this.index(chan);
        channels[ind] = null;
        freed.push(ind);
      },
      unbindAll: function(exc){
        core.enums.each(channels,function(e){
          if(exc && e === exc) return;
          this.unbind(e);
        },null,this);
      },
      has: function(chan){
        return this.index(chan) !== -1;
      },
      index: function(chan){
        return channels.indexOf(chan);
      }
    }
  };

  core.Adapters = function(){
    var dist = core.Distributors();
    var mux = core.Middleware(core.funcs.bind(dist.distribute,dist));
    var fx = _.funcs.bind(mux.emit,mux);
    var apt = { mux: mux, rack: dist, };

    core.funcs.selfReturn(apt,'from',function(chan){
      core.Asserted(FilteredChannel.instanceBelongs(chan),'argument must be a channel instance');
      this.channel = chan;
      this.channel.on(fx);
    });

    core.funcs.selfReturn(apt,'detach',function(){
      this.channel.off(fx);
      this.channel = null;
    });

    core.funcs.selfReturn(apt,'muxate',function(fn){
      mux.add(fn);
    });

    core.funcs.selfReturn(apt,'out',function(fn){
      dist.add(fn);
    });

    core.funcs.selfReturn(apt,'outOnce',function(fn){
      dist.addOnce(fn);
    });

    core.funcs.selfReturn(apt,'unOut',function(fn){
      dist.remove(fn);
    });

    return apt;
  };

  core.AdapterStore = core.Store.extends({
    init: function(id){
      this.$super(id,function adapterIniter(fn){
        var rest = enums.rest(arguments);
        var ad = core.Adapters.apply(null,rest);
        fn.call(ad);
        return ad;
      });
    }
  });

  core.ChannelMutatorStore = core.Store.extends({
    init: function(id){
      this.$super(id,function mutatorIniter(fn){
        var rest = enums.toArray(arguments);
        return core.ChannelMutators.apply(core.ChannelMutators,rest);
      });
    }
  });




});

},{}],5:[function(require,module,exports){
var as = {};
require('./lib/as.js')(as);
require('./lib/as-contrib.js')(as);
require('./lib/ds.js')(as);
require('./lib/extenders.js')(as);

module.exports = as;

},{"./lib/as-contrib.js":1,"./lib/as.js":2,"./lib/ds.js":3,"./lib/extenders.js":4}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[5]);

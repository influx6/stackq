module.exports = (function(core){

  var empty = {};
  var AppStack = core;
  var _pusher = Array.prototype.push;

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


      templateIt: function(source,keys){
       if(!this.isString(source) && !this.isArray(keys)) return;

        var src = source;
        var self = this;
        this.forEach(keys,function(e,i,o){
            var reggy = new RegExp("\\{"+(i)+"\\}");
            src = src.replace(reggy,self.isFunction(e) ? '[Function]' : (!self.isValid(e) ? 'null' : e));
        });

        return src;
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
          return 'xxxxxxxx-xyxx-4xxx-yxxx-xxxyxxyxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16); }).toUpperCase();
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

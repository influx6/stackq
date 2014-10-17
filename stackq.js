var as = require('./lib/as-contrib.js').AsContrib;
var structs = require('./lib/structs.js');
module.exports = {
  'as': as.AppStack,
  'ds': as.DS,
  'streams': as.Streams,
  'ascontrib':as,
  'structs': structs,

  //useful bits
  'Class': as.funcs.bind(structs.Class,structs),
  'Jazz': as.funcs.bind(structs.JzGroup,structs),
  'Expects': structs.Expects,
  'Utility': as.AppStack.Utility,
  'Enums': as.enums,
  'Valids': as.valids,
  'Funcs': as.funcs,
  'Tags': as.tags,
  'Notify': as.notify
}

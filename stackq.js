var as = {};
require('./lib/as.js')(as);
require('./lib/as-contrib.js')(as);
require('./lib/ds.js')(as);
require('./lib/streams.js')(as);
require('./lib/structs.js')(as);
require('./lib/schemes.js')(as);

module.exports = as;
// var structs = require('./lib/structs.js');
// var schemes = require('./lib/schemes.js');
// module.exports = {
  // 'as': as,
  // 'ds': as.DS,
  // 'streams': as.Streams,
  // 'ascontrib':as,
  // 'structs': structs,
  // 'schemes': schemes,

  //useful bits
  // 'Class': as.funcs.bind(structs.Class,structs),
  // 'Jazz': as.funcs.bind(structs.JzGroup,structs),
  // 'Expects': structs.Expects,
  // 'Utility': as.Utility,
  // 'Enums': as.enums,
  // 'Valids': as.valids,
  // 'Funcs': as.funcs,
  // 'Tags': as.tags,
  // 'Notify': as.notify
// }

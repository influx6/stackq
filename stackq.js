var as = {};
require('./lib/as.js')(as);
require('./lib/as-contrib.js')(as);
require('./lib/ds.js')(as);
require('./lib/extenders.js')(as);

module.exports = as;
global.Stackq = as;

var uuid = require('uuid');

module.exports = function logRequest(options) {
  var logger = options.logger;
  var headerName = options.headerName || 'x-request-id';

  return function (req, res, next) {
    var id = req.headers[headerName] || uuid.v4();
    var now = Date.now();
    var startOpts = {req: req};

    req.log = logger.child({
      type: 'request',
      id: id,
      serializers: logger.constructor.stdSerializers
    });

    if (req.body) {
      startOpts.body = req.body;
    }

    res.setHeader(headerName, id);

    req.log.info(startOpts, 'start request');
    
    var time = process.hrtime();
    res.on('finish', function responseSent() {
      var diff = process.hrtime(time);
      req.log.info({res: res, duration: diff[0] * 1e3 + diff[1] * 1e-6}, 'end request');
    });

    next();
  };
};

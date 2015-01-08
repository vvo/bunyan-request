var uuid = require('uuid');

module.exports = function logRequest(options) {
  var logger = options.logger;
  var headerName = options.headerName || 'x-request-id';

  var includeRequestInEnd = options.includeRequestInEnd;

  
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
    res.on('finish', function responseSent() {
      var endOpts = {res: res, duration: Date.now() - now};
      if (includeRequestInEnd) {
        endOpts["req"] = req;
      }
      req.log.info(endOpts, 'end request');
    });

    next();
  };
};

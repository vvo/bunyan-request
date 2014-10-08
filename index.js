var uuid = require('uuid');

module.exports = function logRequest(options) {
  var logger = options.logger;
  var headerName = options.headerName || 'x-request-id';

  return function (req, res, next) {
    var id = req.headers[headerName] || uuid.v4();
    var now = Date.now();

    req.log = logger.child({
      type: 'request',
      id: id,
      serializers: logger.constructor.stdSerializers
    });
    res.setHeader(headerName, id);

    req.log.info({req: req}, 'start request');
    res.on('finish', function responseSent() {
      req.log.info({res: res, duration: Date.now() - now}, 'end request');
    });

    next();
  };
};

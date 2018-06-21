const uuid = require('uuid');


module.exports = function logRequest({headerName='x-request-id', logger}={}) {
  return function (req, res, next) {
    const id = req.headers[headerName] || uuid.v4();

    const log = logger.child({
      type: 'request',
      id: id,
      serializers: logger.constructor.stdSerializers
    });

    // Request
    req.log = log

    const startOpts = {req: req};

    if (req.body) {
      startOpts.body = req.body;
    }
    else if (req.text) {
      startOpts.text = req.text;
    }

    log.info(startOpts, 'start request');

    // Response
    res.setHeader(headerName, id);

    let res_body
    const res_send = res.send
    res.send = function(body)
    {
      res_body = body

      res_send.call(res, body)
    }

    const time = process.hrtime();
    res.on('finish', function responseSent() {
      const diff = process.hrtime(time);
      const endOpts = {res: res, duration: diff[0] * 1e3 + diff[1] * 1e-6}

      if (res_body !== undefined) {
        endOpts.body = res_body;
      }

      log.info(endOpts, 'end request');
    });

    next();
  };
};

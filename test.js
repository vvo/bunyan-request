var bunyan = require('bunyan');
var bunyanRequest = require('./');
var http = require('http');
var request = require('supertest');
var test = require('tape');
var packageVersion = require('./package.json').version;

var port;
var userAgent = 'bunyan-request/' + packageVersion;

var logger;
var requestLogger;

var server = http.createServer(function serve(req, res) {
  requestLogger(req, res, function next() {
    req.log.info('Hello specialized!');
    res.end('ok');
  });
});

server.on('listening', function() {
  port = this.address().port;
});

request = request(server);

test('request, response', function(t) {
  var output = [];
  reset(output);

  t.plan(6);

  request
    .get('/')
    .set('user-agent', userAgent)
    .expect(200)
    .end(function gotResponse(err, res) {
      var requestLog = output[0];
      var responseLog = output[2];

      t.error(err, 'received a response from server');

      t.ok(requestLog.id, 'a request `id` was set');
      t.equal(requestLog.id, responseLog.id, 'request and response id are the same');
      t.equal(res.header['x-request-id'], requestLog.id, 'response header `x-request-id` was set');

      t.equal(requestLog.type, 'request', 'log type set to `request`');

      t.deepEqual(requestLog.req, {
        method: 'GET',
        url: '/',
        headers: {
          host: '127.0.0.1:' + port,
          'accept-encoding': 'gzip, deflate',
          'user-agent': userAgent,
          'connection': 'close'
        },
        remoteAddress: '127.0.0.1',
        remotePort: requestLog.req.remotePort
      }, 'request log have the right `req` property');
    });
});

test('specialized log', function(t) {
  var output = [];
  reset(output);

  t.plan(4);

  request
    .get('/')
    .set('x-request-id', '4000')
    .expect(200)
    .end(function gotResponse(err) {
      var specializedLog = output[1];

      t.error(err, 'received a response from server');
      t.equal(specializedLog.msg, 'Hello specialized!');
      t.equal(specializedLog.id, '4000');
      t.equal(specializedLog.type, 'request');
    });
});

test('existing `x-request-id`', function(t) {
  var output = [];
  reset(output);

  t.plan(2);

  request
    .get('/')
    .set('x-request-id', '9000')
    .expect(200)
    .end(function gotResponse(err, res) {
      t.error(err, 'received a response from server');
      t.equal(res.header['x-request-id'], '9000');
    });
});

test('specifying `headerName`', function(t) {
  var output = [];
  reset(output, {headerName: 'x-carrot-id'});

  t.plan(2);

  request
    .get('/')
    .set('x-carrot-id', '13000')
    .expect(200)
    .end(function gotResponse(err, res) {
      t.error(err, 'received a response from server');
      t.equal(res.header['x-carrot-id'], '13000');
    });
});

test('duration', function(t) {
  var output = [];
  reset(output, {headerName: 'x-carrot-id'});

  t.plan(3);

  request
    .get('/')
    .expect(200)
    .end(function gotResponse(err) {
      var responseLog = output[2];

      t.error(err, 'received a response from server');
      t.equal(typeof responseLog.duration, 'number', '`duration` was set');
      t.ok(responseLog.duration >= 0, 'duration is >= 0');
    });
});

function reset(output, opts) {
  logger = bunyan.createLogger({
    name: 'test',
    streams: [{
      stream: new CapturingStream(output),
      type: 'raw'
    }]
  });

  opts = opts || {};
  opts.logger = logger;

  requestLogger = bunyanRequest(opts);
}

function CapturingStream(recs) {
  this.recs = recs;
}

CapturingStream.prototype.write = function (rec) {
  this.recs.push(rec);
};

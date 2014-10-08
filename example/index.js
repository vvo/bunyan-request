var bunyan = require('bunyan');
var bunyanRequest = require('../');
var express = require('express');
var http = require('http');
var request = require('supertest');

var logger = bunyan.createLogger({name: 'Example'});
var requestLogger = bunyanRequest({
  logger: logger
});

var app = express();
var server = http.createServer(app);
request = request(server);

app.use(requestLogger);
app.get('/', function main(req, res) {
  req.log.info('Hello!');
  res.send('World!');
});
setInterval(doRequest, 1500);

function doRequest() {
  request
    .get('/')
    .end(function(){});
}

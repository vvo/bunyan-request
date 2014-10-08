# bunyan-request [![Dependency Status](http://img.shields.io/david/vvo/bunyan-request.svg?style=flat-square)](https://david-dm.org/vvo/bunyan-request) [![devDependency Status](http://img.shields.io/david/dev/vvo/bunyan-request.svg?style=flat-square)](https://david-dm.org/vvo/bunyan-request#info=devDependencies)

Request, response logger middleware using bunyan.

Also provides request<>response duration in milliseconds.

![screenshot](screenshot.png)

## Install

```shell
npm install bunyan-request --save
```

## Usage

Will use and forward `x-request-id` (case insensitive) header when present. Otherwise will generate
a [uuid.v4()](https://github.com/defunctzombie/node-uuid#uuidv4options--buffer--offset) and
add it to the response headers.

```js
var bunyan = require('bunyan');
var bunyanRequest = require('bunyan-request');
var express = require('express');

var app = express();
var logger = bunyan.createLogger({name: 'My App'});
var requestLogger = bunyanRequest({
  logger: logger,
  headerName: 'x-request-id'
});

app.get('/', function(req, res) {
  req.log('YO DAWG!');
  res.send('ok');
});
```

## Example

```shell
npm run example
```

See [example](example).

## Test

```shell
npm test
```

## Credits

First version by [tellnes/bunyan-middleware](https://github.com/tellnes/bunyan-middleware).

## License

MIT

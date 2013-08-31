io = require('socket.io-client');
kson = require('kson');
QueryValidator = require('query_validator');

global.window = require('jsdom').jsdom().createWindow();
jQuery = $ = require('jquery');

module.exports = {
  'sandbox': require('./lib/sandbox'),
  'interface': require('./lib/interface')
}

/*
Copyright (c) 2014 Bryan Hughes <bryan@theoreticalideations.com>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the 'Software'), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var fs = require('fs');
var constants = require('constants');

var GPIO_PATH_PREFIX = '/sys/class/gpio';

var gpio = module.exports = function(pin) {
  this.pin = pin;
  this.gpioPath = GPIO_PATH_PREFIX + '/gpio' + this.pin;
};

gpio.prototype.init = function(cb) {
  fs.exists(this.gpioPath, (function (exists) {
    if (exists) {
      cb();
    } else {
      fs.writeFile(GPIO_PATH_PREFIX + '/export', this.pin, function(err) {
        if (err && err.errno !== constants.EBUSY) {
          cb(err);
          return;
        }
        cb();
      });
    }
  }).bind(this));
};

gpio.prototype.setDirection = function(direction, cb) {
  direction = direction === 'out' ? 'out' : 'in';
  fs.writeFile(this.gpioPath + '/direction', direction, cb);
};

gpio.prototype.writeValue = function(value, cb) {
  fs.writeFile(this.gpioPath + '/value', value ? 1 : 0, cb);
};

gpio.prototype.readValue = function(cb) {
  fs.readFile(this.gpioPath + '/value', function (err, buf) {
    if (err) {
      cb(err);
      return;
    }
    cb(null, +buf.toString()[0]);
  });
};

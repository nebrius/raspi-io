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

var GPIO_PATH_PREFIX = '/sys/class/gpio';

var GPIO = module.exports = function(pin) {
  this.pin = pin;
  this.direction = 'in';
  this._gpioPath = GPIO_PATH_PREFIX + '/gpio' + this.pin;
};

GPIO.prototype.init = function(cb, emitter) {

  this.handlers = [];
  this._emitter = emitter;

  var finalize = (function (err) {
    if (err) {
      cb(err);
      return;
    }
    this.setDirectionSync('in');
    this.readValueSync();
    cb();
  }).bind(this);

  fs.exists(this._gpioPath, (function (exists) {
    if (exists) {
      process.nextTick(finalize);
    } else {
      fs.writeFile(GPIO_PATH_PREFIX + '/export', this.pin, function(err) {
        if (err) {
          finalize(err);
          return;
        }
        finalize();
      });
    }
  }).bind(this));
};

GPIO.prototype.watchValue = function(handler) {

  if (!this.handlers.length) {
    setInterval((function () {
      if (this.direction == 'out') {
        this._emitter && this._emitter.emit('data-read-' + this.pin, this.value);
        return;
      }
      fs.readFile(this._gpioPath + '/value', (function (err, buf) {
        if (err) {
          console.error('Error reading from pin ' + this.pin);
          return;
        }
        var value = +buf.toString()[0];
        var len = this.handlers.length;
        if (len) {
          for (var i = 0; i < len; i++) {
            this.handlers[i](value);
          }
          this._emitter && this._emitter.emit('data-read-' + this.pin, value);
        }
      }).bind(this));
    }).bind(this));
  }

  this.handlers.push(handler);
};

GPIO.prototype.setDirectionSync = function(direction) {
  direction = direction === 'out' ? 'out' : 'in';
  if (direction !== this.direction) {
    this.direction = direction;
    fs.writeFileSync(this._gpioPath + '/direction', this.direction);
  }
};

GPIO.prototype.writeValueSync = function(value) {
  if (value !== this.value) {
    this.value = value;
    fs.writeFileSync(this._gpioPath + '/value', value ? '1' : '0');
  }
};

GPIO.prototype.readValueSync = function() {
  return this.value = +fs.readFileSync(this._gpioPath + '/value', 'utf8').toString();
};

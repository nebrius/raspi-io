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

var GPIO = module.exports = function(descriptor) {
  this.pin = descriptor._gpio;
  this.direction = 'in';
  this._gpioPath = GPIO_PATH_PREFIX + '/gpio' + this.pin;
  this.descriptor = descriptor;
};

GPIO.prototype.init = function(cb) {

  this.handlers = [];

  // This method polls the value of the pin and updates the descriptor accordingly.
  // If the pin is in write mode, it keeps polling until it's back in read-mode.
  // This could be done more elegantly, but I really want to get something with
  // fs.watch or even poll(2) in C for a proper solution, so consider this temporary.
  var update = (function () {
    if (this.direction === 'in') {
      fs.readFile(this._gpioPath + '/value', (function (err, buf) {
        if (err) {
          console.error('Error reading from pin ' + this.pin);
          return;
        }
        this.descriptor.value = +buf.toString()[0];
        for (var i = 0, len = this.handlers.length; i < len; i++) {
          this.handlers[i](this.descriptor.value);
        }
        setTimeout(update);
      }).bind(this));
    } else {
      setTimeout(update);
    }
  }).bind(this);

  var finalize = (function (err) {
    if (err) {
      cb(err);
      return;
    }
    update();
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
  this.handlers.push(handler);
};

GPIO.prototype.setDirection = function(direction, cb) {
  direction = direction === 'out' ? 'out' : 'in';
  if (direction !== this.direction) {
    this.direction = direction;
    if (this.direction === 'in') {
      this.descriptor.value = 0;
    }
    fs.writeFile(this._gpioPath + '/direction', this.direction, (function(err) {
      if (err) {
        console.error('Error writing to pin ' + this.pin);
      }
      cb && cb(err);
    }).bind(this));
  } else {
    cb && process.nextTick(cb);
  }
};

GPIO.prototype.writeValue = function(value, cb) {
  console.log(value, this.descriptor.value);
  if (value !== this.descriptor.value) {
    this.descriptor.value = value;
    fs.writeFile(this._gpioPath + '/value', value ? 1 : 0, (function(err) {
      if (err) {
        console.error('Error writing to pin ' + this.pin);
      } else {
        this.descriptor.value = value;
      }
      cb && cb(err);
    }).bind(this));
  } else {
    cb && process.nextTick(cb);
  }
};

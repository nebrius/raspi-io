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

var Emitter = require('events').EventEmitter;
var GpioPin = require('./gpio');

var modes = Object.freeze({
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4
});

function Raspi(opts) {
  Emitter.call(this);
}

Raspi.reset = function() {
  throw 'reset is not yet implemented.';
};

Raspi.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Raspi
  },
  MODES: {
    value: modes
  },
  HIGH: {
    value: 1
  },
  LOW: {
    value: 0
  }
});

[
  'pinMode',
  'analogRead',
  'digitalRead',
  'analogWrite',
  'digitalWrite',
  'servoWrite',
  'pulseIn',
  'pulseOut',
  'queryPinState',
  'sendI2CWriteRequest',
  'sendI2CReadRequest',
  'sendI2CConfig',
  '_sendOneWireRequest',
  '_sendOneWireSearch',
  'sendOneWireWriteAndRead',
  'sendOneWireDelay',
  'sendOneWireDelay',
  'sendOneWireReset',
  'sendOneWireRead',
  'sendOneWireSearch',
  'sendOneWireAlarmsSearch',
  'sendOneWireConfig',
  'stepperConfig',
  'stepperStep'
].forEach(function(method) {
  Raspi.prototype[method] = function() {
    throw method + ' is not yet implemented.';
  };
});

module.exports = Raspi;
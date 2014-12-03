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

import fs from 'fs';
import events from 'events';
import { init } from 'raspi-core';
import { getPins, getPinNumber } from 'raspi-board';
import { DigitalOutput, DigitalInput } from 'raspi-gpio';
import { PWM } from 'raspi-pwm';

// Check for root access
if (process.env.USER != 'root') {
  console.warn('WARNING: Raspi-IO usually needs to be run with root privileges to access hardware, but it doesn\'t appear to be running as root currently');
}

// Constants
var INPUT = 0;
var OUTPUT = 1;
var ANALOG = 2;
var PWM = 3;
var SERVO = 4;

var LOW = 0;
var HIGH = 1;

var LED = 'led0';

// Hacky but fast emulation of symbols, eliminating the need for $traceurRuntime.toProperty calls
var isReady = '__r$271828_0$__';
var pins = '__r$271828_1$__';
var instances = '__r$271828_2$__';
var analogPins = '__r$271828_3$__';
var mode = '__$271828_4$__';

class Raspi extends events.EventEmitter {

  constructor() {
    super();

    Object.defineProperties(this, {
      name: {
        enumerable: true,
        value: 'RaspberryPi-IO'
      },

      [instances]: {
        writable: true,
        value: []
      },

      [isReady]: {
        writable: true,
        value: false
      },
      isReady: {
        enumerable: true,
        get: () => {
          return this[isReady];
        }
      },

      [pins]: {
        writable: true,
        value: []
      },
      pins: {
        enumerable: true,
        get: () => {
          return this[pins];
        }
      },

      [analogPins]: {
        writable: true,
        value: []
      },
      analogPins: {
        enumerable: true,
        get: () => {
          return this[analogPins];
        }
      },

      MODES: {
        enumerable: true,
        value: Object.freeze({
          INPUT: INPUT,
          OUTPUT: OUTPUT,
          ANALOG: ANALOG,
          PWM: PWM,
          SERVO: SERVO
        })
      },

      HIGH: {
        enumerable: true,
        value: HIGH
      },
      LOW: {
        enumerable: true,
        value: LOW
      },

      defaultLed: {
        enumerable: true,
        value: LED
      }
    });

    init(() => {
      var pinMappings = getPins();
      this[pins] = (Object.keys(pinMappings).map((pin) => {
        pin = pinMappings[pin];
        var supportedModes = [ INPUT, OUTPUT ];
        if (pin.peripherals.indexOf('pwm') != -1) {
          supportedModes.push(PWM, SERVO);
        }
        var value = (this[instances][pin] = new DigitalInput(pin)).read();
        return Object.create(null, {
          supportedModes: {
            enumerable: true,
            value: Object.freeze(supportedModes)
          },
          mode: {
            enumerable: true,
            value: INPUT
          },
          value: {
            enumerable: true,
            value: value
          },
          report: {
            enumerable: true,
            value: 1
          },
          analogChannel: {
            enumerable: true,
            value: 127
          }
        });
      }));
      this.emit('ready');
      this.emit('connect');
    });
  }

  reset() {
    throw 'reset is not yet implemented.';
  }

  normalize(pin) {
    return getPinNumber(pin);
  }
}

Object.defineProperty(Raspi, 'isRaspberryPi', {
  enumerable: true,
  value: () => {
    // Determining if a system is a Raspberry Pi isn't possible through
    // the os module on Raspbian, so we read it from the file system instead
    var isRaspberryPi = false;
    try {
      isRaspberryPi = fs.readFileSync('/etc/os-release').toString().indexOf('Raspbian') !== -1;
    } catch(e) {}// Squash file not found, etc errors
    return isRaspberryPi;
  }
});

module.exports = Raspi;

/*function Raspi() {
  // Initialize the GPIO pins
  Board.getBoardPins((function (err, pins, pinAliases) {
    if (err) {
      console.error('Could not initialize board: ' + err);
      return;
    }
    this.pins = pins;
    this._pinAliases = pinAliases;

    // Helper method to initialize a pin instance
    var createPinInitializer = (function createPinInitializer(descriptor) {
      return (function(next) {
        (descriptor._instance = new GPIO(descriptor._gpio)).init(function(err) {
          if (err) {
            next('Could not initialize GPIO ' + descriptor._gpio + ': ' + err);
          } else {
            next();
          }
        }, this);
      }).bind(this);
    }).bind(this);

    // Initialize the pins
    var tasks = [];
    for (var i = 0, len = pins.length; i < len; i++) {
      if (pins[i].supportedModes.length) {
        tasks.push(createPinInitializer(pins[i]));
      }
    }
    async.parallel(tasks, (function(err) {
      if (err) {
        console.error('Could not initialize GPIO pins: ' + err);
        return;
      }
      this.isReady = true;
      this.emit('ready');
      this.emit('connect');
    }).bind(this));
  }).bind(this));
}
Raspi.prototype = new Emitter();

Raspi.reset = function() {
  throw 'reset is not yet implemented.';
};

Raspi.isRaspberryPi = function () {
  // Determining if a system is a Raspberry Pi isn't possible through
  // the os module on Raspbian, so we read it from the file system instead
  var isRaspberryPi = false;
  try {
    isRaspberryPi = fs.readFileSync('/etc/os-release').toString().indexOf('Raspbian') !== -1;
  } catch(e) {}// Squash file not found, etc errors
  return isRaspberryPi;
};

Raspi.prototype.normalize = function(alias) {
  return this._pinAliases[alias.toString().toUpperCase()] || alias;
};

Raspi.prototype.pinMode = function(pin, mode) {
  var pinInstance = this.pins[pin];
  if (!pinInstance) {
    throw new Error('Invalid pin "' + pin + '"');
  } else if (pinInstance.supportedModes.indexOf(mode) == -1) {
    throw new Error('Pin "' + pin + '" does not support mode "' + mode + '"');
  }

  // For now we only support GPIO, aka INPUT and OUTPUT. This will need to be refactored
  // later once other types of modes are supported
  pinInstance.mode = mode;
  pinInstance._instance.setDirectionSync(mode == Board.modes.OUTPUT ? 'out' : 'in');
};

Raspi.prototype.digitalRead = function(pin, handler) {
  var pinInstance = this.pins[pin];
  if (!pinInstance) {
    throw new Error('Invalid pin "' + pin + '"');
  }
  pinInstance._instance.watchValue(handler);
};

Raspi.prototype.digitalWrite = function(pin, value) {
  var pinInstance = this.pins[pin];
  if (!pinInstance) {
    throw new Error('Invalid pin "' + pin + '"');
  } else if (pinInstance.mode !== Board.modes.OUTPUT) {
    throw new Error('Cannot write to pin "' + pin + '" because it is not in output mode');
  }
  pinInstance._instance.writeValueSync(value);
};

Raspi.prototype.analogRead = function() {
  throw new Error('Analog read is not supported on the Raspberry Pi');
};

Raspi.prototype.analogWrite = function() {
  throw new Error('Analog write is not supported on the Raspberry Pi');
};

[
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

module.exports = Raspi;*/

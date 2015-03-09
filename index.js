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
import { init } from 'raspi';
import { getPins, getPinNumber } from 'raspi-board';
import { DigitalOutput, DigitalInput } from 'raspi-gpio';
import { PWM } from 'raspi-pwm';

// Constants
var INPUT_MODE = 0;
var OUTPUT_MODE = 1;
var ANALOG_MODE = 2;
var PWM_MODE = 3;
var SERVO_MODE = 4;
var UNKNOWN_MODE = 99;

var LOW = 0;
var HIGH = 1;

var LED = 'led0';

// Settings

var DIGITAL_READ_UPDATE_RATE = 19;

// Hacky but fast emulation of symbols
var isReady = '__r$271828_0$__';
var pins = '__r$271828_1$__';
var instances = '__r$271828_2$__';
var analogPins = '__r$271828_3$__';
var mode = '__$271828_4$__';
var getPinInstance = '__$271828_5$__';

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
        get() {
          return this[isReady];
        }
      },

      [pins]: {
        writable: true,
        value: []
      },
      pins: {
        enumerable: true,
        get() {
          return this[pins];
        }
      },

      [analogPins]: {
        writable: true,
        value: []
      },
      analogPins: {
        enumerable: true,
        get() {
          return this[analogPins];
        }
      },

      MODES: {
        enumerable: true,
        value: Object.freeze({
          INPUT: INPUT_MODE,
          OUTPUT: OUTPUT_MODE,
          ANALOG: ANALOG_MODE,
          PWM: PWM_MODE,
          SERVO: SERVO_MODE
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
      this[pins] = [];
      Object.keys(pinMappings).forEach(function (pin) {
        var pinInfo = pinMappings[pin];
        var supportedModes = [ INPUT_MODE, OUTPUT_MODE ];
        if (pinInfo.peripherals.indexOf('pwm') != -1) {
          supportedModes.push(PWM_MODE, SERVO_MODE);
        }
        var instance = this[instances][pin] = {
          peripheral: null,
          mode: UNKNOWN_MODE,
          previousWrittenValue: LOW
        };
        this[pins][pin] = Object.create(null, {
          supportedModes: {
            enumerable: true,
            value: Object.freeze(supportedModes)
          },
          mode: {
            enumerable: true,
            get() {
              return instance.mode;
            }
          },
          value: {
            enumerable: true,
            get() {
              switch(instance.mode) {
                case INPUT_MODE:
                  return instance.peripheral.read();
                  break;
                case OUTPUT_MODE:
                  return instance.previousWrittenValue;
                  break;
              }
            },
            set(value) {
              if (instance.mode == OUTPUT_MODE) {
                instance.peripheral.write(value);
              }
            }
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
      }.bind(this));

      // Fill in the holes, sins pins are sparse on the A+/B+/2
      for (var i = 0; i < this[pins].length; i++) {
        if (!this[pins][i]) {
          this[pins][i] = Object.create(null, {
            supportedModes: {
              enumerable: true,
              value: Object.freeze([])
            },
            mode: {
              enumerable: true,
              get() {
                return UNKNOWN_MODE;
              }
            },
            value: {
              enumerable: true,
              get() {
                return 0;
              },
              set() {}
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
        }
      }

      this[isReady] = true;
      this.emit('ready');
      this.emit('connect');
    });
  }

  reset() {
    throw 'reset is not supported on the Raspberry Pi';
  }

  normalize(pin) {
    var normalizedPin = getPinNumber(pin);
    if (typeof normalizedPin == 'undefined') {
      throw new Error('Unknown pin "' + pin + '"');
    }
    return normalizedPin;
  }

  [getPinInstance](pin) {
    var pinInstance = this[instances][pin];
    if (!pinInstance) {
      throw new Error('Unknown pin "' + pin + '"');
    }
    return pinInstance;
  }

  pinMode(pin, mode) {
    var normalizedPin = this.normalize(pin);
    var pinInstance = this[getPinInstance](normalizedPin);
    if (this[pins][normalizedPin].supportedModes.indexOf(mode) == -1) {
      throw new Error('Pin "' + pin + '" does not support mode "' + mode + '"');
    }
    switch(mode) {
      case INPUT_MODE:
        pinInstance.peripheral = new DigitalInput(normalizedPin);
        break;
      case OUTPUT_MODE:
        pinInstance.peripheral = new DigitalOutput(normalizedPin);
        break;
      case PWM_MODE:
      case SERVO_MODE:
        pinInstance.peripheral = new PWM(normalizedPin);
        break;
    }
    pinInstance.mode = mode;
  }

  analogRead(pin, handler) {
    throw new Error('analogRead is not supported on the Raspberry Pi');
  }

  analogWrite(pin, value) {
    var pinInstance = this[getPinInstance](this.normalize(pin));
    if (pinInstance.mode != PWM_MODE) {
      this.pinMode(pin, PWM_MODE);
    }
    pinInstance.peripheral.write(Math.round(value * 1000 / 255));
  }

  digitalRead(pin, handler) {
    var pinInstance = this[getPinInstance](this.normalize(pin));
    if (pinInstance.mode != INPUT_MODE) {
      this.pinMode(pin, INPUT_MODE);
    }
    var interval = setInterval(() => {
      var value;
      if (pinInstance.mode == INPUT_MODE) {
        value = pinInstance.peripheral.read();
      } else {
        value = pinInstance.previousWrittenValue;
      }
      handler && handler(value);
      this.emit('digital-read-' + pin, value);
    }, DIGITAL_READ_UPDATE_RATE);
    pinInstance.peripheral.on('destroyed', () => {
      clearInterval(interval);
    });
  }

  digitalWrite(pin, value) {
    var pinInstance = this[getPinInstance](this.normalize(pin));
    if (pinInstance.mode != OUTPUT_MODE) {
      this.pinMode(pin, OUTPUT_MODE);
    }
    if (value != pinInstance.previousWrittenValue) {
      pinInstance.peripheral.write(value ? HIGH : LOW);
      pinInstance.previousWrittenValue = value;
    }
  }

  servoWrite(pin, value) {
    var pinInstance = this[getPinInstance](this.normalize(pin));
    if (pinInstance.mode != SERVO_MODE) {
      this.pinMode(pin, SERVO_MODE);
    }
    pinInstance.peripheral.write(48 + Math.round(value * 48/ 180));
  }

  queryCapabilities(cb) {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  }

  queryAnalogMapping(cb) {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  }

  queryPinState(pin, cb) {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  }

  sendI2CConfig() {
    throw 'sendI2CConfig is not yet implemented';
  }

  sendI2CWriteRequest() {
    throw 'sendI2CWriteRequest is not yet implemented';
  }

  sendI2CReadRequest() {
    throw 'sendI2CReadRequest is not yet implemented';
  }

  setSamplingInterval() {
    throw 'setSamplingInterval is not yet implemented';
  }

  reportAnalogPin() {
    throw 'reportAnalogPin is not yet implemented';
  }

  reportDigitalPin() {
    throw 'reportDigitalPin is not yet implemented';
  }

  pulseIn() {
    throw 'pulseIn is not yet implemented';
  }

  stepperConfig() {
    throw 'stepperConfig is not yet implemented';
  }

  stepperStep() {
    throw 'stepperStep is not yet implemented';
  }

  sendOneWireConfig() {
    throw 'sendOneWireConfig is not yet implemented';
  }

  sendOneWireSearch() {
    throw 'sendOneWireSearch is not yet implemented';
  }

  sendOneWireAlarmsSearch() {
    throw 'sendOneWireAlarmsSearch is not yet implemented';
  }

  sendOneWireRead() {
    throw 'sendOneWireRead is not yet implemented';
  }

  sendOneWireReset() {
    throw 'sendOneWireReset is not yet implemented';
  }

  sendOneWireWrite() {
    throw 'sendOneWireWrite is not yet implemented';
  }

  sendOneWireDelay() {
    throw 'sendOneWireDelay is not yet implemented';
  }

  sendOneWireWriteAndRead() {
    throw 'sendOneWireWriteAndRead is not yet implemented';
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

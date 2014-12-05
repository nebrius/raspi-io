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

// Hacky but fast emulation of symbols, eliminating the need for $traceurRuntime.toProperty calls
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
      this[pins] = (Object.keys(pinMappings).map((pin) => {
        var pinInfo = pinMappings[pin];
        var supportedModes = [ INPUT_MODE, OUTPUT_MODE ];
        if (pinInfo.peripherals.indexOf('pwm') != -1) {
          supportedModes.push(PWM_MODE, SERVO_MODE);
        }
        var instance = this[instances][pin] = {
          peripheral: new DigitalInput(pin),
          mode: INPUT_MODE,
          previousWrittenValue: LOW
        };
        return Object.create(null, {
          supportedModes: {
            enumerable: true,
            value: Object.freeze(supportedModes)
          },
          mode: {
            enumerable: true,
            value: {
              get() {
                return instance.mode;
              }
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
              if (instance.mode == OUTPUT_MODE && value != instance.previousWrittenValue) {
                instance.peripheral.write(value);
                instance.previousWrittenValue = value;
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
      }));

      this[isReady] = true;
      this.emit('ready');
      this.emit('connect');
    });
  }

  reset() {
    throw 'reset is not supported on the Raspberry Pi';
  }

  normalize(pin) {
    return getPinNumber(pin);
  }

  [getPinInstance](pin) {
    var pinInstance = this[instances][pin];
    if (!pinInstance) {
      throw new Error('Unknown pin "' + pin + '"');
    }
    return pinInstance;
  }

  pinMode(pin, mode) {
    var pinInstance = this[getPinInstance](pin);
    if (this[pins][pin].supportedModes.indexOf(mode) == -1) {
      throw new Error('Pin "' + pin + '" does not support mode "' + mode + '"');
    }
    switch(mode) {
      case INPUT_MODE:
        pinInstance.peripheral = new DigitalInput(pin);
        break;
      case OUTPUT_MODE:
        pinInstance.peripheral = new DigitalOutput(pin);
        break;
      case PWM_MODE:
      case SERVO_MODE:
        pinInstance.peripheral = new PWM(pin);
        break;
    }
    pinInstance.mode = mode;
  }

  analogRead(pin, handler) {
    throw new Error('analogRead is not supported on the Raspberry Pi');
  }

  analogWrite(pin, value) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != PWM_MODE) {
      throw new Error('Cannot analogWrite to pin "' + pin + '" unless it is in PWM mode');
    }
    pinInstance.peripheral.write(Math.round(value * 1024 / 255));
  }

  digitalRead(pin, handler) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != INPUT_MODE) {
      throw new Error('Cannot digitalRead from pin "' + pin + '" unless it is in INPUT mode');
    }
    var interval = setInterval(() => {
      var value = pinInstance.peripheral.read();
      handler && handler(value);
      this.emit('digital-read-' + pin, value);
    }, DIGITAL_READ_UPDATE_RATE);
    pinInstance.peripheral.on('destroyed', () => {
      clearInterval(interval);
    });
  }

  digitalWrite(pin, value) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != OUTPUT_MODE) {
      throw new Error('Cannot digitalWrite to pin "' + pin + '" unless it is in OUTPUT mode');
    }
    pinInstance.peripheral.write(value ? HIGH : LOW);
  }

  servoWrite(pin, value) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != SERVO_MODE) {
      throw new Error('Cannot servoWrite to pin "' + pin + '" unless it is in PWM mode');
    }
    pinInstance.peripheral.write(Math.round(value * 1024 / 255));
  }

  queryCapabilities() {
    throw 'queryCapabilities is not yet implemented';
  }

  queryAnalogMapping() {
    throw 'queryAnalogMapping is not yet implemented';
  }

  queryPinState() {
    throw 'queryPinState is not yet implemented';
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
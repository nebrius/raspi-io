"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

var fs = _interopRequire(require("fs"));

var events = _interopRequire(require("events"));

var init = require("raspi").init;

var _raspiBoard = require("raspi-board");

var getPins = _raspiBoard.getPins;
var getPinNumber = _raspiBoard.getPinNumber;

var _raspiGpio = require("raspi-gpio");

var DigitalOutput = _raspiGpio.DigitalOutput;
var DigitalInput = _raspiGpio.DigitalInput;

var PWM = require("raspi-pwm").PWM;

// Constants
var INPUT_MODE = 0;
var OUTPUT_MODE = 1;
var ANALOG_MODE = 2;
var PWM_MODE = 3;
var SERVO_MODE = 4;
var UNKNOWN_MODE = 99;

var LOW = 0;
var HIGH = 1;

var LED = "led0";

// Settings

var DIGITAL_READ_UPDATE_RATE = 19;

// Hacky but fast emulation of symbols
var isReady = "__r$271828_0$__";
var pins = "__r$271828_1$__";
var instances = "__r$271828_2$__";
var analogPins = "__r$271828_3$__";
var mode = "__$271828_4$__";
var getPinInstance = "__$271828_5$__";

var Raspi = (function (_events$EventEmitter) {
  function Raspi() {
    var _this4 = this;

    _classCallCheck(this, Raspi);

    _get(Object.getPrototypeOf(Raspi.prototype), "constructor", this).call(this);

    Object.defineProperties(this, (function () {
      var _Object$defineProperties = {
        name: {
          enumerable: true,
          value: "RaspberryPi-IO"
        } };

      _defineProperty(_Object$defineProperties, instances, {
        writable: true,
        value: []
      });

      _defineProperty(_Object$defineProperties, isReady, {
        writable: true,
        value: false
      });

      _defineProperty(_Object$defineProperties, "isReady", {
        enumerable: true,
        get: function get() {
          return this[isReady];
        }
      });

      _defineProperty(_Object$defineProperties, pins, {
        writable: true,
        value: []
      });

      _defineProperty(_Object$defineProperties, "pins", {
        enumerable: true,
        get: function get() {
          return this[pins];
        }
      });

      _defineProperty(_Object$defineProperties, analogPins, {
        writable: true,
        value: []
      });

      _defineProperty(_Object$defineProperties, "analogPins", {
        enumerable: true,
        get: function get() {
          return this[analogPins];
        }
      });

      _defineProperty(_Object$defineProperties, "MODES", {
        enumerable: true,
        value: Object.freeze({
          INPUT: INPUT_MODE,
          OUTPUT: OUTPUT_MODE,
          ANALOG: ANALOG_MODE,
          PWM: PWM_MODE,
          SERVO: SERVO_MODE
        })
      });

      _defineProperty(_Object$defineProperties, "HIGH", {
        enumerable: true,
        value: HIGH
      });

      _defineProperty(_Object$defineProperties, "LOW", {
        enumerable: true,
        value: LOW
      });

      _defineProperty(_Object$defineProperties, "defaultLed", {
        enumerable: true,
        value: LED
      });

      return _Object$defineProperties;
    })());

    init(function () {
      var pinMappings = getPins();
      _this4[pins] = [];
      for (var _iterator = Object.keys(pinMappings)[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
        var pin = _step.value;

        var pinInfo = pinMappings[pin];
        var supportedModes = [INPUT_MODE, OUTPUT_MODE];
        if (pinInfo.peripherals.indexOf("pwm") != -1) {
          supportedModes.push(PWM_MODE, SERVO_MODE);
        }
        var instance = _this4[instances][pin] = {
          peripheral: new DigitalInput(pin),
          mode: INPUT_MODE,
          previousWrittenValue: LOW
        };
        _this4[pins][pin] = Object.create(null, {
          supportedModes: {
            enumerable: true,
            value: Object.freeze(supportedModes)
          },
          mode: {
            enumerable: true,
            get: function get() {
              return instance.mode;
            }
          },
          value: {
            enumerable: true,
            get: function get() {
              switch (instance.mode) {
                case INPUT_MODE:
                  return instance.peripheral.read();
                  if (_iterator["return"]) _iterator["return"]();
                  break;
                case OUTPUT_MODE:
                  return instance.previousWrittenValue;
                  if (_iterator["return"]) _iterator["return"]();
                  break;
              }
            },
            set: function set(value) {
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
      }

      // Fill in the holes
      for (var i = 0; i < _this4[pins].length; i++) {
        if (!_this4[pins][i]) {
          _this4[pins][i] = Object.create(null, {
            supportedModes: {
              enumerable: true,
              value: Object.freeze([])
            },
            mode: {
              enumerable: true,
              get: function get() {
                return UNKNOWN_MODE;
              }
            },
            value: {
              enumerable: true,
              get: function get() {
                return 0;
              },
              set: function set() {}
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

      _this4[isReady] = true;
      _this4.emit("ready");
      _this4.emit("connect");
    });
  }

  _inherits(Raspi, _events$EventEmitter);

  _prototypeProperties(Raspi, null, (function () {
    var _prototypeProperties2 = {
      reset: {
        value: function reset() {
          throw "reset is not supported on the Raspberry Pi";
        },
        writable: true,
        configurable: true
      },
      normalize: {
        value: function normalize(pin) {
          var normalizedPin = getPinNumber(pin);
          if (typeof normalizedPin == "undefined") {
            throw new Error("Unknown pin \"" + pin + "\"");
          }
          return normalizedPin;
        },
        writable: true,
        configurable: true
      }
    };

    _defineProperty(_prototypeProperties2, getPinInstance, {
      value: function (pin) {
        var pinInstance = this[instances][pin];
        if (!pinInstance) {
          throw new Error("Unknown pin \"" + pin + "\"");
        }
        return pinInstance;
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "pinMode", {
      value: function pinMode(pin, mode) {
        var normalizedPin = this.normalize(pin);
        var pinInstance = this[getPinInstance](normalizedPin);
        if (this[pins][normalizedPin].supportedModes.indexOf(mode) == -1) {
          throw new Error("Pin \"" + pin + "\" does not support mode \"" + mode + "\"");
        }
        switch (mode) {
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
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "analogRead", {
      value: function analogRead(pin, handler) {
        throw new Error("analogRead is not supported on the Raspberry Pi");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "analogWrite", {
      value: function analogWrite(pin, value) {
        var pinInstance = this[getPinInstance](pin);
        if (pinInstance.mode != PWM_MODE) {
          this.pinMode(pin, PWM_MODE);
        }
        pinInstance.peripheral.write(Math.round(value * 1000 / 255));
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "digitalRead", {
      value: function digitalRead(pin, handler) {
        var _this = this;

        var pinInstance = this[getPinInstance](pin);
        if (pinInstance.mode != INPUT_MODE) {
          this.mode(pin, INPUT_MODE);
        }
        var interval = setInterval(function () {
          var value;
          if (pinInstance.mode == INPUT_MODE) {
            value = pinInstance.peripheral.read();
          } else {
            value = pinInstance.previousWrittenValue;
          }
          handler && handler(value);
          _this.emit("digital-read-" + pin, value);
        }, DIGITAL_READ_UPDATE_RATE);
        pinInstance.peripheral.on("destroyed", function () {
          clearInterval(interval);
        });
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "digitalWrite", {
      value: function digitalWrite(pin, value) {
        var pinInstance = this[getPinInstance](pin);
        if (pinInstance.mode != OUTPUT_MODE) {
          this.pinMode(pin, OUTPUT_MODE);
        }
        if (value != pinInstance.previousWrittenValue) {
          pinInstance.peripheral.write(value ? HIGH : LOW);
          pinInstance.previousWrittenValue = value;
        }
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "servoWrite", {
      value: function servoWrite(pin, value) {
        var pinInstance = this[getPinInstance](pin);
        if (pinInstance.mode != SERVO_MODE) {
          this.pinMode(pin, SERVO_MODE);
        }
        pinInstance.peripheral.write(48 + Math.round(value * 48 / 180));
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "queryCapabilities", {
      value: function queryCapabilities(cb) {
        if (this.isReady) {
          process.nextTick(cb);
        } else {
          this.on("ready", cb);
        }
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "queryAnalogMapping", {
      value: function queryAnalogMapping(cb) {
        if (this.isReady) {
          process.nextTick(cb);
        } else {
          this.on("ready", cb);
        }
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "queryPinState", {
      value: function queryPinState(pin, cb) {
        if (this.isReady) {
          process.nextTick(cb);
        } else {
          this.on("ready", cb);
        }
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendI2CConfig", {
      value: function sendI2CConfig() {
        throw "sendI2CConfig is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendI2CWriteRequest", {
      value: function sendI2CWriteRequest() {
        throw "sendI2CWriteRequest is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendI2CReadRequest", {
      value: function sendI2CReadRequest() {
        throw "sendI2CReadRequest is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "setSamplingInterval", {
      value: function setSamplingInterval() {
        throw "setSamplingInterval is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "reportAnalogPin", {
      value: function reportAnalogPin() {
        throw "reportAnalogPin is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "reportDigitalPin", {
      value: function reportDigitalPin() {
        throw "reportDigitalPin is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "pulseIn", {
      value: function pulseIn() {
        throw "pulseIn is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "stepperConfig", {
      value: function stepperConfig() {
        throw "stepperConfig is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "stepperStep", {
      value: function stepperStep() {
        throw "stepperStep is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireConfig", {
      value: function sendOneWireConfig() {
        throw "sendOneWireConfig is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireSearch", {
      value: function sendOneWireSearch() {
        throw "sendOneWireSearch is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireAlarmsSearch", {
      value: function sendOneWireAlarmsSearch() {
        throw "sendOneWireAlarmsSearch is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireRead", {
      value: function sendOneWireRead() {
        throw "sendOneWireRead is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireReset", {
      value: function sendOneWireReset() {
        throw "sendOneWireReset is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireWrite", {
      value: function sendOneWireWrite() {
        throw "sendOneWireWrite is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireDelay", {
      value: function sendOneWireDelay() {
        throw "sendOneWireDelay is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireWriteAndRead", {
      value: function sendOneWireWriteAndRead() {
        throw "sendOneWireWriteAndRead is not yet implemented";
      },
      writable: true,
      configurable: true
    });

    return _prototypeProperties2;
  })());

  return Raspi;
})(events.EventEmitter);

Object.defineProperty(Raspi, "isRaspberryPi", {
  enumerable: true,
  value: function () {
    // Determining if a system is a Raspberry Pi isn't possible through
    // the os module on Raspbian, so we read it from the file system instead
    var isRaspberryPi = false;
    try {
      isRaspberryPi = fs.readFileSync("/etc/os-release").toString().indexOf("Raspbian") !== -1;
    } catch (e) {} // Squash file not found, etc errors
    return isRaspberryPi;
  }
});

module.exports = Raspi;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXlCTyxFQUFFLDJCQUFNLElBQUk7O0lBQ1osTUFBTSwyQkFBTSxRQUFROztJQUNsQixJQUFJLFdBQVEsT0FBTyxFQUFuQixJQUFJOzswQkFDeUIsYUFBYTs7SUFBMUMsT0FBTyxlQUFQLE9BQU87SUFBRSxZQUFZLGVBQVosWUFBWTs7eUJBQ2MsWUFBWTs7SUFBL0MsYUFBYSxjQUFiLGFBQWE7SUFBRSxZQUFZLGNBQVosWUFBWTs7SUFDM0IsR0FBRyxXQUFRLFdBQVcsRUFBdEIsR0FBRzs7O0FBR1osSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNwQixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDcEIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNuQixJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7O0FBRXRCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNaLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQzs7QUFFYixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUM7Ozs7QUFJakIsSUFBSSx3QkFBd0IsR0FBRyxFQUFFLENBQUM7OztBQUdsQyxJQUFJLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQztBQUNoQyxJQUFJLElBQUksR0FBRyxpQkFBaUIsQ0FBQztBQUM3QixJQUFJLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztBQUNsQyxJQUFJLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQztBQUNuQyxJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQztBQUM1QixJQUFJLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQzs7SUFFaEMsS0FBSztBQUVFLFdBRlAsS0FBSzs7OzBCQUFMLEtBQUs7O0FBR1AsK0JBSEUsS0FBSyw2Q0FHQzs7QUFFUixVQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSTs7QUFDMUIsY0FBTTtBQUNKLG9CQUFVLEVBQUUsSUFBSTtBQUNoQixlQUFLLEVBQUUsZ0JBQWdCO1NBQ3hCOztnREFFQSxTQUFTLEVBQUc7QUFDWCxnQkFBUSxFQUFFLElBQUk7QUFDZCxhQUFLLEVBQUUsRUFBRTtPQUNWOztnREFFQSxPQUFPLEVBQUc7QUFDVCxnQkFBUSxFQUFFLElBQUk7QUFDZCxhQUFLLEVBQUUsS0FBSztPQUNiOzsyREFDUTtBQUNQLGtCQUFVLEVBQUUsSUFBSTtBQUNoQixXQUFHLEVBQUEsZUFBRztBQUNKLGlCQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN0QjtPQUNGOztnREFFQSxJQUFJLEVBQUc7QUFDTixnQkFBUSxFQUFFLElBQUk7QUFDZCxhQUFLLEVBQUUsRUFBRTtPQUNWOzt3REFDSztBQUNKLGtCQUFVLEVBQUUsSUFBSTtBQUNoQixXQUFHLEVBQUEsZUFBRztBQUNKLGlCQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNuQjtPQUNGOztnREFFQSxVQUFVLEVBQUc7QUFDWixnQkFBUSxFQUFFLElBQUk7QUFDZCxhQUFLLEVBQUUsRUFBRTtPQUNWOzs4REFDVztBQUNWLGtCQUFVLEVBQUUsSUFBSTtBQUNoQixXQUFHLEVBQUEsZUFBRztBQUNKLGlCQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN6QjtPQUNGOzt5REFFTTtBQUNMLGtCQUFVLEVBQUUsSUFBSTtBQUNoQixhQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNuQixlQUFLLEVBQUUsVUFBVTtBQUNqQixnQkFBTSxFQUFFLFdBQVc7QUFDbkIsZ0JBQU0sRUFBRSxXQUFXO0FBQ25CLGFBQUcsRUFBRSxRQUFRO0FBQ2IsZUFBSyxFQUFFLFVBQVU7U0FDbEIsQ0FBQztPQUNIOzt3REFFSztBQUNKLGtCQUFVLEVBQUUsSUFBSTtBQUNoQixhQUFLLEVBQUUsSUFBSTtPQUNaOzt1REFDSTtBQUNILGtCQUFVLEVBQUUsSUFBSTtBQUNoQixhQUFLLEVBQUUsR0FBRztPQUNYOzs4REFFVztBQUNWLGtCQUFVLEVBQUUsSUFBSTtBQUNoQixhQUFLLEVBQUUsR0FBRztPQUNYOzs7U0FDRCxDQUFDOztBQUVILFFBQUksQ0FBQyxZQUFNO0FBQ1QsVUFBSSxXQUFXLEdBQUcsT0FBTyxFQUFFLENBQUM7QUFDNUIsYUFBSyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDaEIsMkJBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQS9CLEdBQUc7O0FBQ1YsWUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLFlBQUksY0FBYyxHQUFHLENBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBRSxDQUFDO0FBQ2pELFlBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDNUMsd0JBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzNDO0FBQ0QsWUFBSSxRQUFRLEdBQUcsT0FBSyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRztBQUNwQyxvQkFBVSxFQUFFLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQztBQUNqQyxjQUFJLEVBQUUsVUFBVTtBQUNoQiw4QkFBb0IsRUFBRSxHQUFHO1NBQzFCLENBQUM7QUFDRixlQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ3BDLHdCQUFjLEVBQUU7QUFDZCxzQkFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztXQUNyQztBQUNELGNBQUksRUFBRTtBQUNKLHNCQUFVLEVBQUUsSUFBSTtBQUNoQixlQUFHLEVBQUEsZUFBRztBQUNKLHFCQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUM7YUFDdEI7V0FDRjtBQUNELGVBQUssRUFBRTtBQUNMLHNCQUFVLEVBQUUsSUFBSTtBQUNoQixlQUFHLEVBQUEsZUFBRztBQUNKLHNCQUFPLFFBQVEsQ0FBQyxJQUFJO0FBQ2xCLHFCQUFLLFVBQVU7QUFDYix5QkFBTyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUNsQyx3QkFBTTtBQUFBLEFBQ1IscUJBQUssV0FBVztBQUNkLHlCQUFPLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQzs7QUFDckMsd0JBQU07QUFBQSxlQUNUO2FBQ0Y7QUFDRCxlQUFHLEVBQUEsYUFBQyxLQUFLLEVBQUU7QUFDVCxrQkFBSSxRQUFRLENBQUMsSUFBSSxJQUFJLFdBQVcsRUFBRTtBQUNoQyx3QkFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7ZUFDbEM7YUFDRjtXQUNGO0FBQ0QsZ0JBQU0sRUFBRTtBQUNOLHNCQUFVLEVBQUUsSUFBSTtBQUNoQixpQkFBSyxFQUFFLENBQUM7V0FDVDtBQUNELHVCQUFhLEVBQUU7QUFDYixzQkFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQUssRUFBRSxHQUFHO1dBQ1g7U0FDRixDQUFDLENBQUM7T0FDSjs7O0FBR0QsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQUssSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFDLFlBQUksQ0FBQyxPQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ2xCLGlCQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ2xDLDBCQUFjLEVBQUU7QUFDZCx3QkFBVSxFQUFFLElBQUk7QUFDaEIsbUJBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQzthQUN6QjtBQUNELGdCQUFJLEVBQUU7QUFDSix3QkFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQUcsRUFBQSxlQUFHO0FBQ0osdUJBQU8sWUFBWSxDQUFDO2VBQ3JCO2FBQ0Y7QUFDRCxpQkFBSyxFQUFFO0FBQ0wsd0JBQVUsRUFBRSxJQUFJO0FBQ2hCLGlCQUFHLEVBQUEsZUFBRztBQUNKLHVCQUFPLENBQUMsQ0FBQztlQUNWO0FBQ0QsaUJBQUcsRUFBQSxlQUFHLEVBQUU7YUFDVDtBQUNELGtCQUFNLEVBQUU7QUFDTix3QkFBVSxFQUFFLElBQUk7QUFDaEIsbUJBQUssRUFBRSxDQUFDO2FBQ1Q7QUFDRCx5QkFBYSxFQUFFO0FBQ2Isd0JBQVUsRUFBRSxJQUFJO0FBQ2hCLG1CQUFLLEVBQUUsR0FBRzthQUNYO1dBQ0YsQ0FBQyxDQUFDO1NBQ0o7T0FDRjs7QUFFRCxhQUFLLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNyQixhQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuQixhQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN0QixDQUFDLENBQUM7R0FDSjs7WUF0S0csS0FBSzs7dUJBQUwsS0FBSzs7O2VBd0tKLGlCQUFHO0FBQ04sZ0JBQU0sNENBQTRDLENBQUM7U0FDcEQ7Ozs7O2VBRVEsbUJBQUMsR0FBRyxFQUFFO0FBQ2IsY0FBSSxhQUFhLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLGNBQUksT0FBTyxhQUFhLElBQUksV0FBVyxFQUFFO0FBQ3ZDLGtCQUFNLElBQUksS0FBSyxDQUFDLGdCQUFlLEdBQUcsR0FBRyxHQUFHLElBQUcsQ0FBQyxDQUFDO1dBQzlDO0FBQ0QsaUJBQU8sYUFBYSxDQUFDO1NBQ3RCOzs7Ozs7MkNBRUEsY0FBYzthQUFDLFVBQUMsR0FBRyxFQUFFO0FBQ3BCLFlBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QyxZQUFJLENBQUMsV0FBVyxFQUFFO0FBQ2hCLGdCQUFNLElBQUksS0FBSyxDQUFDLGdCQUFlLEdBQUcsR0FBRyxHQUFHLElBQUcsQ0FBQyxDQUFDO1NBQzlDO0FBQ0QsZUFBTyxXQUFXLENBQUM7T0FDcEI7Ozs7OzthQUVNLGlCQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDakIsWUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QyxZQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDdEQsWUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtBQUNoRSxnQkFBTSxJQUFJLEtBQUssQ0FBQyxRQUFPLEdBQUcsR0FBRyxHQUFHLDZCQUEyQixHQUFHLElBQUksR0FBRyxJQUFHLENBQUMsQ0FBQztTQUMzRTtBQUNELGdCQUFPLElBQUk7QUFDVCxlQUFLLFVBQVU7QUFDYix1QkFBVyxDQUFDLFVBQVUsR0FBRyxJQUFJLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN6RCxrQkFBTTtBQUFBLEFBQ1IsZUFBSyxXQUFXO0FBQ2QsdUJBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDMUQsa0JBQU07QUFBQSxBQUNSLGVBQUssUUFBUSxDQUFDO0FBQ2QsZUFBSyxVQUFVO0FBQ2IsdUJBQVcsQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDaEQsa0JBQU07QUFBQSxTQUNUO0FBQ0QsbUJBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO09BQ3pCOzs7Ozs7YUFFUyxvQkFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQ3ZCLGNBQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztPQUNwRTs7Ozs7O2FBRVUscUJBQUMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUN0QixZQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUMsWUFBSSxXQUFXLENBQUMsSUFBSSxJQUFJLFFBQVEsRUFBRTtBQUNoQyxjQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUM3QjtBQUNELG1CQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztPQUM5RDs7Ozs7O2FBRVUscUJBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRTs7O0FBQ3hCLFlBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QyxZQUFJLFdBQVcsQ0FBQyxJQUFJLElBQUksVUFBVSxFQUFFO0FBQ2xDLGNBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzVCO0FBQ0QsWUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLFlBQU07QUFDL0IsY0FBSSxLQUFLLENBQUM7QUFDVixjQUFJLFdBQVcsQ0FBQyxJQUFJLElBQUksVUFBVSxFQUFFO0FBQ2xDLGlCQUFLLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztXQUN2QyxNQUFNO0FBQ0wsaUJBQUssR0FBRyxXQUFXLENBQUMsb0JBQW9CLENBQUM7V0FDMUM7QUFDRCxpQkFBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQixnQkFBSyxJQUFJLENBQUMsZUFBZSxHQUFHLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN6QyxFQUFFLHdCQUF3QixDQUFDLENBQUM7QUFDN0IsbUJBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFNO0FBQzNDLHVCQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekIsQ0FBQyxDQUFDO09BQ0o7Ozs7OzthQUVXLHNCQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDdkIsWUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLFlBQUksV0FBVyxDQUFDLElBQUksSUFBSSxXQUFXLEVBQUU7QUFDbkMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDaEM7QUFDRCxZQUFJLEtBQUssSUFBSSxXQUFXLENBQUMsb0JBQW9CLEVBQUU7QUFDN0MscUJBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDakQscUJBQVcsQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7U0FDMUM7T0FDRjs7Ozs7O2FBRVMsb0JBQUMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUNyQixZQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUMsWUFBSSxXQUFXLENBQUMsSUFBSSxJQUFJLFVBQVUsRUFBRTtBQUNsQyxjQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUMvQjtBQUNELG1CQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDaEU7Ozs7OzthQUVnQiwyQkFBQyxFQUFFLEVBQUU7QUFDcEIsWUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLGlCQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3RCLE1BQU07QUFDTCxjQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN0QjtPQUNGOzs7Ozs7YUFFaUIsNEJBQUMsRUFBRSxFQUFFO0FBQ3JCLFlBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN0QixNQUFNO0FBQ0wsY0FBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdEI7T0FDRjs7Ozs7O2FBRVksdUJBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRTtBQUNyQixZQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsaUJBQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDdEIsTUFBTTtBQUNMLGNBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3RCO09BQ0Y7Ozs7OzthQUVZLHlCQUFHO0FBQ2QsY0FBTSxzQ0FBc0MsQ0FBQztPQUM5Qzs7Ozs7O2FBRWtCLCtCQUFHO0FBQ3BCLGNBQU0sNENBQTRDLENBQUM7T0FDcEQ7Ozs7OzthQUVpQiw4QkFBRztBQUNuQixjQUFNLDJDQUEyQyxDQUFDO09BQ25EOzs7Ozs7YUFFa0IsK0JBQUc7QUFDcEIsY0FBTSw0Q0FBNEMsQ0FBQztPQUNwRDs7Ozs7O2FBRWMsMkJBQUc7QUFDaEIsY0FBTSx3Q0FBd0MsQ0FBQztPQUNoRDs7Ozs7O2FBRWUsNEJBQUc7QUFDakIsY0FBTSx5Q0FBeUMsQ0FBQztPQUNqRDs7Ozs7O2FBRU0sbUJBQUc7QUFDUixjQUFNLGdDQUFnQyxDQUFDO09BQ3hDOzs7Ozs7YUFFWSx5QkFBRztBQUNkLGNBQU0sc0NBQXNDLENBQUM7T0FDOUM7Ozs7OzthQUVVLHVCQUFHO0FBQ1osY0FBTSxvQ0FBb0MsQ0FBQztPQUM1Qzs7Ozs7O2FBRWdCLDZCQUFHO0FBQ2xCLGNBQU0sMENBQTBDLENBQUM7T0FDbEQ7Ozs7OzthQUVnQiw2QkFBRztBQUNsQixjQUFNLDBDQUEwQyxDQUFDO09BQ2xEOzs7Ozs7YUFFc0IsbUNBQUc7QUFDeEIsY0FBTSxnREFBZ0QsQ0FBQztPQUN4RDs7Ozs7O2FBRWMsMkJBQUc7QUFDaEIsY0FBTSx3Q0FBd0MsQ0FBQztPQUNoRDs7Ozs7O2FBRWUsNEJBQUc7QUFDakIsY0FBTSx5Q0FBeUMsQ0FBQztPQUNqRDs7Ozs7O2FBRWUsNEJBQUc7QUFDakIsY0FBTSx5Q0FBeUMsQ0FBQztPQUNqRDs7Ozs7O2FBRWUsNEJBQUc7QUFDakIsY0FBTSx5Q0FBeUMsQ0FBQztPQUNqRDs7Ozs7O2FBRXNCLG1DQUFHO0FBQ3hCLGNBQU0sZ0RBQWdELENBQUM7T0FDeEQ7Ozs7Ozs7O1NBOVZHLEtBQUs7R0FBUyxNQUFNLENBQUMsWUFBWTs7QUFpV3ZDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRTtBQUM1QyxZQUFVLEVBQUUsSUFBSTtBQUNoQixPQUFLLEVBQUUsWUFBTTs7O0FBR1gsUUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzFCLFFBQUk7QUFDRixtQkFBYSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDMUYsQ0FBQyxPQUFNLENBQUMsRUFBRSxFQUFFO0FBQ2IsV0FBTyxhQUFhLENBQUM7R0FDdEI7Q0FDRixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IChjKSAyMDE0IEJyeWFuIEh1Z2hlcyA8YnJ5YW5AdGhlb3JldGljYWxpZGVhdGlvbnMuY29tPlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxub2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb25cbmZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXRcbnJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLFxuY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZVxuU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmdcbmNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVNcbk9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG5OT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVFxuSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksXG5XSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkdcbkZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1Jcbk9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAncmFzcGknO1xuaW1wb3J0IHsgZ2V0UGlucywgZ2V0UGluTnVtYmVyIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuaW1wb3J0IHsgRGlnaXRhbE91dHB1dCwgRGlnaXRhbElucHV0IH0gZnJvbSAncmFzcGktZ3Bpbyc7XG5pbXBvcnQgeyBQV00gfSBmcm9tICdyYXNwaS1wd20nO1xuXG4vLyBDb25zdGFudHNcbnZhciBJTlBVVF9NT0RFID0gMDtcbnZhciBPVVRQVVRfTU9ERSA9IDE7XG52YXIgQU5BTE9HX01PREUgPSAyO1xudmFyIFBXTV9NT0RFID0gMztcbnZhciBTRVJWT19NT0RFID0gNDtcbnZhciBVTktOT1dOX01PREUgPSA5OTtcblxudmFyIExPVyA9IDA7XG52YXIgSElHSCA9IDE7XG5cbnZhciBMRUQgPSAnbGVkMCc7XG5cbi8vIFNldHRpbmdzXG5cbnZhciBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUgPSAxOTtcblxuLy8gSGFja3kgYnV0IGZhc3QgZW11bGF0aW9uIG9mIHN5bWJvbHNcbnZhciBpc1JlYWR5ID0gJ19fciQyNzE4MjhfMCRfXyc7XG52YXIgcGlucyA9ICdfX3IkMjcxODI4XzEkX18nO1xudmFyIGluc3RhbmNlcyA9ICdfX3IkMjcxODI4XzIkX18nO1xudmFyIGFuYWxvZ1BpbnMgPSAnX19yJDI3MTgyOF8zJF9fJztcbnZhciBtb2RlID0gJ19fJDI3MTgyOF80JF9fJztcbnZhciBnZXRQaW5JbnN0YW5jZSA9ICdfXyQyNzE4MjhfNSRfXyc7XG5cbmNsYXNzIFJhc3BpIGV4dGVuZHMgZXZlbnRzLkV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6ICdSYXNwYmVycnlQaS1JTydcbiAgICAgIH0sXG5cbiAgICAgIFtpbnN0YW5jZXNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1JlYWR5XToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuICAgICAgaXNSZWFkeToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbaXNSZWFkeV07XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFtwaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgcGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbcGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFthbmFsb2dQaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgYW5hbG9nUGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbYW5hbG9nUGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIE1PREVTOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICBJTlBVVDogSU5QVVRfTU9ERSxcbiAgICAgICAgICBPVVRQVVQ6IE9VVFBVVF9NT0RFLFxuICAgICAgICAgIEFOQUxPRzogQU5BTE9HX01PREUsXG4gICAgICAgICAgUFdNOiBQV01fTU9ERSxcbiAgICAgICAgICBTRVJWTzogU0VSVk9fTU9ERVxuICAgICAgICB9KVxuICAgICAgfSxcblxuICAgICAgSElHSDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSElHSFxuICAgICAgfSxcbiAgICAgIExPVzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTE9XXG4gICAgICB9LFxuXG4gICAgICBkZWZhdWx0TGVkOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMRURcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGluaXQoKCkgPT4ge1xuICAgICAgdmFyIHBpbk1hcHBpbmdzID0gZ2V0UGlucygpO1xuICAgICAgdGhpc1twaW5zXSA9IFtdO1xuICAgICAgZm9yICh2YXIgcGluIG9mIE9iamVjdC5rZXlzKHBpbk1hcHBpbmdzKSkge1xuICAgICAgICB2YXIgcGluSW5mbyA9IHBpbk1hcHBpbmdzW3Bpbl07XG4gICAgICAgIHZhciBzdXBwb3J0ZWRNb2RlcyA9IFsgSU5QVVRfTU9ERSwgT1VUUFVUX01PREUgXTtcbiAgICAgICAgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZigncHdtJykgIT0gLTEpIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlcy5wdXNoKFBXTV9NT0RFLCBTRVJWT19NT0RFKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXSA9IHtcbiAgICAgICAgICBwZXJpcGhlcmFsOiBuZXcgRGlnaXRhbElucHV0KHBpbiksXG4gICAgICAgICAgbW9kZTogSU5QVVRfTU9ERSxcbiAgICAgICAgICBwcmV2aW91c1dyaXR0ZW5WYWx1ZTogTE9XXG4gICAgICAgIH07XG4gICAgICAgIHRoaXNbcGluc11bcGluXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoc3VwcG9ydGVkTW9kZXMpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UubW9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICBzd2l0Y2goaW5zdGFuY2UubW9kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBGaWxsIGluIHRoZSBob2xlc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzW3BpbnNdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghdGhpc1twaW5zXVtpXSkge1xuICAgICAgICAgIHRoaXNbcGluc11baV0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKFtdKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBVTktOT1dOX01PREU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNldCgpIHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpc1tpc1JlYWR5XSA9IHRydWU7XG4gICAgICB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG4gICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRocm93ICdyZXNldCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknO1xuICB9XG5cbiAgbm9ybWFsaXplKHBpbikge1xuICAgIHZhciBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgaWYgKHR5cGVvZiBub3JtYWxpemVkUGluID09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcGluIFwiJyArIHBpbiArICdcIicpO1xuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplZFBpbjtcbiAgfVxuXG4gIFtnZXRQaW5JbnN0YW5jZV0ocGluKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl07XG4gICAgaWYgKCFwaW5JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHBpbiBcIicgKyBwaW4gKyAnXCInKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpbkluc3RhbmNlO1xuICB9XG5cbiAgcGluTW9kZShwaW4sIG1vZGUpIHtcbiAgICB2YXIgbm9ybWFsaXplZFBpbiA9IHRoaXMubm9ybWFsaXplKHBpbik7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0obm9ybWFsaXplZFBpbik7XG4gICAgaWYgKHRoaXNbcGluc11bbm9ybWFsaXplZFBpbl0uc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihtb2RlKSA9PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQaW4gXCInICsgcGluICsgJ1wiIGRvZXMgbm90IHN1cHBvcnQgbW9kZSBcIicgKyBtb2RlICsgJ1wiJyk7XG4gICAgfVxuICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbElucHV0KG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbE91dHB1dChub3JtYWxpemVkUGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFBXTV9NT0RFOlxuICAgICAgY2FzZSBTRVJWT19NT0RFOlxuICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFBXTShub3JtYWxpemVkUGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLm1vZGUgPSBtb2RlO1xuICB9XG5cbiAgYW5hbG9nUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuYWxvZ1JlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBhbmFsb2dXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0ocGluKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBQV01fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgUFdNX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKE1hdGgucm91bmQodmFsdWUgKiAxMDAwIC8gMjU1KSk7XG4gIH1cblxuICBkaWdpdGFsUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IElOUFVUX01PREUpIHtcbiAgICAgIHRoaXMubW9kZShwaW4sIElOUFVUX01PREUpO1xuICAgIH1cbiAgICB2YXIgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PSBJTlBVVF9NT0RFKSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgfVxuICAgICAgaGFuZGxlciAmJiBoYW5kbGVyKHZhbHVlKTtcbiAgICAgIHRoaXMuZW1pdCgnZGlnaXRhbC1yZWFkLScgKyBwaW4sIHZhbHVlKTtcbiAgICB9LCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUpO1xuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwub24oJ2Rlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlnaXRhbFdyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IE9VVFBVVF9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBPVVRQVVRfTU9ERSk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAhPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSkge1xuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSA/IEhJR0ggOiBMT1cpO1xuICAgICAgcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBzZXJ2b1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFNFUlZPX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFNFUlZPX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKDQ4ICsgTWF0aC5yb3VuZCh2YWx1ZSAqIDQ4LyAxODApKTtcbiAgfVxuXG4gIHF1ZXJ5Q2FwYWJpbGl0aWVzKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5QW5hbG9nTWFwcGluZyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeVBpblN0YXRlKHBpbiwgY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgc2VuZEkyQ0NvbmZpZygpIHtcbiAgICB0aHJvdyAnc2VuZEkyQ0NvbmZpZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRJMkNXcml0ZVJlcXVlc3QoKSB7XG4gICAgdGhyb3cgJ3NlbmRJMkNXcml0ZVJlcXVlc3QgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kSTJDUmVhZFJlcXVlc3QoKSB7XG4gICAgdGhyb3cgJ3NlbmRJMkNSZWFkUmVxdWVzdCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNldFNhbXBsaW5nSW50ZXJ2YWwoKSB7XG4gICAgdGhyb3cgJ3NldFNhbXBsaW5nSW50ZXJ2YWwgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICByZXBvcnRBbmFsb2dQaW4oKSB7XG4gICAgdGhyb3cgJ3JlcG9ydEFuYWxvZ1BpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHJlcG9ydERpZ2l0YWxQaW4oKSB7XG4gICAgdGhyb3cgJ3JlcG9ydERpZ2l0YWxQaW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBwdWxzZUluKCkge1xuICAgIHRocm93ICdwdWxzZUluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc3RlcHBlckNvbmZpZygpIHtcbiAgICB0aHJvdyAnc3RlcHBlckNvbmZpZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHN0ZXBwZXJTdGVwKCkge1xuICAgIHRocm93ICdzdGVwcGVyU3RlcCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlQ29uZmlnKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZUNvbmZpZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlU2VhcmNoKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVNlYXJjaCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlQWxhcm1zU2VhcmNoKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVhZCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVSZWFkIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZXNldCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVSZXNldCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGUoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlV3JpdGUgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZURlbGF5KCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZURlbGF5IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlV3JpdGVBbmRSZWFkIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSYXNwaSwgJ2lzUmFzcGJlcnJ5UGknLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIHZhbHVlOiAoKSA9PiB7XG4gICAgLy8gRGV0ZXJtaW5pbmcgaWYgYSBzeXN0ZW0gaXMgYSBSYXNwYmVycnkgUGkgaXNuJ3QgcG9zc2libGUgdGhyb3VnaFxuICAgIC8vIHRoZSBvcyBtb2R1bGUgb24gUmFzcGJpYW4sIHNvIHdlIHJlYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0gaW5zdGVhZFxuICAgIHZhciBpc1Jhc3BiZXJyeVBpID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGlzUmFzcGJlcnJ5UGkgPSBmcy5yZWFkRmlsZVN5bmMoJy9ldGMvb3MtcmVsZWFzZScpLnRvU3RyaW5nKCkuaW5kZXhPZignUmFzcGJpYW4nKSAhPT0gLTE7XG4gICAgfSBjYXRjaChlKSB7fS8vIFNxdWFzaCBmaWxlIG5vdCBmb3VuZCwgZXRjIGVycm9yc1xuICAgIHJldHVybiBpc1Jhc3BiZXJyeVBpO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSYXNwaTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
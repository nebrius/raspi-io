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

var EventEmitter = require("events").EventEmitter;

var init = require("raspi").init;

var _raspiBoard = require("raspi-board");

var getPins = _raspiBoard.getPins;
var getPinNumber = _raspiBoard.getPinNumber;

var _raspiGpio = require("raspi-gpio");

var DigitalOutput = _raspiGpio.DigitalOutput;
var DigitalInput = _raspiGpio.DigitalInput;

var PWM = require("raspi-pwm").PWM;

var I2C = require("raspi-i2c").I2C;

var LED = require("raspi-led").LED;

// Hacky quick Symbol polyfill, since es6-symbol refuses to install with Node 0.10 from http://node-arm.herokuapp.com/
if (typeof global.Symbol != "function") {
  global.Symbol = function (name) {
    return "__$raspi_symbol_" + name + "_" + Math.round(Math.random() * 268435455) + "$__";
  };
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

var LED_PIN = -1;

// Settings
var DIGITAL_READ_UPDATE_RATE = 19;

// Private symbols
var isReady = Symbol("isReady");
var pins = Symbol("pins");
var instances = Symbol("instances");
var analogPins = Symbol("analogPins");
var getPinInstance = Symbol("getPinInstance");
var i2c = Symbol("i2c");
var i2cDelay = Symbol("i2cDelay");
var i2cRead = Symbol("i2cRead");
var i2cCheckAlive = Symbol("i2cCheckAlive");

var Raspi = (function (EventEmitter) {
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

      _defineProperty(_Object$defineProperties, i2c, {
        writable: true,
        value: new I2C()
      });

      _defineProperty(_Object$defineProperties, i2cDelay, {
        writable: true,
        value: 0
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
        value: LED_PIN
      });

      return _Object$defineProperties;
    })());

    init(function () {
      var pinMappings = getPins();
      _this4[pins] = [];

      // Slight hack to get the LED in there, since it's not actually a pin
      pinMappings[LED_PIN] = {
        pins: [LED_PIN],
        peripherals: ["gpio"]
      };

      Object.keys(pinMappings).forEach(function (pin) {
        var pinInfo = pinMappings[pin];
        var supportedModes = [INPUT_MODE, OUTPUT_MODE];
        if (pinInfo.peripherals.indexOf("pwm") != -1) {
          supportedModes.push(PWM_MODE, SERVO_MODE);
        }
        var instance = _this4[instances][pin] = {
          peripheral: null,
          mode: UNKNOWN_MODE,
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
                case OUTPUT_MODE:
                  return instance.previousWrittenValue;
                default:
                  return null;
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
      });

      // Fill in the holes, sins pins are sparse on the A+/B+/2
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

  _inherits(Raspi, EventEmitter);

  _prototypeProperties(Raspi, null, (function () {
    var _prototypeProperties2 = {
      reset: {
        value: function reset() {
          throw new Error("reset is not supported on the Raspberry Pi");
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
        if (pin == LED_PIN && !(pinInstance.peripheral instanceof LED)) {
          pinInstance.peripheral = new LED();
        } else {
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
            default:
              console.warn("Unknown pin mode: " + mode);
              break;
          }
        }
        pinInstance.mode = mode;
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "analogRead", {
      value: function analogRead() {
        throw new Error("analogRead is not supported on the Raspberry Pi");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "analogWrite", {
      value: function analogWrite(pin, value) {
        var pinInstance = this[getPinInstance](this.normalize(pin));
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

        var pinInstance = this[getPinInstance](this.normalize(pin));
        if (pinInstance.mode != INPUT_MODE) {
          this.pinMode(pin, INPUT_MODE);
        }
        var interval = setInterval(function () {
          var value = undefined;
          if (pinInstance.mode == INPUT_MODE) {
            value = pinInstance.peripheral.read();
          } else {
            value = pinInstance.previousWrittenValue;
          }
          if (handler) {
            handler(value);
          }
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
        var pinInstance = this[getPinInstance](this.normalize(pin));
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
        var pinInstance = this[getPinInstance](this.normalize(pin));
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

    _defineProperty(_prototypeProperties2, i2cCheckAlive, {
      value: function () {
        if (!this[i2c].alive) {
          throw new Error("I2C pins not in I2C mode");
        }
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "i2cConfig", {
      value: function i2cConfig(options) {
        var delay = undefined;

        if (typeof options === "number") {
          delay = options;
        } else {
          if (typeof options === "object" && options !== null) {
            delay = options.delay;
          }
        }

        this[i2cCheckAlive]();

        this[i2cDelay] = delay || 0;

        return this;
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "i2cWrite", {
      value: function i2cWrite(address, cmdRegOrData, inBytes) {
        this[i2cCheckAlive]();

        // If i2cWrite was used for an i2cWriteReg call...
        if (arguments.length === 3 && !Array.isArray(cmdRegOrData) && !Array.isArray(inBytes)) {
          return this.i2cWriteReg(address, cmdRegOrData, inBytes);
        }

        // Fix arguments if called with Firmata.js API
        if (arguments.length === 2) {
          if (Array.isArray(cmdRegOrData)) {
            inBytes = cmdRegOrData.slice();
            cmdRegOrData = inBytes.shift();
          } else {
            inBytes = [];
          }
        }

        var buffer = new Buffer([cmdRegOrData].concat(inBytes));

        // Only write if bytes provided
        if (buffer.length) {
          this[i2c].writeSync(address, buffer);
        }

        return this;
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "i2cWriteReg", {
      value: function i2cWriteReg(address, register, value) {
        this[i2cCheckAlive]();

        this[i2c].writeByteSync(address, register, value);

        return this;
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, i2cRead, {
      value: function (continuous, address, register, bytesToRead, callback) {
        var _this = this;

        this[i2cCheckAlive]();

        // Fix arguments if called with Firmata.js API
        if (arguments.length == 4 && typeof register == "number" && typeof bytesToRead == "function") {
          callback = bytesToRead;
          bytesToRead = register;
          register = null;
        }

        callback = typeof callback === "function" ? callback : function () {};

        var event = "I2C-reply" + address + "-";
        event += register !== null ? register : 0;

        var read = function () {
          var afterRead = function (err, buffer) {
            if (err) {
              return _this.emit("error", err);
            }

            // Convert buffer to Array before emit
            _this.emit(event, Array.prototype.slice.call(buffer));

            if (continuous) {
              setTimeout(read, _this[i2cDelay]);
            }
          };

          _this.once(event, callback);

          if (register !== null) {
            _this[i2c].read(address, register, bytesToRead, afterRead);
          } else {
            _this[i2c].read(address, bytesToRead, afterRead);
          }
        };

        setTimeout(read, this[i2cDelay]);

        return this;
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "i2cRead", {
      value: (function (_i2cRead) {
        var _i2cReadWrapper = function i2cRead() {
          return _i2cRead.apply(this, arguments);
        };

        _i2cReadWrapper.toString = function () {
          return _i2cRead.toString();
        };

        return _i2cReadWrapper;
      })(function () {
        var _ref;

        for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
          rest[_key] = arguments[_key];
        }

        return (_ref = this)[i2cRead].apply(_ref, [true].concat(rest));
      }),
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "i2cReadOnce", {
      value: function i2cReadOnce() {
        var _ref;

        for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
          rest[_key] = arguments[_key];
        }

        return (_ref = this)[i2cRead].apply(_ref, [false].concat(rest));
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendI2CConfig", {
      value: function sendI2CConfig() {
        var _ref;

        for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
          rest[_key] = arguments[_key];
        }

        return (_ref = this).i2cConfig.apply(_ref, rest);
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendI2CWriteRequest", {
      value: function sendI2CWriteRequest() {
        var _ref;

        for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
          rest[_key] = arguments[_key];
        }

        return (_ref = this).i2cWrite.apply(_ref, rest);
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendI2CReadRequest", {
      value: function sendI2CReadRequest() {
        var _ref;

        for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
          rest[_key] = arguments[_key];
        }

        return (_ref = this).i2cReadOnce.apply(_ref, rest);
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireConfig", {
      value: function sendOneWireConfig() {
        throw new Error("sendOneWireConfig is not supported on the Raspberry Pi");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireSearch", {
      value: function sendOneWireSearch() {
        throw new Error("sendOneWireSearch is not supported on the Raspberry Pi");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireAlarmsSearch", {
      value: function sendOneWireAlarmsSearch() {
        throw new Error("sendOneWireAlarmsSearch is not supported on the Raspberry Pi");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireRead", {
      value: function sendOneWireRead() {
        throw new Error("sendOneWireRead is not supported on the Raspberry Pi");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireReset", {
      value: function sendOneWireReset() {
        throw new Error("sendOneWireConfig is not supported on the Raspberry Pi");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireWrite", {
      value: function sendOneWireWrite() {
        throw new Error("sendOneWireWrite is not supported on the Raspberry Pi");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireDelay", {
      value: function sendOneWireDelay() {
        throw new Error("sendOneWireDelay is not supported on the Raspberry Pi");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "sendOneWireWriteAndRead", {
      value: function sendOneWireWriteAndRead() {
        throw new Error("sendOneWireWriteAndRead is not supported on the Raspberry Pi");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "setSamplingInterval", {
      value: function setSamplingInterval() {
        throw new Error("setSamplingInterval is not yet implemented");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "reportAnalogPin", {
      value: function reportAnalogPin() {
        throw new Error("reportAnalogPin is not yet implemented");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "reportDigitalPin", {
      value: function reportDigitalPin() {
        throw new Error("reportDigitalPin is not yet implemented");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "pingRead", {
      value: function pingRead() {
        throw new Error("pingRead is not yet implemented");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "pulseIn", {
      value: function pulseIn() {
        throw new Error("pulseIn is not yet implemented");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "stepperConfig", {
      value: function stepperConfig() {
        throw new Error("stepperConfig is not yet implemented");
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "stepperStep", {
      value: function stepperStep() {
        throw new Error("stepperStep is not yet implemented");
      },
      writable: true,
      configurable: true
    });

    return _prototypeProperties2;
  })());

  return Raspi;
})(EventEmitter);

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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFO0FBQzVDLFlBQVUsRUFBRSxJQUFJO0FBQ2hCLE9BQUssRUFBRSxZQUFNOzs7QUFHWCxRQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFDMUIsUUFBSTtBQUNGLG1CQUFhLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUMxRixDQUFDLE9BQU0sQ0FBQyxFQUFFLEVBQUU7QUFDYixXQUFPLGFBQWEsQ0FBQztHQUN0QjtDQUNGLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQgQnJ5YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG5vYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvblxuZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxucmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG5jb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG5Tb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFU1xuT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUXG5IT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbldIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUlxuT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAncmFzcGknO1xuaW1wb3J0IHsgZ2V0UGlucywgZ2V0UGluTnVtYmVyIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuaW1wb3J0IHsgRGlnaXRhbE91dHB1dCwgRGlnaXRhbElucHV0IH0gZnJvbSAncmFzcGktZ3Bpbyc7XG5pbXBvcnQgeyBQV00gfSBmcm9tICdyYXNwaS1wd20nO1xuaW1wb3J0IHsgSTJDIH0gZnJvbSAncmFzcGktaTJjJztcbmltcG9ydCB7IExFRCB9IGZyb20gJ3Jhc3BpLWxlZCc7XG5cbi8vIEhhY2t5IHF1aWNrIFN5bWJvbCBwb2x5ZmlsbCwgc2luY2UgZXM2LXN5bWJvbCByZWZ1c2VzIHRvIGluc3RhbGwgd2l0aCBOb2RlIDAuMTAgZnJvbSBodHRwOi8vbm9kZS1hcm0uaGVyb2t1YXBwLmNvbS9cbmlmICh0eXBlb2YgZ2xvYmFsLlN5bWJvbCAhPSAnZnVuY3Rpb24nKSB7XG4gIGdsb2JhbC5TeW1ib2wgPSAobmFtZSkgPT4ge1xuICAgIHJldHVybiAnX18kcmFzcGlfc3ltYm9sXycgKyBuYW1lICsgJ18nICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMHhGRkZGRkZGKSArICckX18nO1xuICB9O1xufVxuXG4vLyBDb25zdGFudHNcbmNvbnN0IElOUFVUX01PREUgPSAwO1xuY29uc3QgT1VUUFVUX01PREUgPSAxO1xuY29uc3QgQU5BTE9HX01PREUgPSAyO1xuY29uc3QgUFdNX01PREUgPSAzO1xuY29uc3QgU0VSVk9fTU9ERSA9IDQ7XG5jb25zdCBVTktOT1dOX01PREUgPSA5OTtcblxuY29uc3QgTE9XID0gMDtcbmNvbnN0IEhJR0ggPSAxO1xuXG5jb25zdCBMRURfUElOID0gLTE7XG5cbi8vIFNldHRpbmdzXG5jb25zdCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUgPSAxOTtcblxuLy8gUHJpdmF0ZSBzeW1ib2xzXG5jb25zdCBpc1JlYWR5ID0gU3ltYm9sKCdpc1JlYWR5Jyk7XG5jb25zdCBwaW5zID0gU3ltYm9sKCdwaW5zJyk7XG5jb25zdCBpbnN0YW5jZXMgPSBTeW1ib2woJ2luc3RhbmNlcycpO1xuY29uc3QgYW5hbG9nUGlucyA9IFN5bWJvbCgnYW5hbG9nUGlucycpO1xuY29uc3QgZ2V0UGluSW5zdGFuY2UgPSBTeW1ib2woJ2dldFBpbkluc3RhbmNlJyk7XG5jb25zdCBpMmMgPSBTeW1ib2woJ2kyYycpO1xuY29uc3QgaTJjRGVsYXkgPSBTeW1ib2woJ2kyY0RlbGF5Jyk7XG5jb25zdCBpMmNSZWFkID0gU3ltYm9sKCdpMmNSZWFkJyk7XG5jb25zdCBpMmNDaGVja0FsaXZlID0gU3ltYm9sKCdpMmNDaGVja0FsaXZlJyk7XG5cblxuY2xhc3MgUmFzcGkgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAnUmFzcGJlcnJ5UGktSU8nXG4gICAgICB9LFxuXG4gICAgICBbaW5zdGFuY2VzXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuXG4gICAgICBbaXNSZWFkeV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGlzUmVhZHk6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2lzUmVhZHldO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbcGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIHBpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW3BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbYW5hbG9nUGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIGFuYWxvZ1BpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2FuYWxvZ1BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbaTJjXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IG5ldyBJMkMoKVxuICAgICAgfSxcblxuICAgICAgW2kyY0RlbGF5XToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IDBcbiAgICAgIH0sXG5cbiAgICAgIE1PREVTOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICBJTlBVVDogSU5QVVRfTU9ERSxcbiAgICAgICAgICBPVVRQVVQ6IE9VVFBVVF9NT0RFLFxuICAgICAgICAgIEFOQUxPRzogQU5BTE9HX01PREUsXG4gICAgICAgICAgUFdNOiBQV01fTU9ERSxcbiAgICAgICAgICBTRVJWTzogU0VSVk9fTU9ERVxuICAgICAgICB9KVxuICAgICAgfSxcblxuICAgICAgSElHSDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSElHSFxuICAgICAgfSxcbiAgICAgIExPVzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTE9XXG4gICAgICB9LFxuXG4gICAgICBkZWZhdWx0TGVkOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMRURfUElOXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpbml0KCgpID0+IHtcbiAgICAgIGNvbnN0IHBpbk1hcHBpbmdzID0gZ2V0UGlucygpO1xuICAgICAgdGhpc1twaW5zXSA9IFtdO1xuXG4gICAgICAvLyBTbGlnaHQgaGFjayB0byBnZXQgdGhlIExFRCBpbiB0aGVyZSwgc2luY2UgaXQncyBub3QgYWN0dWFsbHkgYSBwaW5cbiAgICAgIHBpbk1hcHBpbmdzW0xFRF9QSU5dID0ge1xuICAgICAgICBwaW5zOiBbIExFRF9QSU4gXSxcbiAgICAgICAgcGVyaXBoZXJhbHM6IFsgJ2dwaW8nIF1cbiAgICAgIH07XG5cbiAgICAgIE9iamVjdC5rZXlzKHBpbk1hcHBpbmdzKS5mb3JFYWNoKChwaW4pID0+IHtcbiAgICAgICAgY29uc3QgcGluSW5mbyA9IHBpbk1hcHBpbmdzW3Bpbl07XG4gICAgICAgIGNvbnN0IHN1cHBvcnRlZE1vZGVzID0gWyBJTlBVVF9NT0RFLCBPVVRQVVRfTU9ERSBdO1xuICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdwd20nKSAhPSAtMSkge1xuICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goUFdNX01PREUsIFNFUlZPX01PREUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl0gPSB7XG4gICAgICAgICAgcGVyaXBoZXJhbDogbnVsbCxcbiAgICAgICAgICBtb2RlOiBVTktOT1dOX01PREUsXG4gICAgICAgICAgcHJldmlvdXNXcml0dGVuVmFsdWU6IExPV1xuICAgICAgICB9O1xuICAgICAgICB0aGlzW3BpbnNdW3Bpbl0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHN1cHBvcnRlZE1vZGVzKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLm1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgc3dpdGNoIChpbnN0YW5jZS5tb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnBlcmlwaGVyYWwucmVhZCgpO1xuICAgICAgICAgICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5tb2RlID09IE9VVFBVVF9NT0RFKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgLy8gRmlsbCBpbiB0aGUgaG9sZXMsIHNpbnMgcGlucyBhcmUgc3BhcnNlIG9uIHRoZSBBKy9CKy8yXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXNbcGluc10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzW3BpbnNdW2ldKSB7XG4gICAgICAgICAgdGhpc1twaW5zXVtpXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoW10pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVOS05PV05fTU9ERTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0KCkge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzW2lzUmVhZHldID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW1pdCgncmVhZHknKTtcbiAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXNldCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIG5vcm1hbGl6ZShwaW4pIHtcbiAgICBjb25zdCBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgaWYgKHR5cGVvZiBub3JtYWxpemVkUGluID09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcGluIFwiJyArIHBpbiArICdcIicpO1xuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplZFBpbjtcbiAgfVxuXG4gIFtnZXRQaW5JbnN0YW5jZV0ocGluKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXTtcbiAgICBpZiAoIXBpbkluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcGluIFwiJyArIHBpbiArICdcIicpO1xuICAgIH1cbiAgICByZXR1cm4gcGluSW5zdGFuY2U7XG4gIH1cblxuICBwaW5Nb2RlKHBpbiwgbW9kZSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0obm9ybWFsaXplZFBpbik7XG4gICAgaWYgKHRoaXNbcGluc11bbm9ybWFsaXplZFBpbl0uc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihtb2RlKSA9PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQaW4gXCInICsgcGluICsgJ1wiIGRvZXMgbm90IHN1cHBvcnQgbW9kZSBcIicgKyBtb2RlICsgJ1wiJyk7XG4gICAgfVxuICAgIGlmIChwaW4gPT0gTEVEX1BJTiAmJiAhKHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgaW5zdGFuY2VvZiBMRUQpKSB7XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IExFRCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbElucHV0KG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbE91dHB1dChub3JtYWxpemVkUGluKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQV01fTU9ERTpcbiAgICAgICAgY2FzZSBTRVJWT19NT0RFOlxuICAgICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgUFdNKG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUud2FybignVW5rbm93biBwaW4gbW9kZTogJyArIG1vZGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5tb2RlID0gbW9kZTtcbiAgfVxuXG4gIGFuYWxvZ1JlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhbmFsb2dSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgYW5hbG9nV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gUFdNX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFBXTV9NT0RFKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShNYXRoLnJvdW5kKHZhbHVlICogMTAwMCAvIDI1NSkpO1xuICB9XG5cbiAgZGlnaXRhbFJlYWQocGluLCBoYW5kbGVyKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBJTlBVVF9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBJTlBVVF9NT0RFKTtcbiAgICB9XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBsZXQgdmFsdWU7XG4gICAgICBpZiAocGluSW5zdGFuY2UubW9kZSA9PSBJTlBVVF9NT0RFKSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgaGFuZGxlcih2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ2RpZ2l0YWwtcmVhZC0nICsgcGluLCB2YWx1ZSk7XG4gICAgfSwgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFKTtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLm9uKCdkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2l0YWxXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBPVVRQVVRfTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgT1VUUFVUX01PREUpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgIT0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUpIHtcbiAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUgPyBISUdIIDogTE9XKTtcbiAgICAgIHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgc2Vydm9Xcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBTRVJWT19NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBTRVJWT19NT0RFKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSg0OCArIE1hdGgucm91bmQodmFsdWUgKiA0OCAvIDE4MCkpO1xuICB9XG5cbiAgcXVlcnlDYXBhYmlsaXRpZXMoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlBbmFsb2dNYXBwaW5nKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5UGluU3RhdGUocGluLCBjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBbaTJjQ2hlY2tBbGl2ZV0oKSB7XG4gICAgaWYgKCF0aGlzW2kyY10uYWxpdmUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSTJDIHBpbnMgbm90IGluIEkyQyBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgaTJjQ29uZmlnKG9wdGlvbnMpIHtcbiAgICBsZXQgZGVsYXk7XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICBkZWxheSA9IG9wdGlvbnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICBkZWxheSA9IG9wdGlvbnMuZGVsYXk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgdGhpc1tpMmNEZWxheV0gPSBkZWxheSB8fCAwO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZShhZGRyZXNzLCBjbWRSZWdPckRhdGEsIGluQnl0ZXMpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICAvLyBJZiBpMmNXcml0ZSB3YXMgdXNlZCBmb3IgYW4gaTJjV3JpdGVSZWcgY2FsbC4uLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoaW5CeXRlcykpIHtcbiAgICAgIHJldHVybiB0aGlzLmkyY1dyaXRlUmVnKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcyk7XG4gICAgfVxuXG4gICAgLy8gRml4IGFyZ3VtZW50cyBpZiBjYWxsZWQgd2l0aCBGaXJtYXRhLmpzIEFQSVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjbWRSZWdPckRhdGEpKSB7XG4gICAgICAgIGluQnl0ZXMgPSBjbWRSZWdPckRhdGEuc2xpY2UoKTtcbiAgICAgICAgY21kUmVnT3JEYXRhID0gaW5CeXRlcy5zaGlmdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5CeXRlcyA9IFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBCdWZmZXIoW2NtZFJlZ09yRGF0YV0uY29uY2F0KGluQnl0ZXMpKTtcblxuICAgIC8vIE9ubHkgd3JpdGUgaWYgYnl0ZXMgcHJvdmlkZWRcbiAgICBpZiAoYnVmZmVyLmxlbmd0aCkge1xuICAgICAgdGhpc1tpMmNdLndyaXRlU3luYyhhZGRyZXNzLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjV3JpdGVSZWcoYWRkcmVzcywgcmVnaXN0ZXIsIHZhbHVlKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgdGhpc1tpMmNdLndyaXRlQnl0ZVN5bmMoYWRkcmVzcywgcmVnaXN0ZXIsIHZhbHVlKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgW2kyY1JlYWRdKGNvbnRpbnVvdXMsIGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlc1RvUmVhZCwgY2FsbGJhY2spIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICAvLyBGaXggYXJndW1lbnRzIGlmIGNhbGxlZCB3aXRoIEZpcm1hdGEuanMgQVBJXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNCAmJlxuICAgICAgdHlwZW9mIHJlZ2lzdGVyID09ICdudW1iZXInICYmXG4gICAgICB0eXBlb2YgYnl0ZXNUb1JlYWQgPT0gJ2Z1bmN0aW9uJ1xuICAgICkge1xuICAgICAgY2FsbGJhY2sgPSBieXRlc1RvUmVhZDtcbiAgICAgIGJ5dGVzVG9SZWFkID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IG51bGw7XG4gICAgfVxuXG4gICAgY2FsbGJhY2sgPSB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6ICgpID0+IHt9O1xuXG4gICAgbGV0IGV2ZW50ID0gJ0kyQy1yZXBseScgKyBhZGRyZXNzICsgJy0nO1xuICAgIGV2ZW50ICs9IHJlZ2lzdGVyICE9PSBudWxsID8gcmVnaXN0ZXIgOiAwO1xuXG4gICAgY29uc3QgcmVhZCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGFmdGVyUmVhZCA9IChlcnIsIGJ1ZmZlcikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udmVydCBidWZmZXIgdG8gQXJyYXkgYmVmb3JlIGVtaXRcbiAgICAgICAgdGhpcy5lbWl0KGV2ZW50LCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChidWZmZXIpKTtcblxuICAgICAgICBpZiAoY29udGludW91cykge1xuICAgICAgICAgIHNldFRpbWVvdXQocmVhZCwgdGhpc1tpMmNEZWxheV0pO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLm9uY2UoZXZlbnQsIGNhbGxiYWNrKTtcblxuICAgICAgaWYgKHJlZ2lzdGVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXNbaTJjXS5yZWFkKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlc1RvUmVhZCwgYWZ0ZXJSZWFkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNbaTJjXS5yZWFkKGFkZHJlc3MsIGJ5dGVzVG9SZWFkLCBhZnRlclJlYWQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzZXRUaW1lb3V0KHJlYWQsIHRoaXNbaTJjRGVsYXldKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaTJjUmVhZCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXNbaTJjUmVhZF0odHJ1ZSwgLi4ucmVzdCk7XG4gIH1cblxuICBpMmNSZWFkT25jZSguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXNbaTJjUmVhZF0oZmFsc2UsIC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ0NvbmZpZyguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjQ29uZmlnKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ1dyaXRlUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjV3JpdGUoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDUmVhZFJlcXVlc3QoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY1JlYWRPbmNlKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVDb25maWcoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZUNvbmZpZyBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlU2VhcmNoKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVTZWFyY2ggaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQWxhcm1zU2VhcmNoIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVSZWFkIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZXNldCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlV3JpdGUgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZURlbGF5KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVEZWxheSBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGVBbmRSZWFkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZXRTYW1wbGluZ0ludGVydmFsKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0U2FtcGxpbmdJbnRlcnZhbCBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZXBvcnRBbmFsb2dQaW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZXBvcnRBbmFsb2dQaW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcmVwb3J0RGlnaXRhbFBpbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcG9ydERpZ2l0YWxQaW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgcGluZ1JlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwaW5nUmVhZCBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBwdWxzZUluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHVsc2VJbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzdGVwcGVyQ29uZmlnKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc3RlcHBlckNvbmZpZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBzdGVwcGVyU3RlcCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0ZXBwZXJTdGVwIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUmFzcGksICdpc1Jhc3BiZXJyeVBpJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICB2YWx1ZTogKCkgPT4ge1xuICAgIC8vIERldGVybWluaW5nIGlmIGEgc3lzdGVtIGlzIGEgUmFzcGJlcnJ5IFBpIGlzbid0IHBvc3NpYmxlIHRocm91Z2hcbiAgICAvLyB0aGUgb3MgbW9kdWxlIG9uIFJhc3BiaWFuLCBzbyB3ZSByZWFkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtIGluc3RlYWRcbiAgICBsZXQgaXNSYXNwYmVycnlQaSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBpc1Jhc3BiZXJyeVBpID0gZnMucmVhZEZpbGVTeW5jKCcvZXRjL29zLXJlbGVhc2UnKS50b1N0cmluZygpLmluZGV4T2YoJ1Jhc3BiaWFuJykgIT09IC0xO1xuICAgIH0gY2F0Y2goZSkge30vLyBTcXVhc2ggZmlsZSBub3QgZm91bmQsIGV0YyBlcnJvcnNcbiAgICByZXR1cm4gaXNSYXNwYmVycnlQaTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFzcGk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
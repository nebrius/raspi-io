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

var Symbol = _interopRequire(require("es6-symbol"));

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
var isReady = Symbol();
var pins = Symbol();
var instances = Symbol();
var analogPins = Symbol();
var mode = Symbol();
var getPinInstance = Symbol();
var i2c = Symbol();
var i2cDelay = Symbol();
var i2cRead = Symbol();
var i2cCheckAlive = Symbol();

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
                  break;
                case OUTPUT_MODE:
                  return instance.previousWrittenValue;
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
          }
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
      value: function i2cConfig(delay) {
        this[i2cCheckAlive]();

        this[i2cDelay] = delay || 0;

        return this;
      },
      writable: true,
      configurable: true
    });

    _defineProperty(_prototypeProperties2, "i2cWrite", {

      // this method supports both
      // i2cWrite(address, register, inBytes)
      // and
      // i2cWrite(address, inBytes)

      value: function i2cWrite(address, cmdRegOrData, inBytes) {
        /**
         * cmdRegOrData:
         * [... arbitrary bytes]
         *
         * or
         *
         * cmdRegOrData, inBytes:
         * command [, ...]
         *
         */
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
        if (arguments.length === 4 && typeof register === "number" && typeof bytesToRead === "function") {
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

      // this method supports both
      // i2cRead(address, register, bytesToRead, handler)
      // and
      // i2cRead(address, bytesToRead, handler)

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

      // this method supports both
      // i2cReadOnce(address, register, bytesToRead, handler)
      // and
      // i2cReadOnce(address, bytesToRead, handler)

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
//# sourceMappingURL=data:application/json;base64,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LGNBQWMsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFO0FBQzVDLFlBQVUsRUFBRSxJQUFJO0FBQ2hCLE9BQUssRUFBRSxZQUFNOzs7QUFHWCxRQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFDMUIsUUFBSTtBQUNGLG1CQUFhLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUMxRixDQUFDLE9BQU0sQ0FBQyxFQUFFLEVBQUU7QUFDYixXQUFPLGFBQWEsQ0FBQztHQUN0QjtDQUNGLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQgQnJ5YW4gSHVnaGVzIDxicnlhbkB0aGVvcmV0aWNhbGlkZWF0aW9ucy5jb20+XG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG5vYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvblxuZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxucmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG5jb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG5Tb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFU1xuT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbk5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUXG5IT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbldIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUlxuT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBldmVudHMgZnJvbSAnZXZlbnRzJztcbmltcG9ydCBTeW1ib2wgZnJvbSAnZXM2LXN5bWJvbCc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAncmFzcGknO1xuaW1wb3J0IHsgZ2V0UGlucywgZ2V0UGluTnVtYmVyIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuaW1wb3J0IHsgRGlnaXRhbE91dHB1dCwgRGlnaXRhbElucHV0IH0gZnJvbSAncmFzcGktZ3Bpbyc7XG5pbXBvcnQgeyBQV00gfSBmcm9tICdyYXNwaS1wd20nO1xuaW1wb3J0IHsgSTJDIH0gZnJvbSAncmFzcGktaTJjJztcbmltcG9ydCB7IExFRCB9IGZyb20gJ3Jhc3BpLWxlZCc7XG5cbi8vIENvbnN0YW50c1xudmFyIElOUFVUX01PREUgPSAwO1xudmFyIE9VVFBVVF9NT0RFID0gMTtcbnZhciBBTkFMT0dfTU9ERSA9IDI7XG52YXIgUFdNX01PREUgPSAzO1xudmFyIFNFUlZPX01PREUgPSA0O1xudmFyIFVOS05PV05fTU9ERSA9IDk5O1xuXG52YXIgTE9XID0gMDtcbnZhciBISUdIID0gMTtcblxudmFyIExFRF9QSU4gPSAtMTtcblxuLy8gU2V0dGluZ3NcbnZhciBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUgPSAxOTtcblxuLy8gUHJpdmF0ZSBzeW1ib2xzXG52YXIgaXNSZWFkeSA9IFN5bWJvbCgpO1xudmFyIHBpbnMgPSBTeW1ib2woKTtcbnZhciBpbnN0YW5jZXMgPSBTeW1ib2woKTtcbnZhciBhbmFsb2dQaW5zID0gU3ltYm9sKCk7XG52YXIgbW9kZSA9IFN5bWJvbCgpO1xudmFyIGdldFBpbkluc3RhbmNlID0gU3ltYm9sKCk7XG52YXIgaTJjID0gU3ltYm9sKCk7XG52YXIgaTJjRGVsYXkgPSBTeW1ib2woKTtcbnZhciBpMmNSZWFkID0gU3ltYm9sKCk7XG52YXIgaTJjQ2hlY2tBbGl2ZSA9IFN5bWJvbCgpO1xuXG5cbmNsYXNzIFJhc3BpIGV4dGVuZHMgZXZlbnRzLkV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6ICdSYXNwYmVycnlQaS1JTydcbiAgICAgIH0sXG5cbiAgICAgIFtpbnN0YW5jZXNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1JlYWR5XToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuICAgICAgaXNSZWFkeToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbaXNSZWFkeV07XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFtwaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgcGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbcGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFthbmFsb2dQaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgYW5hbG9nUGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbYW5hbG9nUGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFtpMmNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogbmV3IEkyQygpXG4gICAgICB9LFxuXG4gICAgICBbaTJjRGVsYXldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogMFxuICAgICAgfSxcblxuICAgICAgTU9ERVM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIElOUFVUOiBJTlBVVF9NT0RFLFxuICAgICAgICAgIE9VVFBVVDogT1VUUFVUX01PREUsXG4gICAgICAgICAgQU5BTE9HOiBBTkFMT0dfTU9ERSxcbiAgICAgICAgICBQV006IFBXTV9NT0RFLFxuICAgICAgICAgIFNFUlZPOiBTRVJWT19NT0RFXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBISUdIOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBISUdIXG4gICAgICB9LFxuICAgICAgTE9XOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMT1dcbiAgICAgIH0sXG5cbiAgICAgIGRlZmF1bHRMZWQ6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExFRF9QSU5cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGluaXQoKCkgPT4ge1xuICAgICAgdmFyIHBpbk1hcHBpbmdzID0gZ2V0UGlucygpO1xuICAgICAgdGhpc1twaW5zXSA9IFtdO1xuXG4gICAgICAvLyBTbGlnaHQgaGFjayB0byBnZXQgdGhlIExFRCBpbiB0aGVyZSwgc2luY2UgaXQncyBub3QgYWN0dWFsbHkgYSBwaW5cbiAgICAgIHBpbk1hcHBpbmdzW0xFRF9QSU5dID0ge1xuICAgICAgICBwaW5zOiBbIExFRF9QSU4gXSxcbiAgICAgICAgcGVyaXBoZXJhbHM6IFsgJ2dwaW8nIF1cbiAgICAgIH07XG5cbiAgICAgIE9iamVjdC5rZXlzKHBpbk1hcHBpbmdzKS5mb3JFYWNoKChwaW4pID0+IHtcbiAgICAgICAgdmFyIHBpbkluZm8gPSBwaW5NYXBwaW5nc1twaW5dO1xuICAgICAgICB2YXIgc3VwcG9ydGVkTW9kZXMgPSBbIElOUFVUX01PREUsIE9VVFBVVF9NT0RFIF07XG4gICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xKSB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChQV01fTU9ERSwgU0VSVk9fTU9ERSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl0gPSB7XG4gICAgICAgICAgcGVyaXBoZXJhbDogbnVsbCxcbiAgICAgICAgICBtb2RlOiBVTktOT1dOX01PREUsXG4gICAgICAgICAgcHJldmlvdXNXcml0dGVuVmFsdWU6IExPV1xuICAgICAgICB9O1xuICAgICAgICB0aGlzW3BpbnNdW3Bpbl0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHN1cHBvcnRlZE1vZGVzKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLm1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgc3dpdGNoKGluc3RhbmNlLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBGaWxsIGluIHRoZSBob2xlcywgc2lucyBwaW5zIGFyZSBzcGFyc2Ugb24gdGhlIEErL0IrLzJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpc1twaW5zXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXRoaXNbcGluc11baV0pIHtcbiAgICAgICAgICB0aGlzW3BpbnNdW2ldID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShbXSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVU5LTk9XTl9NT0RFO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXQoKSB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXNbaXNSZWFkeV0gPSB0cnVlO1xuICAgICAgdGhpcy5lbWl0KCdyZWFkeScpO1xuICAgICAgdGhpcy5lbWl0KCdjb25uZWN0Jyk7XG4gICAgfSk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aHJvdyAncmVzZXQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJztcbiAgfVxuXG4gIG5vcm1hbGl6ZShwaW4pIHtcbiAgICB2YXIgbm9ybWFsaXplZFBpbiA9IGdldFBpbk51bWJlcihwaW4pO1xuICAgIGlmICh0eXBlb2Ygbm9ybWFsaXplZFBpbiA9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHBpbiBcIicgKyBwaW4gKyAnXCInKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRQaW47XG4gIH1cblxuICBbZ2V0UGluSW5zdGFuY2VdKHBpbikge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dO1xuICAgIGlmICghcGluSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwaW4gXCInICsgcGluICsgJ1wiJyk7XG4gICAgfVxuICAgIHJldHVybiBwaW5JbnN0YW5jZTtcbiAgfVxuXG4gIHBpbk1vZGUocGluLCBtb2RlKSB7XG4gICAgdmFyIG5vcm1hbGl6ZWRQaW4gPSB0aGlzLm5vcm1hbGl6ZShwaW4pO1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKG5vcm1hbGl6ZWRQaW4pO1xuICAgIGlmICh0aGlzW3BpbnNdW25vcm1hbGl6ZWRQaW5dLnN1cHBvcnRlZE1vZGVzLmluZGV4T2YobW9kZSkgPT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGluIFwiJyArIHBpbiArICdcIiBkb2VzIG5vdCBzdXBwb3J0IG1vZGUgXCInICsgbW9kZSArICdcIicpO1xuICAgIH1cbiAgICBpZiAocGluID09IExFRF9QSU4gJiYgIShwaW5JbnN0YW5jZS5wZXJpcGhlcmFsIGluc3RhbmNlb2YgTEVEKSkge1xuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBMRUQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoIChtb2RlKSB7XG4gICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxJbnB1dChub3JtYWxpemVkUGluKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxPdXRwdXQobm9ybWFsaXplZFBpbik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUFdNX01PREU6XG4gICAgICAgIGNhc2UgU0VSVk9fTU9ERTpcbiAgICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFBXTShub3JtYWxpemVkUGluKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcGluSW5zdGFuY2UubW9kZSA9IG1vZGU7XG4gIH1cblxuICBhbmFsb2dSZWFkKHBpbiwgaGFuZGxlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYW5hbG9nUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIGFuYWxvZ1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBQV01fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgUFdNX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKE1hdGgucm91bmQodmFsdWUgKiAxMDAwIC8gMjU1KSk7XG4gIH1cblxuICBkaWdpdGFsUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBJTlBVVF9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBJTlBVVF9NT0RFKTtcbiAgICB9XG4gICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdmFyIHZhbHVlO1xuICAgICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgPT0gSU5QVVRfTU9ERSkge1xuICAgICAgICB2YWx1ZSA9IHBpbkluc3RhbmNlLnBlcmlwaGVyYWwucmVhZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZTtcbiAgICAgIH1cbiAgICAgIGhhbmRsZXIgJiYgaGFuZGxlcih2YWx1ZSk7XG4gICAgICB0aGlzLmVtaXQoJ2RpZ2l0YWwtcmVhZC0nICsgcGluLCB2YWx1ZSk7XG4gICAgfSwgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFKTtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLm9uKCdkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2l0YWxXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gT1VUUFVUX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIE9VVFBVVF9NT0RFKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlICE9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlKSB7XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlID8gSElHSCA6IExPVyk7XG4gICAgICBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHNlcnZvV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFNFUlZPX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFNFUlZPX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKDQ4ICsgTWF0aC5yb3VuZCh2YWx1ZSAqIDQ4LyAxODApKTtcbiAgfVxuXG4gIHF1ZXJ5Q2FwYWJpbGl0aWVzKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5QW5hbG9nTWFwcGluZyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeVBpblN0YXRlKHBpbiwgY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgW2kyY0NoZWNrQWxpdmVdKCkge1xuICAgIGlmICghdGhpc1tpMmNdLmFsaXZlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0kyQyBwaW5zIG5vdCBpbiBJMkMgbW9kZScpO1xuICAgIH1cbiAgfVxuXG4gIGkyY0NvbmZpZyhkZWxheSkge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIHRoaXNbaTJjRGVsYXldID0gZGVsYXkgfHwgMDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gdGhpcyBtZXRob2Qgc3VwcG9ydHMgYm90aFxuICAvLyBpMmNXcml0ZShhZGRyZXNzLCByZWdpc3RlciwgaW5CeXRlcylcbiAgLy8gYW5kXG4gIC8vIGkyY1dyaXRlKGFkZHJlc3MsIGluQnl0ZXMpXG4gIGkyY1dyaXRlKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcykge1xuICAgIC8qKlxuICAgICAqIGNtZFJlZ09yRGF0YTpcbiAgICAgKiBbLi4uIGFyYml0cmFyeSBieXRlc11cbiAgICAgKlxuICAgICAqIG9yXG4gICAgICpcbiAgICAgKiBjbWRSZWdPckRhdGEsIGluQnl0ZXM6XG4gICAgICogY29tbWFuZCBbLCAuLi5dXG4gICAgICpcbiAgICAgKi9cbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICAvLyBJZiBpMmNXcml0ZSB3YXMgdXNlZCBmb3IgYW4gaTJjV3JpdGVSZWcgY2FsbC4uLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoaW5CeXRlcykpIHtcbiAgICAgIHJldHVybiB0aGlzLmkyY1dyaXRlUmVnKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcyk7XG4gICAgfVxuXG4gICAgLy8gRml4IGFyZ3VtZW50cyBpZiBjYWxsZWQgd2l0aCBGaXJtYXRhLmpzIEFQSVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjbWRSZWdPckRhdGEpKSB7XG4gICAgICAgIGluQnl0ZXMgPSBjbWRSZWdPckRhdGEuc2xpY2UoKTtcbiAgICAgICAgY21kUmVnT3JEYXRhID0gaW5CeXRlcy5zaGlmdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5CeXRlcyA9IFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKFtjbWRSZWdPckRhdGFdLmNvbmNhdChpbkJ5dGVzKSk7XG5cbiAgICAvLyBPbmx5IHdyaXRlIGlmIGJ5dGVzIHByb3ZpZGVkXG4gICAgaWYgKGJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgIHRoaXNbaTJjXS53cml0ZVN5bmMoYWRkcmVzcywgYnVmZmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1dyaXRlUmVnKGFkZHJlc3MsIHJlZ2lzdGVyLCB2YWx1ZSkge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIHRoaXNbaTJjXS53cml0ZUJ5dGVTeW5jKGFkZHJlc3MsIHJlZ2lzdGVyLCB2YWx1ZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIFtpMmNSZWFkXShjb250aW51b3VzLCBhZGRyZXNzLCByZWdpc3RlciwgYnl0ZXNUb1JlYWQsIGNhbGxiYWNrKSB7XG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgLy8gRml4IGFyZ3VtZW50cyBpZiBjYWxsZWQgd2l0aCBGaXJtYXRhLmpzIEFQSVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSA0ICYmXG4gICAgICAgIHR5cGVvZiByZWdpc3RlciA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgdHlwZW9mIGJ5dGVzVG9SZWFkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IGJ5dGVzVG9SZWFkO1xuICAgICAgYnl0ZXNUb1JlYWQgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBjYWxsYmFjayA9IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogKCkgPT4ge307XG5cbiAgICB2YXIgZXZlbnQgPSAnSTJDLXJlcGx5JyArIGFkZHJlc3MgKyAnLSc7XG4gICAgZXZlbnQgKz0gcmVnaXN0ZXIgIT09IG51bGwgPyByZWdpc3RlciA6IDA7XG5cbiAgICB2YXIgcmVhZCA9ICgpID0+IHtcbiAgICAgIHZhciBhZnRlclJlYWQgPSAoZXJyLCBidWZmZXIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnZlcnQgYnVmZmVyIHRvIEFycmF5IGJlZm9yZSBlbWl0XG4gICAgICAgIHRoaXMuZW1pdChldmVudCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYnVmZmVyKSk7XG5cbiAgICAgICAgaWYgKGNvbnRpbnVvdXMpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KHJlYWQsIHRoaXNbaTJjRGVsYXldKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5vbmNlKGV2ZW50LCBjYWxsYmFjayk7XG5cbiAgICAgIGlmIChyZWdpc3RlciAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzW2kyY10ucmVhZChhZGRyZXNzLCByZWdpc3RlciwgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzW2kyY10ucmVhZChhZGRyZXNzLCBieXRlc1RvUmVhZCwgYWZ0ZXJSZWFkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHRoaXMgbWV0aG9kIHN1cHBvcnRzIGJvdGhcbiAgLy8gaTJjUmVhZChhZGRyZXNzLCByZWdpc3RlciwgYnl0ZXNUb1JlYWQsIGhhbmRsZXIpXG4gIC8vIGFuZFxuICAvLyBpMmNSZWFkKGFkZHJlc3MsIGJ5dGVzVG9SZWFkLCBoYW5kbGVyKVxuICBpMmNSZWFkKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXSh0cnVlLCAuLi5yZXN0KTtcbiAgfVxuXG4gIC8vIHRoaXMgbWV0aG9kIHN1cHBvcnRzIGJvdGhcbiAgLy8gaTJjUmVhZE9uY2UoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBoYW5kbGVyKVxuICAvLyBhbmRcbiAgLy8gaTJjUmVhZE9uY2UoYWRkcmVzcywgYnl0ZXNUb1JlYWQsIGhhbmRsZXIpXG4gIGkyY1JlYWRPbmNlKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXShmYWxzZSwgLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDQ29uZmlnKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNDb25maWcoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDV3JpdGVSZXF1ZXN0KC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNXcml0ZSguLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNSZWFkUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjUmVhZE9uY2UoLi4ucmVzdCk7XG4gIH1cblxuICBzZXRTYW1wbGluZ0ludGVydmFsKCkge1xuICAgIHRocm93ICdzZXRTYW1wbGluZ0ludGVydmFsIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgcmVwb3J0QW5hbG9nUGluKCkge1xuICAgIHRocm93ICdyZXBvcnRBbmFsb2dQaW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICByZXBvcnREaWdpdGFsUGluKCkge1xuICAgIHRocm93ICdyZXBvcnREaWdpdGFsUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgcHVsc2VJbigpIHtcbiAgICB0aHJvdyAncHVsc2VJbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHN0ZXBwZXJDb25maWcoKSB7XG4gICAgdGhyb3cgJ3N0ZXBwZXJDb25maWcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzdGVwcGVyU3RlcCgpIHtcbiAgICB0aHJvdyAnc3RlcHBlclN0ZXAgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZUNvbmZpZygpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVNlYXJjaCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVTZWFyY2ggaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZUFsYXJtc1NlYXJjaCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVBbGFybXNTZWFyY2ggaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlYWQoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlUmVhZCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlUmVzZXQoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlUmVzZXQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVdyaXRlIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVEZWxheSgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVEZWxheSBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlV3JpdGVBbmRSZWFkKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUmFzcGksICdpc1Jhc3BiZXJyeVBpJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICB2YWx1ZTogKCkgPT4ge1xuICAgIC8vIERldGVybWluaW5nIGlmIGEgc3lzdGVtIGlzIGEgUmFzcGJlcnJ5IFBpIGlzbid0IHBvc3NpYmxlIHRocm91Z2hcbiAgICAvLyB0aGUgb3MgbW9kdWxlIG9uIFJhc3BiaWFuLCBzbyB3ZSByZWFkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtIGluc3RlYWRcbiAgICB2YXIgaXNSYXNwYmVycnlQaSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBpc1Jhc3BiZXJyeVBpID0gZnMucmVhZEZpbGVTeW5jKCcvZXRjL29zLXJlbGVhc2UnKS50b1N0cmluZygpLmluZGV4T2YoJ1Jhc3BiaWFuJykgIT09IC0xO1xuICAgIH0gY2F0Y2goZSkge30vLyBTcXVhc2ggZmlsZSBub3QgZm91bmQsIGV0YyBlcnJvcnNcbiAgICByZXR1cm4gaXNSYXNwYmVycnlQaTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFzcGk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
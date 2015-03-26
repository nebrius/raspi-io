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

var I2C = require("raspi-i2c").I2C;

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
var i2c = "__r$271828_6$__";
var i2cDelay = "__r$271828_7$__";
var i2cRead = "__r$271828_8$__";
var i2cCheckAlive = "__r$396836_9$__";

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
        value: LED
      });

      return _Object$defineProperties;
    })());

    init(function () {
      var pinMappings = getPins();
      _this4[pins] = [];
      Object.keys(pinMappings).forEach((function (pin) {
        var pinInfo = pinMappings[pin];
        var supportedModes = [INPUT_MODE, OUTPUT_MODE];
        if (pinInfo.peripherals.indexOf("pwm") != -1) {
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
      }).bind(_this4));

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
//# sourceMappingURL=data:application/json;base64,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QU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAoYykgMjAxNCBCcnlhbiBIdWdoZXMgPGJyeWFuQHRoZW9yZXRpY2FsaWRlYXRpb25zLmNvbT5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb25cbm9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uXG5maWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0XG5yZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSxcbmNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGVcblNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nXG5jb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTXG5PRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFRcbkhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLFxuV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HXG5GUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SXG5PVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgaW5pdCB9IGZyb20gJ3Jhc3BpJztcbmltcG9ydCB7IGdldFBpbnMsIGdldFBpbk51bWJlciB9IGZyb20gJ3Jhc3BpLWJvYXJkJztcbmltcG9ydCB7IERpZ2l0YWxPdXRwdXQsIERpZ2l0YWxJbnB1dCB9IGZyb20gJ3Jhc3BpLWdwaW8nO1xuaW1wb3J0IHsgUFdNIH0gZnJvbSAncmFzcGktcHdtJztcbmltcG9ydCB7IEkyQyB9IGZyb20gJ3Jhc3BpLWkyYyc7XG5cbi8vIENvbnN0YW50c1xudmFyIElOUFVUX01PREUgPSAwO1xudmFyIE9VVFBVVF9NT0RFID0gMTtcbnZhciBBTkFMT0dfTU9ERSA9IDI7XG52YXIgUFdNX01PREUgPSAzO1xudmFyIFNFUlZPX01PREUgPSA0O1xudmFyIFVOS05PV05fTU9ERSA9IDk5O1xuXG52YXIgTE9XID0gMDtcbnZhciBISUdIID0gMTtcblxudmFyIExFRCA9ICdsZWQwJztcblxuLy8gU2V0dGluZ3NcblxudmFyIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSA9IDE5O1xuXG4vLyBIYWNreSBidXQgZmFzdCBlbXVsYXRpb24gb2Ygc3ltYm9sc1xudmFyIGlzUmVhZHkgPSAnX19yJDI3MTgyOF8wJF9fJztcbnZhciBwaW5zID0gJ19fciQyNzE4MjhfMSRfXyc7XG52YXIgaW5zdGFuY2VzID0gJ19fciQyNzE4MjhfMiRfXyc7XG52YXIgYW5hbG9nUGlucyA9ICdfX3IkMjcxODI4XzMkX18nO1xudmFyIG1vZGUgPSAnX18kMjcxODI4XzQkX18nO1xudmFyIGdldFBpbkluc3RhbmNlID0gJ19fJDI3MTgyOF81JF9fJztcbnZhciBpMmMgPSAnX19yJDI3MTgyOF82JF9fJztcbnZhciBpMmNEZWxheSA9ICdfX3IkMjcxODI4XzckX18nO1xudmFyIGkyY1JlYWQgPSAnX19yJDI3MTgyOF84JF9fJztcbnZhciBpMmNDaGVja0FsaXZlID0gJ19fciQzOTY4MzZfOSRfXyc7XG5cblxuY2xhc3MgUmFzcGkgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbmFtZToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogJ1Jhc3BiZXJyeVBpLUlPJ1xuICAgICAgfSxcblxuICAgICAgW2luc3RhbmNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzUmVhZHldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1tpc1JlYWR5XTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW3BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBwaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1twaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2FuYWxvZ1BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBhbmFsb2dQaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1thbmFsb2dQaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2kyY106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXcgSTJDKClcbiAgICAgIH0sXG5cbiAgICAgIFtpMmNEZWxheV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAwXG4gICAgICB9LFxuXG4gICAgICBNT0RFUzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgSU5QVVQ6IElOUFVUX01PREUsXG4gICAgICAgICAgT1VUUFVUOiBPVVRQVVRfTU9ERSxcbiAgICAgICAgICBBTkFMT0c6IEFOQUxPR19NT0RFLFxuICAgICAgICAgIFBXTTogUFdNX01PREUsXG4gICAgICAgICAgU0VSVk86IFNFUlZPX01PREVcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIEhJR0g6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEhJR0hcbiAgICAgIH0sXG4gICAgICBMT1c6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExPV1xuICAgICAgfSxcblxuICAgICAgZGVmYXVsdExlZDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTEVEXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpbml0KCgpID0+IHtcbiAgICAgIHZhciBwaW5NYXBwaW5ncyA9IGdldFBpbnMoKTtcbiAgICAgIHRoaXNbcGluc10gPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKHBpbk1hcHBpbmdzKS5mb3JFYWNoKGZ1bmN0aW9uIChwaW4pIHtcbiAgICAgICAgdmFyIHBpbkluZm8gPSBwaW5NYXBwaW5nc1twaW5dO1xuICAgICAgICB2YXIgc3VwcG9ydGVkTW9kZXMgPSBbIElOUFVUX01PREUsIE9VVFBVVF9NT0RFIF07XG4gICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xKSB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChQV01fTU9ERSwgU0VSVk9fTU9ERSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl0gPSB7XG4gICAgICAgICAgcGVyaXBoZXJhbDogbnVsbCxcbiAgICAgICAgICBtb2RlOiBVTktOT1dOX01PREUsXG4gICAgICAgICAgcHJldmlvdXNXcml0dGVuVmFsdWU6IExPV1xuICAgICAgICB9O1xuICAgICAgICB0aGlzW3BpbnNdW3Bpbl0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHN1cHBvcnRlZE1vZGVzKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLm1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgc3dpdGNoKGluc3RhbmNlLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIEZpbGwgaW4gdGhlIGhvbGVzLCBzaW5zIHBpbnMgYXJlIHNwYXJzZSBvbiB0aGUgQSsvQisvMlxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzW3BpbnNdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghdGhpc1twaW5zXVtpXSkge1xuICAgICAgICAgIHRoaXNbcGluc11baV0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKFtdKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBVTktOT1dOX01PREU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNldCgpIHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpc1tpc1JlYWR5XSA9IHRydWU7XG4gICAgICB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG4gICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRocm93ICdyZXNldCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknO1xuICB9XG5cbiAgbm9ybWFsaXplKHBpbikge1xuICAgIHZhciBub3JtYWxpemVkUGluID0gZ2V0UGluTnVtYmVyKHBpbik7XG4gICAgaWYgKHR5cGVvZiBub3JtYWxpemVkUGluID09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcGluIFwiJyArIHBpbiArICdcIicpO1xuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplZFBpbjtcbiAgfVxuXG4gIFtnZXRQaW5JbnN0YW5jZV0ocGluKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl07XG4gICAgaWYgKCFwaW5JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHBpbiBcIicgKyBwaW4gKyAnXCInKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpbkluc3RhbmNlO1xuICB9XG5cbiAgcGluTW9kZShwaW4sIG1vZGUpIHtcbiAgICB2YXIgbm9ybWFsaXplZFBpbiA9IHRoaXMubm9ybWFsaXplKHBpbik7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0obm9ybWFsaXplZFBpbik7XG4gICAgaWYgKHRoaXNbcGluc11bbm9ybWFsaXplZFBpbl0uc3VwcG9ydGVkTW9kZXMuaW5kZXhPZihtb2RlKSA9PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQaW4gXCInICsgcGluICsgJ1wiIGRvZXMgbm90IHN1cHBvcnQgbW9kZSBcIicgKyBtb2RlICsgJ1wiJyk7XG4gICAgfVxuICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbElucHV0KG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgRGlnaXRhbE91dHB1dChub3JtYWxpemVkUGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFBXTV9NT0RFOlxuICAgICAgY2FzZSBTRVJWT19NT0RFOlxuICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFBXTShub3JtYWxpemVkUGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLm1vZGUgPSBtb2RlO1xuICB9XG5cbiAgYW5hbG9nUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuYWxvZ1JlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBhbmFsb2dXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gUFdNX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFBXTV9NT0RFKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZShNYXRoLnJvdW5kKHZhbHVlICogMTAwMCAvIDI1NSkpO1xuICB9XG5cbiAgZGlnaXRhbFJlYWQocGluLCBoYW5kbGVyKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0odGhpcy5ub3JtYWxpemUocGluKSk7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gSU5QVVRfTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgSU5QVVRfTU9ERSk7XG4gICAgfVxuICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHZhciB2YWx1ZTtcbiAgICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09IElOUFVUX01PREUpIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICB9XG4gICAgICBoYW5kbGVyICYmIGhhbmRsZXIodmFsdWUpO1xuICAgICAgdGhpcy5lbWl0KCdkaWdpdGFsLXJlYWQtJyArIHBpbiwgdmFsdWUpO1xuICAgIH0sIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSk7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC5vbignZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBkaWdpdGFsV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IE9VVFBVVF9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBPVVRQVVRfTU9ERSk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAhPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSkge1xuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSA/IEhJR0ggOiBMT1cpO1xuICAgICAgcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBzZXJ2b1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBTRVJWT19NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBTRVJWT19NT0RFKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSg0OCArIE1hdGgucm91bmQodmFsdWUgKiA0OC8gMTgwKSk7XG4gIH1cblxuICBxdWVyeUNhcGFiaWxpdGllcyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeUFuYWxvZ01hcHBpbmcoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlQaW5TdGF0ZShwaW4sIGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIFtpMmNDaGVja0FsaXZlXSgpIHtcbiAgICBpZiAoIXRoaXNbaTJjXS5hbGl2ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJMkMgcGlucyBub3QgaW4gSTJDIG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICBpMmNDb25maWcoZGVsYXkpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY0RlbGF5XSA9IGRlbGF5IHx8IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHRoaXMgbWV0aG9kIHN1cHBvcnRzIGJvdGhcbiAgLy8gaTJjV3JpdGUoYWRkcmVzcywgcmVnaXN0ZXIsIGluQnl0ZXMpXG4gIC8vIGFuZFxuICAvLyBpMmNXcml0ZShhZGRyZXNzLCBpbkJ5dGVzKVxuICBpMmNXcml0ZShhZGRyZXNzLCBjbWRSZWdPckRhdGEsIGluQnl0ZXMpIHtcbiAgICAvKipcbiAgICAgKiBjbWRSZWdPckRhdGE6XG4gICAgICogWy4uLiBhcmJpdHJhcnkgYnl0ZXNdXG4gICAgICpcbiAgICAgKiBvclxuICAgICAqXG4gICAgICogY21kUmVnT3JEYXRhLCBpbkJ5dGVzOlxuICAgICAqIGNvbW1hbmQgWywgLi4uXVxuICAgICAqXG4gICAgICovXG4gICAgdGhpc1tpMmNDaGVja0FsaXZlXSgpO1xuXG4gICAgLy8gSWYgaTJjV3JpdGUgd2FzIHVzZWQgZm9yIGFuIGkyY1dyaXRlUmVnIGNhbGwuLi5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShjbWRSZWdPckRhdGEpICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGluQnl0ZXMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5pMmNXcml0ZVJlZyhhZGRyZXNzLCBjbWRSZWdPckRhdGEsIGluQnl0ZXMpO1xuICAgIH1cblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY21kUmVnT3JEYXRhKSkge1xuICAgICAgICBpbkJ5dGVzID0gY21kUmVnT3JEYXRhLnNsaWNlKCk7XG4gICAgICAgIGNtZFJlZ09yRGF0YSA9IGluQnl0ZXMuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluQnl0ZXMgPSBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcihbY21kUmVnT3JEYXRhXS5jb25jYXQoaW5CeXRlcykpO1xuXG4gICAgLy8gT25seSB3cml0ZSBpZiBieXRlcyBwcm92aWRlZFxuICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICB0aGlzW2kyY10ud3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZVJlZyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY10ud3JpdGVCeXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBbaTJjUmVhZF0oY29udGludW91cywgYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBjYWxsYmFjaykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gNCAmJlxuICAgICAgICB0eXBlb2YgcmVnaXN0ZXIgPT09ICdudW1iZXInICYmXG4gICAgICAgIHR5cGVvZiBieXRlc1RvUmVhZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBieXRlc1RvUmVhZDtcbiAgICAgIGJ5dGVzVG9SZWFkID0gcmVnaXN0ZXI7XG4gICAgICByZWdpc3RlciA9IG51bGw7XG4gICAgfVxuXG4gICAgY2FsbGJhY2sgPSB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6ICgpID0+IHt9O1xuXG4gICAgdmFyIGV2ZW50ID0gJ0kyQy1yZXBseScgKyBhZGRyZXNzICsgJy0nO1xuICAgIGV2ZW50ICs9IHJlZ2lzdGVyICE9PSBudWxsID8gcmVnaXN0ZXIgOiAwO1xuXG4gICAgdmFyIHJlYWQgPSAoKSA9PiB7XG4gICAgICB2YXIgYWZ0ZXJSZWFkID0gKGVyciwgYnVmZmVyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb252ZXJ0IGJ1ZmZlciB0byBBcnJheSBiZWZvcmUgZW1pdFxuICAgICAgICB0aGlzLmVtaXQoZXZlbnQsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ1ZmZlcikpO1xuXG4gICAgICAgIGlmIChjb250aW51b3VzKSB7XG4gICAgICAgICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMub25jZShldmVudCwgY2FsbGJhY2spO1xuXG4gICAgICBpZiAocmVnaXN0ZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBhZnRlclJlYWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQocmVhZCwgdGhpc1tpMmNEZWxheV0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyB0aGlzIG1ldGhvZCBzdXBwb3J0cyBib3RoXG4gIC8vIGkyY1JlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBoYW5kbGVyKVxuICAvLyBhbmRcbiAgLy8gaTJjUmVhZChhZGRyZXNzLCBieXRlc1RvUmVhZCwgaGFuZGxlcilcbiAgaTJjUmVhZCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXNbaTJjUmVhZF0odHJ1ZSwgLi4ucmVzdCk7XG4gIH1cblxuICAvLyB0aGlzIG1ldGhvZCBzdXBwb3J0cyBib3RoXG4gIC8vIGkyY1JlYWRPbmNlKGFkZHJlc3MsIHJlZ2lzdGVyLCBieXRlc1RvUmVhZCwgaGFuZGxlcilcbiAgLy8gYW5kXG4gIC8vIGkyY1JlYWRPbmNlKGFkZHJlc3MsIGJ5dGVzVG9SZWFkLCBoYW5kbGVyKVxuICBpMmNSZWFkT25jZSguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXNbaTJjUmVhZF0oZmFsc2UsIC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ0NvbmZpZyguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjQ29uZmlnKC4uLnJlc3QpO1xuICB9XG5cbiAgc2VuZEkyQ1dyaXRlUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjV3JpdGUoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDUmVhZFJlcXVlc3QoLi4ucmVzdCkge1xuICAgIHJldHVybiB0aGlzLmkyY1JlYWRPbmNlKC4uLnJlc3QpO1xuICB9XG5cbiAgc2V0U2FtcGxpbmdJbnRlcnZhbCgpIHtcbiAgICB0aHJvdyAnc2V0U2FtcGxpbmdJbnRlcnZhbCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyAncmVwb3J0QW5hbG9nUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgcmVwb3J0RGlnaXRhbFBpbigpIHtcbiAgICB0aHJvdyAncmVwb3J0RGlnaXRhbFBpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHB1bHNlSW4oKSB7XG4gICAgdGhyb3cgJ3B1bHNlSW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzdGVwcGVyQ29uZmlnKCkge1xuICAgIHRocm93ICdzdGVwcGVyQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc3RlcHBlclN0ZXAoKSB7XG4gICAgdGhyb3cgJ3N0ZXBwZXJTdGVwIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVDb25maWcoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVTZWFyY2goKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlU2VhcmNoIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVBbGFybXNTZWFyY2goKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlQWxhcm1zU2VhcmNoIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZWFkKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVJlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlc2V0KCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVJlc2V0IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZSgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVXcml0ZSBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlRGVsYXkoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlRGVsYXkgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJhc3BpLCAnaXNSYXNwYmVycnlQaScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6ICgpID0+IHtcbiAgICAvLyBEZXRlcm1pbmluZyBpZiBhIHN5c3RlbSBpcyBhIFJhc3BiZXJyeSBQaSBpc24ndCBwb3NzaWJsZSB0aHJvdWdoXG4gICAgLy8gdGhlIG9zIG1vZHVsZSBvbiBSYXNwYmlhbiwgc28gd2UgcmVhZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbSBpbnN0ZWFkXG4gICAgdmFyIGlzUmFzcGJlcnJ5UGkgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgaXNSYXNwYmVycnlQaSA9IGZzLnJlYWRGaWxlU3luYygnL2V0Yy9vcy1yZWxlYXNlJykudG9TdHJpbmcoKS5pbmRleE9mKCdSYXNwYmlhbicpICE9PSAtMTtcbiAgICB9IGNhdGNoKGUpIHt9Ly8gU3F1YXNoIGZpbGUgbm90IGZvdW5kLCBldGMgZXJyb3JzXG4gICAgcmV0dXJuIGlzUmFzcGJlcnJ5UGk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhc3BpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
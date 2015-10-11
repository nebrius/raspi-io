"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var _createComputedClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var prop = props[i]; prop.configurable = true; if (prop.value) prop.writable = true; Object.defineProperty(target, prop.key, prop); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var Raspi = (function (_EventEmitter) {
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
        var supportedModes = [];
        // We don't want I2C to be used for anything else, since changing the
        // pin mode makes it unable to ever do I2C again.
        if (pinInfo.peripherals.indexOf("i2c") == -1) {
          if (pin == LED_PIN) {
            supportedModes.push(OUTPUT_MODE);
          } else if (pinInfo.peripherals.indexOf("gpio") != -1) {
            supportedModes.push(INPUT_MODE, OUTPUT_MODE);
          }
          if (pinInfo.peripherals.indexOf("pwm") != -1) {
            supportedModes.push(PWM_MODE, SERVO_MODE);
          }
        }
        var instance = _this4[instances][pin] = {
          peripheral: null,
          mode: supportedModes.indexOf(OUTPUT_MODE) == -1 ? UNKNOWN_MODE : OUTPUT_MODE,
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
        if (instance.mode == OUTPUT_MODE) {
          _this4.pinMode(pin, OUTPUT_MODE);
          _this4.digitalWrite(pin, LOW);
        }
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

  _inherits(Raspi, _EventEmitter);

  _createComputedClass(Raspi, [{
    key: "reset",
    value: function reset() {
      throw new Error("reset is not supported on the Raspberry Pi");
    }
  }, {
    key: "normalize",
    value: function normalize(pin) {
      var normalizedPin = getPinNumber(pin);
      if (typeof normalizedPin == "undefined") {
        throw new Error("Unknown pin \"" + pin + "\"");
      }
      return normalizedPin;
    }
  }, {
    key: getPinInstance,
    value: function (pin) {
      var pinInstance = this[instances][pin];
      if (!pinInstance) {
        throw new Error("Unknown pin \"" + pin + "\"");
      }
      return pinInstance;
    }
  }, {
    key: "pinMode",
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
    }
  }, {
    key: "analogRead",
    value: function analogRead() {
      throw new Error("analogRead is not supported on the Raspberry Pi");
    }
  }, {
    key: "analogWrite",
    value: function analogWrite(pin, value) {
      var pinInstance = this[getPinInstance](this.normalize(pin));
      if (pinInstance.mode != PWM_MODE) {
        this.pinMode(pin, PWM_MODE);
      }
      pinInstance.peripheral.write(Math.round(value * 1000 / 255));
    }
  }, {
    key: "digitalRead",
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
    }
  }, {
    key: "digitalWrite",
    value: function digitalWrite(pin, value) {
      var pinInstance = this[getPinInstance](this.normalize(pin));
      if (pinInstance.mode != OUTPUT_MODE) {
        this.pinMode(pin, OUTPUT_MODE);
      }
      if (value != pinInstance.previousWrittenValue) {
        pinInstance.peripheral.write(value ? HIGH : LOW);
        pinInstance.previousWrittenValue = value;
      }
    }
  }, {
    key: "servoWrite",
    value: function servoWrite(pin, value) {
      var pinInstance = this[getPinInstance](this.normalize(pin));
      if (pinInstance.mode != SERVO_MODE) {
        this.pinMode(pin, SERVO_MODE);
      }
      pinInstance.peripheral.write(48 + Math.round(value * 48 / 180));
    }
  }, {
    key: "queryCapabilities",
    value: function queryCapabilities(cb) {
      if (this.isReady) {
        process.nextTick(cb);
      } else {
        this.on("ready", cb);
      }
    }
  }, {
    key: "queryAnalogMapping",
    value: function queryAnalogMapping(cb) {
      if (this.isReady) {
        process.nextTick(cb);
      } else {
        this.on("ready", cb);
      }
    }
  }, {
    key: "queryPinState",
    value: function queryPinState(pin, cb) {
      if (this.isReady) {
        process.nextTick(cb);
      } else {
        this.on("ready", cb);
      }
    }
  }, {
    key: i2cCheckAlive,
    value: function () {
      if (!this[i2c].alive) {
        throw new Error("I2C pins not in I2C mode");
      }
    }
  }, {
    key: "i2cConfig",
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
    }
  }, {
    key: "i2cWrite",
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
    }
  }, {
    key: "i2cWriteReg",
    value: function i2cWriteReg(address, register, value) {
      this[i2cCheckAlive]();

      this[i2c].writeByteSync(address, register, value);

      return this;
    }
  }, {
    key: i2cRead,
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
    }
  }, {
    key: "i2cRead",
    value: (function (_i2cRead) {
      var _i2cReadWrapper = function i2cRead(_x) {
        return _i2cRead.apply(this, arguments);
      };

      _i2cReadWrapper.toString = function () {
        return _i2cRead.toString();
      };

      return _i2cReadWrapper;
    })(function () {
      for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
      }

      return this[i2cRead].apply(this, [true].concat(rest));
    })
  }, {
    key: "i2cReadOnce",
    value: function i2cReadOnce() {
      for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
      }

      return this[i2cRead].apply(this, [false].concat(rest));
    }
  }, {
    key: "sendI2CConfig",
    value: function sendI2CConfig() {
      for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
      }

      return this.i2cConfig.apply(this, rest);
    }
  }, {
    key: "sendI2CWriteRequest",
    value: function sendI2CWriteRequest() {
      for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
      }

      return this.i2cWrite.apply(this, rest);
    }
  }, {
    key: "sendI2CReadRequest",
    value: function sendI2CReadRequest() {
      for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
      }

      return this.i2cReadOnce.apply(this, rest);
    }
  }, {
    key: "sendOneWireConfig",
    value: function sendOneWireConfig() {
      throw new Error("sendOneWireConfig is not supported on the Raspberry Pi");
    }
  }, {
    key: "sendOneWireSearch",
    value: function sendOneWireSearch() {
      throw new Error("sendOneWireSearch is not supported on the Raspberry Pi");
    }
  }, {
    key: "sendOneWireAlarmsSearch",
    value: function sendOneWireAlarmsSearch() {
      throw new Error("sendOneWireAlarmsSearch is not supported on the Raspberry Pi");
    }
  }, {
    key: "sendOneWireRead",
    value: function sendOneWireRead() {
      throw new Error("sendOneWireRead is not supported on the Raspberry Pi");
    }
  }, {
    key: "sendOneWireReset",
    value: function sendOneWireReset() {
      throw new Error("sendOneWireConfig is not supported on the Raspberry Pi");
    }
  }, {
    key: "sendOneWireWrite",
    value: function sendOneWireWrite() {
      throw new Error("sendOneWireWrite is not supported on the Raspberry Pi");
    }
  }, {
    key: "sendOneWireDelay",
    value: function sendOneWireDelay() {
      throw new Error("sendOneWireDelay is not supported on the Raspberry Pi");
    }
  }, {
    key: "sendOneWireWriteAndRead",
    value: function sendOneWireWriteAndRead() {
      throw new Error("sendOneWireWriteAndRead is not supported on the Raspberry Pi");
    }
  }, {
    key: "setSamplingInterval",
    value: function setSamplingInterval() {
      throw new Error("setSamplingInterval is not yet implemented");
    }
  }, {
    key: "reportAnalogPin",
    value: function reportAnalogPin() {
      throw new Error("reportAnalogPin is not yet implemented");
    }
  }, {
    key: "reportDigitalPin",
    value: function reportDigitalPin() {
      throw new Error("reportDigitalPin is not yet implemented");
    }
  }, {
    key: "pingRead",
    value: function pingRead() {
      throw new Error("pingRead is not yet implemented");
    }
  }, {
    key: "pulseIn",
    value: function pulseIn() {
      throw new Error("pulseIn is not yet implemented");
    }
  }, {
    key: "stepperConfig",
    value: function stepperConfig() {
      throw new Error("stepperConfig is not yet implemented");
    }
  }, {
    key: "stepperStep",
    value: function stepperStep() {
      throw new Error("stepperStep is not yet implemented");
    }
  }]);

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
//# sourceMappingURL=data:application/json;base64,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SSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztLQUM1RDs7O1dBRU8sb0JBQUc7QUFDVCxZQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7S0FDcEQ7OztXQUVNLG1CQUFHO0FBQ1IsWUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0tBQ25EOzs7V0FFWSx5QkFBRztBQUNkLFlBQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztLQUN6RDs7O1dBRVUsdUJBQUc7QUFDWixZQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7S0FDdkQ7OztTQTdmRyxLQUFLO0dBQVMsWUFBWTs7QUFnZ0JoQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUU7QUFDNUMsWUFBVSxFQUFFLElBQUk7QUFDaEIsT0FBSyxFQUFFLFlBQU07OztBQUdYLFFBQUksYUFBYSxHQUFHLEtBQUssQ0FBQztBQUMxQixRQUFJO0FBQ0YsbUJBQWEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQzFGLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtBQUNkLFdBQU8sYUFBYSxDQUFDO0dBQ3RCO0NBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAoYykgMjAxNCBCcnlhbiBIdWdoZXMgPGJyeWFuQHRoZW9yZXRpY2FsaWRlYXRpb25zLmNvbT5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb25cbm9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uXG5maWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0XG5yZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSxcbmNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGVcblNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nXG5jb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTXG5PRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFRcbkhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLFxuV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HXG5GUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SXG5PVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IGluaXQgfSBmcm9tICdyYXNwaSc7XG5pbXBvcnQgeyBnZXRQaW5zLCBnZXRQaW5OdW1iZXIgfSBmcm9tICdyYXNwaS1ib2FyZCc7XG5pbXBvcnQgeyBEaWdpdGFsT3V0cHV0LCBEaWdpdGFsSW5wdXQgfSBmcm9tICdyYXNwaS1ncGlvJztcbmltcG9ydCB7IFBXTSB9IGZyb20gJ3Jhc3BpLXB3bSc7XG5pbXBvcnQgeyBJMkMgfSBmcm9tICdyYXNwaS1pMmMnO1xuaW1wb3J0IHsgTEVEIH0gZnJvbSAncmFzcGktbGVkJztcblxuLy8gSGFja3kgcXVpY2sgU3ltYm9sIHBvbHlmaWxsLCBzaW5jZSBlczYtc3ltYm9sIHJlZnVzZXMgdG8gaW5zdGFsbCB3aXRoIE5vZGUgMC4xMCBmcm9tIGh0dHA6Ly9ub2RlLWFybS5oZXJva3VhcHAuY29tL1xuaWYgKHR5cGVvZiBnbG9iYWwuU3ltYm9sICE9ICdmdW5jdGlvbicpIHtcbiAgZ2xvYmFsLlN5bWJvbCA9IChuYW1lKSA9PiB7XG4gICAgcmV0dXJuICdfXyRyYXNwaV9zeW1ib2xfJyArIG5hbWUgKyAnXycgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAweEZGRkZGRkYpICsgJyRfXyc7XG4gIH07XG59XG5cbi8vIENvbnN0YW50c1xuY29uc3QgSU5QVVRfTU9ERSA9IDA7XG5jb25zdCBPVVRQVVRfTU9ERSA9IDE7XG5jb25zdCBBTkFMT0dfTU9ERSA9IDI7XG5jb25zdCBQV01fTU9ERSA9IDM7XG5jb25zdCBTRVJWT19NT0RFID0gNDtcbmNvbnN0IFVOS05PV05fTU9ERSA9IDk5O1xuXG5jb25zdCBMT1cgPSAwO1xuY29uc3QgSElHSCA9IDE7XG5cbmNvbnN0IExFRF9QSU4gPSAtMTtcblxuLy8gU2V0dGluZ3NcbmNvbnN0IERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSA9IDE5O1xuXG4vLyBQcml2YXRlIHN5bWJvbHNcbmNvbnN0IGlzUmVhZHkgPSBTeW1ib2woJ2lzUmVhZHknKTtcbmNvbnN0IHBpbnMgPSBTeW1ib2woJ3BpbnMnKTtcbmNvbnN0IGluc3RhbmNlcyA9IFN5bWJvbCgnaW5zdGFuY2VzJyk7XG5jb25zdCBhbmFsb2dQaW5zID0gU3ltYm9sKCdhbmFsb2dQaW5zJyk7XG5jb25zdCBnZXRQaW5JbnN0YW5jZSA9IFN5bWJvbCgnZ2V0UGluSW5zdGFuY2UnKTtcbmNvbnN0IGkyYyA9IFN5bWJvbCgnaTJjJyk7XG5jb25zdCBpMmNEZWxheSA9IFN5bWJvbCgnaTJjRGVsYXknKTtcbmNvbnN0IGkyY1JlYWQgPSBTeW1ib2woJ2kyY1JlYWQnKTtcbmNvbnN0IGkyY0NoZWNrQWxpdmUgPSBTeW1ib2woJ2kyY0NoZWNrQWxpdmUnKTtcblxuXG5jbGFzcyBSYXNwaSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6ICdSYXNwYmVycnlQaS1JTydcbiAgICAgIH0sXG5cbiAgICAgIFtpbnN0YW5jZXNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG5cbiAgICAgIFtpc1JlYWR5XToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuICAgICAgaXNSZWFkeToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbaXNSZWFkeV07XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFtwaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgcGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbcGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFthbmFsb2dQaW5zXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuICAgICAgYW5hbG9nUGluczoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbYW5hbG9nUGluc107XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIFtpMmNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogbmV3IEkyQygpXG4gICAgICB9LFxuXG4gICAgICBbaTJjRGVsYXldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogMFxuICAgICAgfSxcblxuICAgICAgTU9ERVM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIElOUFVUOiBJTlBVVF9NT0RFLFxuICAgICAgICAgIE9VVFBVVDogT1VUUFVUX01PREUsXG4gICAgICAgICAgQU5BTE9HOiBBTkFMT0dfTU9ERSxcbiAgICAgICAgICBQV006IFBXTV9NT0RFLFxuICAgICAgICAgIFNFUlZPOiBTRVJWT19NT0RFXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBISUdIOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBISUdIXG4gICAgICB9LFxuICAgICAgTE9XOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMT1dcbiAgICAgIH0sXG5cbiAgICAgIGRlZmF1bHRMZWQ6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExFRF9QSU5cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGluaXQoKCkgPT4ge1xuICAgICAgY29uc3QgcGluTWFwcGluZ3MgPSBnZXRQaW5zKCk7XG4gICAgICB0aGlzW3BpbnNdID0gW107XG5cbiAgICAgIC8vIFNsaWdodCBoYWNrIHRvIGdldCB0aGUgTEVEIGluIHRoZXJlLCBzaW5jZSBpdCdzIG5vdCBhY3R1YWxseSBhIHBpblxuICAgICAgcGluTWFwcGluZ3NbTEVEX1BJTl0gPSB7XG4gICAgICAgIHBpbnM6IFsgTEVEX1BJTiBdLFxuICAgICAgICBwZXJpcGhlcmFsczogWyAnZ3BpbycgXVxuICAgICAgfTtcblxuICAgICAgT2JqZWN0LmtleXMocGluTWFwcGluZ3MpLmZvckVhY2goKHBpbikgPT4ge1xuICAgICAgICBjb25zdCBwaW5JbmZvID0gcGluTWFwcGluZ3NbcGluXTtcbiAgICAgICAgY29uc3Qgc3VwcG9ydGVkTW9kZXMgPSBbXTtcbiAgICAgICAgLy8gV2UgZG9uJ3Qgd2FudCBJMkMgdG8gYmUgdXNlZCBmb3IgYW55dGhpbmcgZWxzZSwgc2luY2UgY2hhbmdpbmcgdGhlXG4gICAgICAgIC8vIHBpbiBtb2RlIG1ha2VzIGl0IHVuYWJsZSB0byBldmVyIGRvIEkyQyBhZ2Fpbi5cbiAgICAgICAgaWYgKHBpbkluZm8ucGVyaXBoZXJhbHMuaW5kZXhPZignaTJjJykgPT0gLTEpIHtcbiAgICAgICAgICBpZiAocGluID09IExFRF9QSU4pIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goT1VUUFVUX01PREUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdncGlvJykgIT0gLTEpIHtcbiAgICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goSU5QVVRfTU9ERSwgT1VUUFVUX01PREUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdwd20nKSAhPSAtMSkge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChQV01fTU9ERSwgU0VSVk9fTU9ERSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl0gPSB7XG4gICAgICAgICAgcGVyaXBoZXJhbDogbnVsbCxcbiAgICAgICAgICBtb2RlOiBzdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKE9VVFBVVF9NT0RFKSA9PSAtMSA/IFVOS05PV05fTU9ERSA6IE9VVFBVVF9NT0RFLFxuICAgICAgICAgIHByZXZpb3VzV3JpdHRlblZhbHVlOiBMT1dcbiAgICAgICAgfTtcbiAgICAgICAgdGhpc1twaW5zXVtwaW5dID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShzdXBwb3J0ZWRNb2RlcylcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5tb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoaW5zdGFuY2UubW9kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgICAgICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgIHRoaXMucGluTW9kZShwaW4sIE9VVFBVVF9NT0RFKTtcbiAgICAgICAgICB0aGlzLmRpZ2l0YWxXcml0ZShwaW4sIExPVyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBGaWxsIGluIHRoZSBob2xlcywgc2lucyBwaW5zIGFyZSBzcGFyc2Ugb24gdGhlIEErL0IrLzJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpc1twaW5zXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXRoaXNbcGluc11baV0pIHtcbiAgICAgICAgICB0aGlzW3BpbnNdW2ldID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShbXSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVU5LTk9XTl9NT0RFO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXQoKSB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXNbaXNSZWFkeV0gPSB0cnVlO1xuICAgICAgdGhpcy5lbWl0KCdyZWFkeScpO1xuICAgICAgdGhpcy5lbWl0KCdjb25uZWN0Jyk7XG4gICAgfSk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Jlc2V0IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgbm9ybWFsaXplKHBpbikge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaW4gPSBnZXRQaW5OdW1iZXIocGluKTtcbiAgICBpZiAodHlwZW9mIG5vcm1hbGl6ZWRQaW4gPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwaW4gXCInICsgcGluICsgJ1wiJyk7XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVkUGluO1xuICB9XG5cbiAgW2dldFBpbkluc3RhbmNlXShwaW4pIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dO1xuICAgIGlmICghcGluSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwaW4gXCInICsgcGluICsgJ1wiJyk7XG4gICAgfVxuICAgIHJldHVybiBwaW5JbnN0YW5jZTtcbiAgfVxuXG4gIHBpbk1vZGUocGluLCBtb2RlKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBpbiA9IHRoaXMubm9ybWFsaXplKHBpbik7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShub3JtYWxpemVkUGluKTtcbiAgICBpZiAodGhpc1twaW5zXVtub3JtYWxpemVkUGluXS5zdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKG1vZGUpID09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BpbiBcIicgKyBwaW4gKyAnXCIgZG9lcyBub3Qgc3VwcG9ydCBtb2RlIFwiJyArIG1vZGUgKyAnXCInKTtcbiAgICB9XG4gICAgaWYgKHBpbiA9PSBMRURfUElOICYmICEocGluSW5zdGFuY2UucGVyaXBoZXJhbCBpbnN0YW5jZW9mIExFRCkpIHtcbiAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgTEVEKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsSW5wdXQobm9ybWFsaXplZFBpbik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsT3V0cHV0KG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFBXTV9NT0RFOlxuICAgICAgICBjYXNlIFNFUlZPX01PREU6XG4gICAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBQV00obm9ybWFsaXplZFBpbik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS53YXJuKCdVbmtub3duIHBpbiBtb2RlOiAnICsgbW9kZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLm1vZGUgPSBtb2RlO1xuICB9XG5cbiAgYW5hbG9nUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuYWxvZ1JlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBhbmFsb2dXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgY29uc3QgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXSh0aGlzLm5vcm1hbGl6ZShwaW4pKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBQV01fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgUFdNX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKE1hdGgucm91bmQodmFsdWUgKiAxMDAwIC8gMjU1KSk7XG4gIH1cblxuICBkaWdpdGFsUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IElOUFVUX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIElOUFVUX01PREUpO1xuICAgIH1cbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGxldCB2YWx1ZTtcbiAgICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09IElOUFVUX01PREUpIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdCgnZGlnaXRhbC1yZWFkLScgKyBwaW4sIHZhbHVlKTtcbiAgICB9LCBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUpO1xuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwub24oJ2Rlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlnaXRhbFdyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IE9VVFBVVF9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBPVVRQVVRfTU9ERSk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAhPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSkge1xuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSA/IEhJR0ggOiBMT1cpO1xuICAgICAgcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBzZXJ2b1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICBjb25zdCBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHRoaXMubm9ybWFsaXplKHBpbikpO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFNFUlZPX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIFNFUlZPX01PREUpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKDQ4ICsgTWF0aC5yb3VuZCh2YWx1ZSAqIDQ4IC8gMTgwKSk7XG4gIH1cblxuICBxdWVyeUNhcGFiaWxpdGllcyhjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBxdWVyeUFuYWxvZ01hcHBpbmcoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlQaW5TdGF0ZShwaW4sIGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIFtpMmNDaGVja0FsaXZlXSgpIHtcbiAgICBpZiAoIXRoaXNbaTJjXS5hbGl2ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJMkMgcGlucyBub3QgaW4gSTJDIG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICBpMmNDb25maWcob3B0aW9ucykge1xuICAgIGxldCBkZWxheTtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRlbGF5ID0gb3B0aW9ucztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGRlbGF5ID0gb3B0aW9ucy5kZWxheTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY0RlbGF5XSA9IGRlbGF5IHx8IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGkyY1dyaXRlKGFkZHJlc3MsIGNtZFJlZ09yRGF0YSwgaW5CeXRlcykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIElmIGkyY1dyaXRlIHdhcyB1c2VkIGZvciBhbiBpMmNXcml0ZVJlZyBjYWxsLi4uXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkoY21kUmVnT3JEYXRhKSAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShpbkJ5dGVzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaTJjV3JpdGVSZWcoYWRkcmVzcywgY21kUmVnT3JEYXRhLCBpbkJ5dGVzKTtcbiAgICB9XG5cbiAgICAvLyBGaXggYXJndW1lbnRzIGlmIGNhbGxlZCB3aXRoIEZpcm1hdGEuanMgQVBJXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNtZFJlZ09yRGF0YSkpIHtcbiAgICAgICAgaW5CeXRlcyA9IGNtZFJlZ09yRGF0YS5zbGljZSgpO1xuICAgICAgICBjbWRSZWdPckRhdGEgPSBpbkJ5dGVzLnNoaWZ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbkJ5dGVzID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEJ1ZmZlcihbY21kUmVnT3JEYXRhXS5jb25jYXQoaW5CeXRlcykpO1xuXG4gICAgLy8gT25seSB3cml0ZSBpZiBieXRlcyBwcm92aWRlZFxuICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICB0aGlzW2kyY10ud3JpdGVTeW5jKGFkZHJlc3MsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNXcml0ZVJlZyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpIHtcbiAgICB0aGlzW2kyY0NoZWNrQWxpdmVdKCk7XG5cbiAgICB0aGlzW2kyY10ud3JpdGVCeXRlU3luYyhhZGRyZXNzLCByZWdpc3RlciwgdmFsdWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBbaTJjUmVhZF0oY29udGludW91cywgYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBjYWxsYmFjaykge1xuICAgIHRoaXNbaTJjQ2hlY2tBbGl2ZV0oKTtcblxuICAgIC8vIEZpeCBhcmd1bWVudHMgaWYgY2FsbGVkIHdpdGggRmlybWF0YS5qcyBBUElcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSA0ICYmXG4gICAgICB0eXBlb2YgcmVnaXN0ZXIgPT0gJ251bWJlcicgJiZcbiAgICAgIHR5cGVvZiBieXRlc1RvUmVhZCA9PSAnZnVuY3Rpb24nXG4gICAgKSB7XG4gICAgICBjYWxsYmFjayA9IGJ5dGVzVG9SZWFkO1xuICAgICAgYnl0ZXNUb1JlYWQgPSByZWdpc3RlcjtcbiAgICAgIHJlZ2lzdGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBjYWxsYmFjayA9IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogKCkgPT4ge307XG5cbiAgICBsZXQgZXZlbnQgPSAnSTJDLXJlcGx5JyArIGFkZHJlc3MgKyAnLSc7XG4gICAgZXZlbnQgKz0gcmVnaXN0ZXIgIT09IG51bGwgPyByZWdpc3RlciA6IDA7XG5cbiAgICBjb25zdCByZWFkID0gKCkgPT4ge1xuICAgICAgY29uc3QgYWZ0ZXJSZWFkID0gKGVyciwgYnVmZmVyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb252ZXJ0IGJ1ZmZlciB0byBBcnJheSBiZWZvcmUgZW1pdFxuICAgICAgICB0aGlzLmVtaXQoZXZlbnQsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ1ZmZlcikpO1xuXG4gICAgICAgIGlmIChjb250aW51b3VzKSB7XG4gICAgICAgICAgc2V0VGltZW91dChyZWFkLCB0aGlzW2kyY0RlbGF5XSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMub25jZShldmVudCwgY2FsbGJhY2spO1xuXG4gICAgICBpZiAocmVnaXN0ZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgcmVnaXN0ZXIsIGJ5dGVzVG9SZWFkLCBhZnRlclJlYWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tpMmNdLnJlYWQoYWRkcmVzcywgYnl0ZXNUb1JlYWQsIGFmdGVyUmVhZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQocmVhZCwgdGhpc1tpMmNEZWxheV0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpMmNSZWFkKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXSh0cnVlLCAuLi5yZXN0KTtcbiAgfVxuXG4gIGkyY1JlYWRPbmNlKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpc1tpMmNSZWFkXShmYWxzZSwgLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDQ29uZmlnKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNDb25maWcoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kSTJDV3JpdGVSZXF1ZXN0KC4uLnJlc3QpIHtcbiAgICByZXR1cm4gdGhpcy5pMmNXcml0ZSguLi5yZXN0KTtcbiAgfVxuXG4gIHNlbmRJMkNSZWFkUmVxdWVzdCguLi5yZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMuaTJjUmVhZE9uY2UoLi4ucmVzdCk7XG4gIH1cblxuICBzZW5kT25lV2lyZUNvbmZpZygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVTZWFyY2goKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVNlYXJjaCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlQWxhcm1zU2VhcmNoKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVBbGFybXNTZWFyY2ggaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVJlYWQgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlc2V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVDb25maWcgaXMgbm90IHN1cHBvcnRlZCBvbiB0aGUgUmFzcGJlcnJ5IFBpJyk7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VuZE9uZVdpcmVXcml0ZSBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNlbmRPbmVXaXJlRGVsYXkoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZURlbGF5IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaScpO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIHNldFNhbXBsaW5nSW50ZXJ2YWwoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRTYW1wbGluZ0ludGVydmFsIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlcG9ydEFuYWxvZ1BpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICByZXBvcnREaWdpdGFsUGluKCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVwb3J0RGlnaXRhbFBpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICBwaW5nUmVhZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3BpbmdSZWFkIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHB1bHNlSW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwdWxzZUluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHN0ZXBwZXJDb25maWcoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdGVwcGVyQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIHN0ZXBwZXJTdGVwKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc3RlcHBlclN0ZXAgaXMgbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShSYXNwaSwgJ2lzUmFzcGJlcnJ5UGknLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIHZhbHVlOiAoKSA9PiB7XG4gICAgLy8gRGV0ZXJtaW5pbmcgaWYgYSBzeXN0ZW0gaXMgYSBSYXNwYmVycnkgUGkgaXNuJ3QgcG9zc2libGUgdGhyb3VnaFxuICAgIC8vIHRoZSBvcyBtb2R1bGUgb24gUmFzcGJpYW4sIHNvIHdlIHJlYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0gaW5zdGVhZFxuICAgIGxldCBpc1Jhc3BiZXJyeVBpID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGlzUmFzcGJlcnJ5UGkgPSBmcy5yZWFkRmlsZVN5bmMoJy9ldGMvb3MtcmVsZWFzZScpLnRvU3RyaW5nKCkuaW5kZXhPZignUmFzcGJpYW4nKSAhPT0gLTE7XG4gICAgfSBjYXRjaCAoZSkge30vLyBTcXVhc2ggZmlsZSBub3QgZm91bmQsIGV0YyBlcnJvcnNcbiAgICByZXR1cm4gaXNSYXNwYmVycnlQaTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmFzcGk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

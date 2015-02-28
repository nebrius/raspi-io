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
      Object.keys(pinMappings).forEach((function (pin) {
        var pinInfo = pinMappings[pin];
        var supportedModes = [INPUT_MODE, OUTPUT_MODE];
        if (pinInfo.peripherals.indexOf("pwm") != -1) {
          supportedModes.push(PWM_MODE, SERVO_MODE);
        }
        var instance = this[instances][pin] = {
          peripheral: new DigitalInput(pin),
          mode: INPUT_MODE,
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
//# sourceMappingURL=data:application/json;base64,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LENBQUM7T0FDakQ7Ozs7OzthQUVlLDRCQUFHO0FBQ2pCLGNBQU0seUNBQXlDLENBQUM7T0FDakQ7Ozs7OzthQUVzQixtQ0FBRztBQUN4QixjQUFNLGdEQUFnRCxDQUFDO09BQ3hEOzs7Ozs7OztTQTlWRyxLQUFLO0dBQVMsTUFBTSxDQUFDLFlBQVk7O0FBaVd2QyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUU7QUFDNUMsWUFBVSxFQUFFLElBQUk7QUFDaEIsT0FBSyxFQUFFLFlBQU07OztBQUdYLFFBQUksYUFBYSxHQUFHLEtBQUssQ0FBQztBQUMxQixRQUFJO0FBQ0YsbUJBQWEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQzFGLENBQUMsT0FBTSxDQUFDLEVBQUUsRUFBRTtBQUNiLFdBQU8sYUFBYSxDQUFDO0dBQ3RCO0NBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAoYykgMjAxNCBCcnlhbiBIdWdoZXMgPGJyeWFuQHRoZW9yZXRpY2FsaWRlYXRpb25zLmNvbT5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb25cbm9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uXG5maWxlcyAodGhlICdTb2Z0d2FyZScpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0XG5yZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSxcbmNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGVcblNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nXG5jb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTXG5PRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFRcbkhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLFxuV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HXG5GUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SXG5PVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgaW5pdCB9IGZyb20gJ3Jhc3BpJztcbmltcG9ydCB7IGdldFBpbnMsIGdldFBpbk51bWJlciB9IGZyb20gJ3Jhc3BpLWJvYXJkJztcbmltcG9ydCB7IERpZ2l0YWxPdXRwdXQsIERpZ2l0YWxJbnB1dCB9IGZyb20gJ3Jhc3BpLWdwaW8nO1xuaW1wb3J0IHsgUFdNIH0gZnJvbSAncmFzcGktcHdtJztcblxuLy8gQ29uc3RhbnRzXG52YXIgSU5QVVRfTU9ERSA9IDA7XG52YXIgT1VUUFVUX01PREUgPSAxO1xudmFyIEFOQUxPR19NT0RFID0gMjtcbnZhciBQV01fTU9ERSA9IDM7XG52YXIgU0VSVk9fTU9ERSA9IDQ7XG52YXIgVU5LTk9XTl9NT0RFID0gOTk7XG5cbnZhciBMT1cgPSAwO1xudmFyIEhJR0ggPSAxO1xuXG52YXIgTEVEID0gJ2xlZDAnO1xuXG4vLyBTZXR0aW5nc1xuXG52YXIgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFID0gMTk7XG5cbi8vIEhhY2t5IGJ1dCBmYXN0IGVtdWxhdGlvbiBvZiBzeW1ib2xzXG52YXIgaXNSZWFkeSA9ICdfX3IkMjcxODI4XzAkX18nO1xudmFyIHBpbnMgPSAnX19yJDI3MTgyOF8xJF9fJztcbnZhciBpbnN0YW5jZXMgPSAnX19yJDI3MTgyOF8yJF9fJztcbnZhciBhbmFsb2dQaW5zID0gJ19fciQyNzE4MjhfMyRfXyc7XG52YXIgbW9kZSA9ICdfXyQyNzE4MjhfNCRfXyc7XG52YXIgZ2V0UGluSW5zdGFuY2UgPSAnX18kMjcxODI4XzUkX18nO1xuXG5jbGFzcyBSYXNwaSBleHRlbmRzIGV2ZW50cy5FdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAnUmFzcGJlcnJ5UGktSU8nXG4gICAgICB9LFxuXG4gICAgICBbaW5zdGFuY2VzXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuXG4gICAgICBbaXNSZWFkeV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGlzUmVhZHk6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2lzUmVhZHldO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbcGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIHBpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW3BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbYW5hbG9nUGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIGFuYWxvZ1BpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2FuYWxvZ1BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBNT0RFUzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgSU5QVVQ6IElOUFVUX01PREUsXG4gICAgICAgICAgT1VUUFVUOiBPVVRQVVRfTU9ERSxcbiAgICAgICAgICBBTkFMT0c6IEFOQUxPR19NT0RFLFxuICAgICAgICAgIFBXTTogUFdNX01PREUsXG4gICAgICAgICAgU0VSVk86IFNFUlZPX01PREVcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIEhJR0g6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEhJR0hcbiAgICAgIH0sXG4gICAgICBMT1c6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExPV1xuICAgICAgfSxcblxuICAgICAgZGVmYXVsdExlZDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTEVEXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpbml0KCgpID0+IHtcbiAgICAgIHZhciBwaW5NYXBwaW5ncyA9IGdldFBpbnMoKTtcbiAgICAgIHRoaXNbcGluc10gPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKHBpbk1hcHBpbmdzKS5mb3JFYWNoKGZ1bmN0aW9uIChwaW4pIHtcbiAgICAgICAgdmFyIHBpbkluZm8gPSBwaW5NYXBwaW5nc1twaW5dO1xuICAgICAgICB2YXIgc3VwcG9ydGVkTW9kZXMgPSBbIElOUFVUX01PREUsIE9VVFBVVF9NT0RFIF07XG4gICAgICAgIGlmIChwaW5JbmZvLnBlcmlwaGVyYWxzLmluZGV4T2YoJ3B3bScpICE9IC0xKSB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXMucHVzaChQV01fTU9ERSwgU0VSVk9fTU9ERSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluc3RhbmNlID0gdGhpc1tpbnN0YW5jZXNdW3Bpbl0gPSB7XG4gICAgICAgICAgcGVyaXBoZXJhbDogbmV3IERpZ2l0YWxJbnB1dChwaW4pLFxuICAgICAgICAgIG1vZGU6IElOUFVUX01PREUsXG4gICAgICAgICAgcHJldmlvdXNXcml0dGVuVmFsdWU6IExPV1xuICAgICAgICB9O1xuICAgICAgICB0aGlzW3BpbnNdW3Bpbl0gPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcbiAgICAgICAgICBzdXBwb3J0ZWRNb2Rlczoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHN1cHBvcnRlZE1vZGVzKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLm1vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgc3dpdGNoKGluc3RhbmNlLm1vZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIElOUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucGVyaXBoZXJhbC5yZWFkKCk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm1vZGUgPT0gT1VUUFVUX01PREUpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVwb3J0OiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFuYWxvZ0NoYW5uZWw6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMTI3XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIEZpbGwgaW4gdGhlIGhvbGVzXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXNbcGluc10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzW3BpbnNdW2ldKSB7XG4gICAgICAgICAgdGhpc1twaW5zXVtpXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoW10pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVOS05PV05fTU9ERTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0KCkge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzW2lzUmVhZHldID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW1pdCgncmVhZHknKTtcbiAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhyb3cgJ3Jlc2V0IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaSc7XG4gIH1cblxuICBub3JtYWxpemUocGluKSB7XG4gICAgdmFyIG5vcm1hbGl6ZWRQaW4gPSBnZXRQaW5OdW1iZXIocGluKTtcbiAgICBpZiAodHlwZW9mIG5vcm1hbGl6ZWRQaW4gPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwaW4gXCInICsgcGluICsgJ1wiJyk7XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVkUGluO1xuICB9XG5cbiAgW2dldFBpbkluc3RhbmNlXShwaW4pIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXTtcbiAgICBpZiAoIXBpbkluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcGluIFwiJyArIHBpbiArICdcIicpO1xuICAgIH1cbiAgICByZXR1cm4gcGluSW5zdGFuY2U7XG4gIH1cblxuICBwaW5Nb2RlKHBpbiwgbW9kZSkge1xuICAgIHZhciBub3JtYWxpemVkUGluID0gdGhpcy5ub3JtYWxpemUocGluKTtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShub3JtYWxpemVkUGluKTtcbiAgICBpZiAodGhpc1twaW5zXVtub3JtYWxpemVkUGluXS5zdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKG1vZGUpID09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BpbiBcIicgKyBwaW4gKyAnXCIgZG9lcyBub3Qgc3VwcG9ydCBtb2RlIFwiJyArIG1vZGUgKyAnXCInKTtcbiAgICB9XG4gICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsSW5wdXQobm9ybWFsaXplZFBpbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsT3V0cHV0KG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUFdNX01PREU6XG4gICAgICBjYXNlIFNFUlZPX01PREU6XG4gICAgICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwgPSBuZXcgUFdNKG5vcm1hbGl6ZWRQaW4pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcGluSW5zdGFuY2UubW9kZSA9IG1vZGU7XG4gIH1cblxuICBhbmFsb2dSZWFkKHBpbiwgaGFuZGxlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYW5hbG9nUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIGFuYWxvZ1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFBXTV9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBQV01fTU9ERSk7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoTWF0aC5yb3VuZCh2YWx1ZSAqIDEwMDAgLyAyNTUpKTtcbiAgfVxuXG4gIGRpZ2l0YWxSZWFkKHBpbiwgaGFuZGxlcikge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gSU5QVVRfTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgSU5QVVRfTU9ERSk7XG4gICAgfVxuICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHZhciB2YWx1ZTtcbiAgICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09IElOUFVUX01PREUpIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICB9XG4gICAgICBoYW5kbGVyICYmIGhhbmRsZXIodmFsdWUpO1xuICAgICAgdGhpcy5lbWl0KCdkaWdpdGFsLXJlYWQtJyArIHBpbiwgdmFsdWUpO1xuICAgIH0sIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSk7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC5vbignZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBkaWdpdGFsV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gT1VUUFVUX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIE9VVFBVVF9NT0RFKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlICE9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlKSB7XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlID8gSElHSCA6IExPVyk7XG4gICAgICBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHNlcnZvV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gU0VSVk9fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgU0VSVk9fTU9ERSk7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoNDggKyBNYXRoLnJvdW5kKHZhbHVlICogNDgvIDE4MCkpO1xuICB9XG5cbiAgcXVlcnlDYXBhYmlsaXRpZXMoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlBbmFsb2dNYXBwaW5nKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5UGluU3RhdGUocGluLCBjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBzZW5kSTJDQ29uZmlnKCkge1xuICAgIHRocm93ICdzZW5kSTJDQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZEkyQ1dyaXRlUmVxdWVzdCgpIHtcbiAgICB0aHJvdyAnc2VuZEkyQ1dyaXRlUmVxdWVzdCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRJMkNSZWFkUmVxdWVzdCgpIHtcbiAgICB0aHJvdyAnc2VuZEkyQ1JlYWRSZXF1ZXN0IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2V0U2FtcGxpbmdJbnRlcnZhbCgpIHtcbiAgICB0aHJvdyAnc2V0U2FtcGxpbmdJbnRlcnZhbCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyAncmVwb3J0QW5hbG9nUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgcmVwb3J0RGlnaXRhbFBpbigpIHtcbiAgICB0aHJvdyAncmVwb3J0RGlnaXRhbFBpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHB1bHNlSW4oKSB7XG4gICAgdGhyb3cgJ3B1bHNlSW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzdGVwcGVyQ29uZmlnKCkge1xuICAgIHRocm93ICdzdGVwcGVyQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc3RlcHBlclN0ZXAoKSB7XG4gICAgdGhyb3cgJ3N0ZXBwZXJTdGVwIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVDb25maWcoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVTZWFyY2goKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlU2VhcmNoIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVBbGFybXNTZWFyY2goKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlQWxhcm1zU2VhcmNoIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZWFkKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVJlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlc2V0KCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVJlc2V0IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZSgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVXcml0ZSBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlRGVsYXkoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlRGVsYXkgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJhc3BpLCAnaXNSYXNwYmVycnlQaScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6ICgpID0+IHtcbiAgICAvLyBEZXRlcm1pbmluZyBpZiBhIHN5c3RlbSBpcyBhIFJhc3BiZXJyeSBQaSBpc24ndCBwb3NzaWJsZSB0aHJvdWdoXG4gICAgLy8gdGhlIG9zIG1vZHVsZSBvbiBSYXNwYmlhbiwgc28gd2UgcmVhZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbSBpbnN0ZWFkXG4gICAgdmFyIGlzUmFzcGJlcnJ5UGkgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgaXNSYXNwYmVycnlQaSA9IGZzLnJlYWRGaWxlU3luYygnL2V0Yy9vcy1yZWxlYXNlJykudG9TdHJpbmcoKS5pbmRleE9mKCdSYXNwYmlhbicpICE9PSAtMTtcbiAgICB9IGNhdGNoKGUpIHt9Ly8gU3F1YXNoIGZpbGUgbm90IGZvdW5kLCBldGMgZXJyb3JzXG4gICAgcmV0dXJuIGlzUmFzcGJlcnJ5UGk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhc3BpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
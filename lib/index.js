"use strict";
var $__8;
var $__fs__,
    $__events__,
    $__raspi__,
    $__raspi_45_board__,
    $__raspi_45_gpio__,
    $__raspi_45_pwm__;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var events = ($__events__ = require("events"), $__events__ && $__events__.__esModule && $__events__ || {default: $__events__}).default;
var init = ($__raspi__ = require("raspi"), $__raspi__ && $__raspi__.__esModule && $__raspi__ || {default: $__raspi__}).init;
var $__3 = ($__raspi_45_board__ = require("raspi-board"), $__raspi_45_board__ && $__raspi_45_board__.__esModule && $__raspi_45_board__ || {default: $__raspi_45_board__}),
    getPins = $__3.getPins,
    getPinNumber = $__3.getPinNumber;
var $__4 = ($__raspi_45_gpio__ = require("raspi-gpio"), $__raspi_45_gpio__ && $__raspi_45_gpio__.__esModule && $__raspi_45_gpio__ || {default: $__raspi_45_gpio__}),
    DigitalOutput = $__4.DigitalOutput,
    DigitalInput = $__4.DigitalInput;
var PWM = ($__raspi_45_pwm__ = require("raspi-pwm"), $__raspi_45_pwm__ && $__raspi_45_pwm__.__esModule && $__raspi_45_pwm__ || {default: $__raspi_45_pwm__}).PWM;
var INPUT_MODE = 0;
var OUTPUT_MODE = 1;
var ANALOG_MODE = 2;
var PWM_MODE = 3;
var SERVO_MODE = 4;
var UNKNOWN_MODE = 99;
var LOW = 0;
var HIGH = 1;
var LED = 'led0';
var DIGITAL_READ_UPDATE_RATE = 19;
var isReady = '__r$271828_0$__';
var pins = '__r$271828_1$__';
var instances = '__r$271828_2$__';
var analogPins = '__r$271828_3$__';
var mode = '__$271828_4$__';
var getPinInstance = '__$271828_5$__';
var Raspi = function Raspi() {
  var $__8;
  var $__6 = this;
  $traceurRuntime.superCall(this, $Raspi.prototype, "constructor", []);
  Object.defineProperties(this, ($__8 = {}, Object.defineProperty($__8, "name", {
    value: {
      enumerable: true,
      value: 'RaspberryPi-IO'
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, instances, {
    value: {
      writable: true,
      value: []
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, isReady, {
    value: {
      writable: true,
      value: false
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "isReady", {
    value: {
      enumerable: true,
      get: function() {
        return this[isReady];
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, pins, {
    value: {
      writable: true,
      value: []
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "pins", {
    value: {
      enumerable: true,
      get: function() {
        return this[pins];
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, analogPins, {
    value: {
      writable: true,
      value: []
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "analogPins", {
    value: {
      enumerable: true,
      get: function() {
        return this[analogPins];
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "MODES", {
    value: {
      enumerable: true,
      value: Object.freeze({
        INPUT: INPUT_MODE,
        OUTPUT: OUTPUT_MODE,
        ANALOG: ANALOG_MODE,
        PWM: PWM_MODE,
        SERVO: SERVO_MODE
      })
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "HIGH", {
    value: {
      enumerable: true,
      value: HIGH
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "LOW", {
    value: {
      enumerable: true,
      value: LOW
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__8, "defaultLed", {
    value: {
      enumerable: true,
      value: LED
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__8));
  init((function() {
    var pinMappings = getPins();
    $__6[pins] = [];
    for (var $__9 = Object.keys(pinMappings)[Symbol.iterator](),
        $__10; !($__10 = $__9.next()).done; ) {
      var pin = $__10.value;
      {
        var pinInfo = pinMappings[pin];
        var supportedModes = [INPUT_MODE, OUTPUT_MODE];
        if (pinInfo.peripherals.indexOf('pwm') != -1) {
          supportedModes.push(PWM_MODE, SERVO_MODE);
        }
        var instance = $__6[instances][pin] = {
          peripheral: new DigitalInput(pin),
          mode: INPUT_MODE,
          previousWrittenValue: LOW
        };
        $__6[pins][pin] = Object.create(null, {
          supportedModes: {
            enumerable: true,
            value: Object.freeze(supportedModes)
          },
          mode: {
            enumerable: true,
            get: function() {
              return instance.mode;
            }
          },
          value: {
            enumerable: true,
            get: function() {
              switch (instance.mode) {
                case INPUT_MODE:
                  return instance.peripheral.read();
                  break;
                case OUTPUT_MODE:
                  return instance.previousWrittenValue;
                  break;
              }
            },
            set: function(value) {
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
    }
    for (var i = 0; i < $__6[pins].length; i++) {
      if (!$__6[pins][i]) {
        $__6[pins][i] = Object.create(null, {
          supportedModes: {
            enumerable: true,
            value: Object.freeze([])
          },
          mode: {
            enumerable: true,
            get: function() {
              return UNKNOWN_MODE;
            }
          },
          value: {
            enumerable: true,
            get: function() {
              return 0;
            },
            set: function() {}
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
    $__6[isReady] = true;
    $__6.emit('ready');
    $__6.emit('connect');
  }));
};
var $Raspi = Raspi;
($traceurRuntime.createClass)(Raspi, ($__8 = {}, Object.defineProperty($__8, "reset", {
  value: function() {
    throw 'reset is not supported on the Raspberry Pi';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "normalize", {
  value: function(pin) {
    var normalizedPin = getPinNumber(pin);
    if (typeof normalizedPin == 'undefined') {
      throw new Error('Unknown pin "' + pin + '"');
    }
    return normalizedPin;
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, getPinInstance, {
  value: function(pin) {
    var pinInstance = this[instances][pin];
    if (!pinInstance) {
      throw new Error('Unknown pin "' + pin + '"');
    }
    return pinInstance;
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "pinMode", {
  value: function(pin, mode) {
    var pinInstance = this[getPinInstance](pin);
    if (this[pins][pin].supportedModes.indexOf(mode) == -1) {
      throw new Error('Pin "' + pin + '" does not support mode "' + mode + '"');
    }
    switch (mode) {
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
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "analogRead", {
  value: function(pin, handler) {
    throw new Error('analogRead is not supported on the Raspberry Pi');
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "analogWrite", {
  value: function(pin, value) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != PWM_MODE) {
      this.pinMode(pin, PWM_MODE);
    }
    pinInstance.peripheral.write(Math.round(value * 1000 / 255));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "digitalRead", {
  value: function(pin, handler) {
    var $__6 = this;
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != INPUT_MODE) {
      this.mode(pin, INPUT_MODE);
    }
    var interval = setInterval((function() {
      var value;
      if (pinInstance.mode == INPUT_MODE) {
        value = pinInstance.peripheral.read();
      } else {
        value = pinInstance.previousWrittenValue;
      }
      handler && handler(value);
      $__6.emit('digital-read-' + pin, value);
    }), DIGITAL_READ_UPDATE_RATE);
    pinInstance.peripheral.on('destroyed', (function() {
      clearInterval(interval);
    }));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "digitalWrite", {
  value: function(pin, value) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != OUTPUT_MODE) {
      this.pinMode(pin, OUTPUT_MODE);
    }
    if (value != pinInstance.previousWrittenValue) {
      pinInstance.peripheral.write(value ? HIGH : LOW);
      pinInstance.previousWrittenValue = value;
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "servoWrite", {
  value: function(pin, value) {
    var pinInstance = this[getPinInstance](pin);
    if (pinInstance.mode != SERVO_MODE) {
      this.pinMode(pin, SERVO_MODE);
    }
    pinInstance.peripheral.write(48 + Math.round(value * 48 / 180));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryCapabilities", {
  value: function(cb) {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryAnalogMapping", {
  value: function(cb) {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryPinState", {
  value: function(pin, cb) {
    if (this.isReady) {
      process.nextTick(cb);
    } else {
      this.on('ready', cb);
    }
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendI2CConfig", {
  value: function() {
    throw 'sendI2CConfig is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendI2CWriteRequest", {
  value: function() {
    throw 'sendI2CWriteRequest is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendI2CReadRequest", {
  value: function() {
    throw 'sendI2CReadRequest is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "setSamplingInterval", {
  value: function() {
    throw 'setSamplingInterval is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "reportAnalogPin", {
  value: function() {
    throw 'reportAnalogPin is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "reportDigitalPin", {
  value: function() {
    throw 'reportDigitalPin is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "pulseIn", {
  value: function() {
    throw 'pulseIn is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "stepperConfig", {
  value: function() {
    throw 'stepperConfig is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "stepperStep", {
  value: function() {
    throw 'stepperStep is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireConfig", {
  value: function() {
    throw 'sendOneWireConfig is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireSearch", {
  value: function() {
    throw 'sendOneWireSearch is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireAlarmsSearch", {
  value: function() {
    throw 'sendOneWireAlarmsSearch is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireRead", {
  value: function() {
    throw 'sendOneWireRead is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireReset", {
  value: function() {
    throw 'sendOneWireReset is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireWrite", {
  value: function() {
    throw 'sendOneWireWrite is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireDelay", {
  value: function() {
    throw 'sendOneWireDelay is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "sendOneWireWriteAndRead", {
  value: function() {
    throw 'sendOneWireWriteAndRead is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), $__8), {}, events.EventEmitter);
Object.defineProperty(Raspi, 'isRaspberryPi', {
  enumerable: true,
  value: (function() {
    var isRaspberryPi = false;
    try {
      isRaspberryPi = fs.readFileSync('/etc/os-release').toString().indexOf('Raspbian') !== -1;
    } catch (e) {}
    return isRaspberryPi;
  })
});
module.exports = Raspi;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzYiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXlCQTs7Ozs7Ozs7RUFBTyxHQUFDLEVDekJSLEVBQUMsU0FBb0IsQ0FBQSxPQUFNLEFBQUMsTUFBa0IsQ0FDdEMsQ0FBQSxVQUFxQixtQkFBMkIsQ0FBQSxVQUFxQixHQUFLLEVBQUMsT0FBTSxTQUFtQixDQUQ5RCxBQUMrRCxDQUFDO0VEeUJ2RyxPQUFLLEVDMUJaLEVBQUMsYUFBb0IsQ0FBQSxPQUFNLEFBQUMsVUFBa0IsQ0FDdEMsQ0FBQSxjQUFxQix1QkFBMkIsQ0FBQSxjQUFxQixHQUFLLEVBQUMsT0FBTSxhQUFtQixDQUQ5RCxBQUMrRCxDQUFDO0VEMEJyRyxLQUFHLEVDM0JaLEVBQUMsWUFBb0IsQ0FBQSxPQUFNLEFBQUMsU0FBa0IsQ0FDdEMsQ0FBQSxhQUFxQixzQkFBMkIsQ0FBQSxhQUFxQixHQUFLLEVBQUMsT0FBTSxZQUFtQixDQUQ5RCxBQUMrRCxDQUFDO1NBRDlHLEVBQUMscUJBQW9CLENBQUEsT0FBTSxBQUFDLGVBQWtCLENBQ3RDLENBQUEsc0JBQXFCLCtCQUEyQixDQUFBLHNCQUFxQixHQUFLLEVBQUMsT0FBTSxxQkFBbUIsQ0FEOUQsQUFDK0QsQ0FBQztBRDJCckcsVUFBTTtBQUFHLGVBQVc7U0M1QjdCLEVBQUMsb0JBQW9CLENBQUEsT0FBTSxBQUFDLGNBQWtCLENBQ3RDLENBQUEscUJBQXFCLDhCQUEyQixDQUFBLHFCQUFxQixHQUFLLEVBQUMsT0FBTSxvQkFB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VmtCLENBQUEsTUFBSyxhQUFhLENNeERrQjtBTndaeEQsS0FBSyxlQUFlLEFBQUMsQ0FBQyxLQUFJLENBQUcsZ0JBQWMsQ0FBRztBQUM1QyxXQUFTLENBQUcsS0FBRztBQUNmLE1BQUksR0FBRyxTQUFBLEFBQUMsQ0FBSztBQUdYLEFBQUksTUFBQSxDQUFBLGFBQVksRUFBSSxNQUFJLENBQUM7QUFDekIsTUFBSTtBQUNGLGtCQUFZLEVBQUksQ0FBQSxFQUFDLGFBQWEsQUFBQyxDQUFDLGlCQUFnQixDQUFDLFNBQVMsQUFBQyxFQUFDLFFBQVEsQUFBQyxDQUFDLFVBQVMsQ0FBQyxDQUFBLEdBQU0sRUFBQyxDQUFBLENBQUM7SUFDMUYsQ0FBRSxPQUFNLENBQUEsQ0FBRyxHQUFDO0FBQUEsQUFDWixTQUFPLGNBQVksQ0FBQztFQUN0QixDQUFBO0FBQ0YsQ0FBQyxDQUFDO0FBRUYsS0FBSyxRQUFRLEVBQUksTUFBSSxDQUFDO0FBQUEiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IChjKSAyMDE0IEJyeWFuIEh1Z2hlcyA8YnJ5YW5AdGhlb3JldGljYWxpZGVhdGlvbnMuY29tPlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxub2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb25cbmZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXRcbnJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLFxuY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZVxuU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmdcbmNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVNcbk9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG5OT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVFxuSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksXG5XSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkdcbkZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1Jcbk9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAncmFzcGknO1xuaW1wb3J0IHsgZ2V0UGlucywgZ2V0UGluTnVtYmVyIH0gZnJvbSAncmFzcGktYm9hcmQnO1xuaW1wb3J0IHsgRGlnaXRhbE91dHB1dCwgRGlnaXRhbElucHV0IH0gZnJvbSAncmFzcGktZ3Bpbyc7XG5pbXBvcnQgeyBQV00gfSBmcm9tICdyYXNwaS1wd20nO1xuXG4vLyBDb25zdGFudHNcbnZhciBJTlBVVF9NT0RFID0gMDtcbnZhciBPVVRQVVRfTU9ERSA9IDE7XG52YXIgQU5BTE9HX01PREUgPSAyO1xudmFyIFBXTV9NT0RFID0gMztcbnZhciBTRVJWT19NT0RFID0gNDtcbnZhciBVTktOT1dOX01PREUgPSA5OTtcblxudmFyIExPVyA9IDA7XG52YXIgSElHSCA9IDE7XG5cbnZhciBMRUQgPSAnbGVkMCc7XG5cbi8vIFNldHRpbmdzXG5cbnZhciBESUdJVEFMX1JFQURfVVBEQVRFX1JBVEUgPSAxOTtcblxuLy8gSGFja3kgYnV0IGZhc3QgZW11bGF0aW9uIG9mIHN5bWJvbHMsIGVsaW1pbmF0aW5nIHRoZSBuZWVkIGZvciAkdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eSBjYWxsc1xudmFyIGlzUmVhZHkgPSAnX19yJDI3MTgyOF8wJF9fJztcbnZhciBwaW5zID0gJ19fciQyNzE4MjhfMSRfXyc7XG52YXIgaW5zdGFuY2VzID0gJ19fciQyNzE4MjhfMiRfXyc7XG52YXIgYW5hbG9nUGlucyA9ICdfX3IkMjcxODI4XzMkX18nO1xudmFyIG1vZGUgPSAnX18kMjcxODI4XzQkX18nO1xudmFyIGdldFBpbkluc3RhbmNlID0gJ19fJDI3MTgyOF81JF9fJztcblxuY2xhc3MgUmFzcGkgZXh0ZW5kcyBldmVudHMuRXZlbnRFbWl0dGVyIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgbmFtZToge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogJ1Jhc3BiZXJyeVBpLUlPJ1xuICAgICAgfSxcblxuICAgICAgW2luc3RhbmNlc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcblxuICAgICAgW2lzUmVhZHldOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBpc1JlYWR5OiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1tpc1JlYWR5XTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW3BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBwaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1twaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgW2FuYWxvZ1BpbnNdOiB7XG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogW11cbiAgICAgIH0sXG4gICAgICBhbmFsb2dQaW5zOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1thbmFsb2dQaW5zXTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgTU9ERVM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgIElOUFVUOiBJTlBVVF9NT0RFLFxuICAgICAgICAgIE9VVFBVVDogT1VUUFVUX01PREUsXG4gICAgICAgICAgQU5BTE9HOiBBTkFMT0dfTU9ERSxcbiAgICAgICAgICBQV006IFBXTV9NT0RFLFxuICAgICAgICAgIFNFUlZPOiBTRVJWT19NT0RFXG4gICAgICAgIH0pXG4gICAgICB9LFxuXG4gICAgICBISUdIOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBISUdIXG4gICAgICB9LFxuICAgICAgTE9XOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBMT1dcbiAgICAgIH0sXG5cbiAgICAgIGRlZmF1bHRMZWQ6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExFRFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaW5pdCgoKSA9PiB7XG4gICAgICB2YXIgcGluTWFwcGluZ3MgPSBnZXRQaW5zKCk7XG4gICAgICB0aGlzW3BpbnNdID0gW107XG4gICAgICBmb3IgKHZhciBwaW4gb2YgT2JqZWN0LmtleXMocGluTWFwcGluZ3MpKSB7XG4gICAgICAgIHZhciBwaW5JbmZvID0gcGluTWFwcGluZ3NbcGluXTtcbiAgICAgICAgdmFyIHN1cHBvcnRlZE1vZGVzID0gWyBJTlBVVF9NT0RFLCBPVVRQVVRfTU9ERSBdO1xuICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdwd20nKSAhPSAtMSkge1xuICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goUFdNX01PREUsIFNFUlZPX01PREUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dID0ge1xuICAgICAgICAgIHBlcmlwaGVyYWw6IG5ldyBEaWdpdGFsSW5wdXQocGluKSxcbiAgICAgICAgICBtb2RlOiBJTlBVVF9NT0RFLFxuICAgICAgICAgIHByZXZpb3VzV3JpdHRlblZhbHVlOiBMT1dcbiAgICAgICAgfTtcbiAgICAgICAgdGhpc1twaW5zXVtwaW5dID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XG4gICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShzdXBwb3J0ZWRNb2RlcylcbiAgICAgICAgICB9LFxuICAgICAgICAgIG1vZGU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5tb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHN3aXRjaChpbnN0YW5jZS5tb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBJTlBVVF9NT0RFOlxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLnBlcmlwaGVyYWwucmVhZCgpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBPVVRQVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5tb2RlID09IE9VVFBVVF9NT0RFKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlcG9ydDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IDEyN1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpbGwgaW4gdGhlIGhvbGVzXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXNbcGluc10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzW3BpbnNdW2ldKSB7XG4gICAgICAgICAgdGhpc1twaW5zXVtpXSA9IE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgICAgc3VwcG9ydGVkTW9kZXM6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoW10pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kZToge1xuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVOS05PV05fTU9ERTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0KCkge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmFsdWU6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmFsb2dDaGFubmVsOiB7XG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzW2lzUmVhZHldID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW1pdCgncmVhZHknKTtcbiAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhyb3cgJ3Jlc2V0IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaSc7XG4gIH1cblxuICBub3JtYWxpemUocGluKSB7XG4gICAgdmFyIG5vcm1hbGl6ZWRQaW4gPSBnZXRQaW5OdW1iZXIocGluKTtcbiAgICBpZiAodHlwZW9mIG5vcm1hbGl6ZWRQaW4gPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwaW4gXCInICsgcGluICsgJ1wiJyk7XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVkUGluO1xuICB9XG5cbiAgW2dldFBpbkluc3RhbmNlXShwaW4pIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXTtcbiAgICBpZiAoIXBpbkluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcGluIFwiJyArIHBpbiArICdcIicpO1xuICAgIH1cbiAgICByZXR1cm4gcGluSW5zdGFuY2U7XG4gIH1cblxuICBwaW5Nb2RlKHBpbiwgbW9kZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHRoaXNbcGluc11bcGluXS5zdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKG1vZGUpID09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BpbiBcIicgKyBwaW4gKyAnXCIgZG9lcyBub3Qgc3VwcG9ydCBtb2RlIFwiJyArIG1vZGUgKyAnXCInKTtcbiAgICB9XG4gICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsSW5wdXQocGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxPdXRwdXQocGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFBXTV9NT0RFOlxuICAgICAgY2FzZSBTRVJWT19NT0RFOlxuICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFBXTShwaW4pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcGluSW5zdGFuY2UubW9kZSA9IG1vZGU7XG4gIH1cblxuICBhbmFsb2dSZWFkKHBpbiwgaGFuZGxlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYW5hbG9nUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIGFuYWxvZ1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFBXTV9NT0RFKSB7XG4gICAgICB0aGlzLnBpbk1vZGUocGluLCBQV01fTU9ERSk7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoTWF0aC5yb3VuZCh2YWx1ZSAqIDEwMDAgLyAyNTUpKTtcbiAgfVxuXG4gIGRpZ2l0YWxSZWFkKHBpbiwgaGFuZGxlcikge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gSU5QVVRfTU9ERSkge1xuICAgICAgdGhpcy5tb2RlKHBpbiwgSU5QVVRfTU9ERSk7XG4gICAgfVxuICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHZhciB2YWx1ZTtcbiAgICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlID09IElOUFVUX01PREUpIHtcbiAgICAgICAgdmFsdWUgPSBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICB9XG4gICAgICBoYW5kbGVyICYmIGhhbmRsZXIodmFsdWUpO1xuICAgICAgdGhpcy5lbWl0KCdkaWdpdGFsLXJlYWQtJyArIHBpbiwgdmFsdWUpO1xuICAgIH0sIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSk7XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC5vbignZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICBkaWdpdGFsV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gT1VUUFVUX01PREUpIHtcbiAgICAgIHRoaXMucGluTW9kZShwaW4sIE9VVFBVVF9NT0RFKTtcbiAgICB9XG4gICAgaWYgKHZhbHVlICE9IHBpbkluc3RhbmNlLnByZXZpb3VzV3JpdHRlblZhbHVlKSB7XG4gICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKHZhbHVlID8gSElHSCA6IExPVyk7XG4gICAgICBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHNlcnZvV3JpdGUocGluLCB2YWx1ZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHBpbkluc3RhbmNlLm1vZGUgIT0gU0VSVk9fTU9ERSkge1xuICAgICAgdGhpcy5waW5Nb2RlKHBpbiwgU0VSVk9fTU9ERSk7XG4gICAgfVxuICAgIHBpbkluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUoNDggKyBNYXRoLnJvdW5kKHZhbHVlICogNDgvIDE4MCkpO1xuICB9XG5cbiAgcXVlcnlDYXBhYmlsaXRpZXMoY2IpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbigncmVhZHknLCBjYik7XG4gICAgfVxuICB9XG5cbiAgcXVlcnlBbmFsb2dNYXBwaW5nKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub24oJ3JlYWR5JywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIHF1ZXJ5UGluU3RhdGUocGluLCBjYikge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uKCdyZWFkeScsIGNiKTtcbiAgICB9XG4gIH1cblxuICBzZW5kSTJDQ29uZmlnKCkge1xuICAgIHRocm93ICdzZW5kSTJDQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZEkyQ1dyaXRlUmVxdWVzdCgpIHtcbiAgICB0aHJvdyAnc2VuZEkyQ1dyaXRlUmVxdWVzdCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRJMkNSZWFkUmVxdWVzdCgpIHtcbiAgICB0aHJvdyAnc2VuZEkyQ1JlYWRSZXF1ZXN0IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2V0U2FtcGxpbmdJbnRlcnZhbCgpIHtcbiAgICB0aHJvdyAnc2V0U2FtcGxpbmdJbnRlcnZhbCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyAncmVwb3J0QW5hbG9nUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgcmVwb3J0RGlnaXRhbFBpbigpIHtcbiAgICB0aHJvdyAncmVwb3J0RGlnaXRhbFBpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHB1bHNlSW4oKSB7XG4gICAgdGhyb3cgJ3B1bHNlSW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzdGVwcGVyQ29uZmlnKCkge1xuICAgIHRocm93ICdzdGVwcGVyQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc3RlcHBlclN0ZXAoKSB7XG4gICAgdGhyb3cgJ3N0ZXBwZXJTdGVwIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVDb25maWcoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVTZWFyY2goKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlU2VhcmNoIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVBbGFybXNTZWFyY2goKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlQWxhcm1zU2VhcmNoIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZWFkKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVJlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlc2V0KCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVJlc2V0IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZSgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVXcml0ZSBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlRGVsYXkoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlRGVsYXkgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJhc3BpLCAnaXNSYXNwYmVycnlQaScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6ICgpID0+IHtcbiAgICAvLyBEZXRlcm1pbmluZyBpZiBhIHN5c3RlbSBpcyBhIFJhc3BiZXJyeSBQaSBpc24ndCBwb3NzaWJsZSB0aHJvdWdoXG4gICAgLy8gdGhlIG9zIG1vZHVsZSBvbiBSYXNwYmlhbiwgc28gd2UgcmVhZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbSBpbnN0ZWFkXG4gICAgdmFyIGlzUmFzcGJlcnJ5UGkgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgaXNSYXNwYmVycnlQaSA9IGZzLnJlYWRGaWxlU3luYygnL2V0Yy9vcy1yZWxlYXNlJykudG9TdHJpbmcoKS5pbmRleE9mKCdSYXNwYmlhbicpICE9PSAtMTtcbiAgICB9IGNhdGNoKGUpIHt9Ly8gU3F1YXNoIGZpbGUgbm90IGZvdW5kLCBldGMgZXJyb3JzXG4gICAgcmV0dXJuIGlzUmFzcGJlcnJ5UGk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhc3BpOyIsIigkX19wbGFjZWhvbGRlcl9fMCA9IHJlcXVpcmUoJF9fcGxhY2Vob2xkZXJfXzEpLCBcbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgJiYgJF9fcGxhY2Vob2xkZXJfXzMuX19lc01vZHVsZSAmJiAkX19wbGFjZWhvbGRlcl9fNCB8fCB7ZGVmYXVsdDogJF9fcGxhY2Vob2xkZXJfXzV9KSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJcbiAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPVxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICEoJF9fcGxhY2Vob2xkZXJfXzMgPSAkX19wbGFjZWhvbGRlcl9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181O1xuICAgICAgICAgICRfX3BsYWNlaG9sZGVyX182O1xuICAgICAgICB9IiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
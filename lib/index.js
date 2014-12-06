"use strict";
var $__8;
var $__fs__,
    $__events__,
    $__raspi_45_core__,
    $__raspi_45_board__,
    $__raspi_45_gpio__,
    $__raspi_45_pwm__;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var events = ($__events__ = require("events"), $__events__ && $__events__.__esModule && $__events__ || {default: $__events__}).default;
var init = ($__raspi_45_core__ = require("raspi-core"), $__raspi_45_core__ && $__raspi_45_core__.__esModule && $__raspi_45_core__ || {default: $__raspi_45_core__}).init;
var $__3 = ($__raspi_45_board__ = require("raspi-board"), $__raspi_45_board__ && $__raspi_45_board__.__esModule && $__raspi_45_board__ || {default: $__raspi_45_board__}),
    getPins = $__3.getPins,
    getPinNumber = $__3.getPinNumber;
var $__4 = ($__raspi_45_gpio__ = require("raspi-gpio"), $__raspi_45_gpio__ && $__raspi_45_gpio__.__esModule && $__raspi_45_gpio__ || {default: $__raspi_45_gpio__}),
    DigitalOutput = $__4.DigitalOutput,
    DigitalInput = $__4.DigitalInput;
var PWM = ($__raspi_45_pwm__ = require("raspi-pwm"), $__raspi_45_pwm__ && $__raspi_45_pwm__.__esModule && $__raspi_45_pwm__ || {default: $__raspi_45_pwm__}).PWM;
if (process.env.USER != 'root') {
  console.warn('WARNING: Raspi-IO usually needs to be run with root privileges to access hardware, but it doesn\'t appear to be running as root currently');
}
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
    $__6[pins] = (Object.keys(pinMappings).map((function(pin) {
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
      return Object.create(null, {
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
    })));
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
    return getPinNumber(pin);
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
      throw new Error('Cannot analogWrite to pin "' + pin + '" unless it is in PWM mode');
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
      throw new Error('Cannot digitalRead from pin "' + pin + '" unless it is in INPUT mode');
    }
    var interval = setInterval((function() {
      var value = pinInstance.peripheral.read();
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
      throw new Error('Cannot digitalWrite to pin "' + pin + '" unless it is in OUTPUT mode');
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
      throw new Error('Cannot servoWrite to pin "' + pin + '" unless it is in PWM mode');
    }
    pinInstance.peripheral.write(48 + Math.round(value * 48 / 180));
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryCapabilities", {
  value: function() {
    throw 'queryCapabilities is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryAnalogMapping", {
  value: function() {
    throw 'queryAnalogMapping is not yet implemented';
  },
  configurable: true,
  enumerable: true,
  writable: true
}), Object.defineProperty($__8, "queryPinState", {
  value: function() {
    throw 'queryPinState is not yet implemented';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMyIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF5QkE7Ozs7Ozs7O0VBQU8sR0FBQyxFQ3pCUixFQUFDLFNBQW9CLENBQUEsT0FBTSxBQUFDLE1BQWtCLENBQ3RDLENBQUEsVUFBcUIsbUJBQTJCLENBQUEsVUFBcUIsR0FBSyxFQUFDLE9BQU0sU0FBbUIsQ0FEOUQsQUFDK0QsQ0FBQztFRHlCdkcsT0FBSyxFQzFCWixFQUFDLGFBQW9CLENBQUEsT0FBTSxBQUFDLFVBQWtCLENBQ3RDLENBQUEsY0FBcUIsdUJBQTJCLENBQUEsY0FBcUIsR0FBSyxFQUFDLE9BQU0sYUFBbUIsQ0FEOUQsQUFDK0QsQ0FBQztFRDBCckcsS0FBRyxFQzNCWixFQUFDLG9CQUFvQixDQUFBLE9BQU0sQUFBQyxjQUFrQixDQUN0QyxDQUFBLHFCQUFxQiw4QkFBMkIsQ0FBQSxxQkFBcUIsR0FBSyxFQUFDLE9BQU0sb0JBQW1CLENBRDlELEFBQytELENBQUM7U0FEOUcsRUFBQyxxQkFBb0IsQ0FBQSxPQUFNLEFBQUMsZUFBa0IsQ0FDdEMsQ0FBQSxzQkFBcUIsK0JBQTJCLENBQUEsc0JBQXFCLEdBQUssRUFBQyxPQUFNLHFCQUFtQixDQUQ5RCxBQUMrRCxDQUFDO0FEMkJyRyxVQUFNO0FBQUcsZUFBVztTQzVCN0IsRUFBQyxvQkFBb0IsQ0FBQSxPQUFNLEFBQUMsY0FBa0IsQ0FDdEMsQ0FBQSxxQkFBcUIsOEJBQTJCLENBQUEscUJBQXFCLEdBQUssRUFBQyxPQUFNLG9CQUFtQixDQUQ5RCxBQUMrRCxDQUFDO0FENEJyRyxnQkFBWTtB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RTtBQUNsQixRQUFNLDJDQUF5QyxDQUFDO0VBQ2xEOzs7OztPQUVBLFVBQWlCLEFBQUMsQ0FBRTtBQUNsQixRQUFNLDJDQUF5QyxDQUFDO0VBQ2xEOzs7OztPQUVBLFVBQXVCLEFBQUMsQ0FBRTtBQUN4QixRQUFNLGlEQUErQyxDQUFDO0VBQ3hEOzs7OztPQUVBLFVBQWUsQUFBQyxDQUFFO0FBQ2hCLFFBQU0seUNBQXVDLENBQUM7RUFDaEQ7Ozs7O09BRUEsVUFBZ0IsQUFBQyxDQUFFO0FBQ2pCLFFBQU0sMENBQXdDLENBQUM7RUFDakQ7Ozs7O09BRUEsVUFBZ0IsQUFBQyxDQUFFO0FBQ2pCLFFBQU0sMENBQXdDLENBQUM7RUFDakQ7Ozs7O09BRUEsVUFBZ0IsQUFBQyxDQUFFO0FBQ2pCLFFBQU0sMENBQXdDLENBQUM7RUFDakQ7Ozs7O09BRUEsVUFBdUIsQUFBQyxDQUFFO0FBQ3hCLFFBQU0saURBQStDLENBQUM7RUFDeEQ7Ozs7YUF0U2tCLENBQUEsTUFBSyxhQUFhLENLN0RrQjtBTHNXeEQsS0FBSyxlQUFlLEFBQUMsQ0FBQyxLQUFJLENBQUcsZ0JBQWMsQ0FBRztBQUM1QyxXQUFTLENBQUcsS0FBRztBQUNmLE1BQUksR0FBRyxTQUFBLEFBQUMsQ0FBSztBQUdYLEFBQUksTUFBQSxDQUFBLGFBQVksRUFBSSxNQUFJLENBQUM7QUFDekIsTUFBSTtBQUNGLGtCQUFZLEVBQUksQ0FBQSxFQUFDLGFBQWEsQUFBQyxDQUFDLGlCQUFnQixDQUFDLFNBQVMsQUFBQyxFQUFDLFFBQVEsQUFBQyxDQUFDLFVBQVMsQ0FBQyxDQUFBLEdBQU0sRUFBQyxDQUFBLENBQUM7SUFDMUYsQ0FBRSxPQUFNLENBQUEsQ0FBRyxHQUFDO0FBQUEsQUFDWixTQUFPLGNBQVksQ0FBQztFQUN0QixDQUFBO0FBQ0YsQ0FBQyxDQUFDO0FBRUYsS0FBSyxRQUFRLEVBQUksTUFBSSxDQUFDO0FBQUEiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IChjKSAyMDE0IEJyeWFuIEh1Z2hlcyA8YnJ5YW5AdGhlb3JldGljYWxpZGVhdGlvbnMuY29tPlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxub2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb25cbmZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXRcbnJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLFxuY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZVxuU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmdcbmNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVNcbk9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG5OT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVFxuSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksXG5XSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkdcbkZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1Jcbk9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBpbml0IH0gZnJvbSAncmFzcGktY29yZSc7XG5pbXBvcnQgeyBnZXRQaW5zLCBnZXRQaW5OdW1iZXIgfSBmcm9tICdyYXNwaS1ib2FyZCc7XG5pbXBvcnQgeyBEaWdpdGFsT3V0cHV0LCBEaWdpdGFsSW5wdXQgfSBmcm9tICdyYXNwaS1ncGlvJztcbmltcG9ydCB7IFBXTSB9IGZyb20gJ3Jhc3BpLXB3bSc7XG5cbi8vIENoZWNrIGZvciByb290IGFjY2Vzc1xuaWYgKHByb2Nlc3MuZW52LlVTRVIgIT0gJ3Jvb3QnKSB7XG4gIGNvbnNvbGUud2FybignV0FSTklORzogUmFzcGktSU8gdXN1YWxseSBuZWVkcyB0byBiZSBydW4gd2l0aCByb290IHByaXZpbGVnZXMgdG8gYWNjZXNzIGhhcmR3YXJlLCBidXQgaXQgZG9lc25cXCd0IGFwcGVhciB0byBiZSBydW5uaW5nIGFzIHJvb3QgY3VycmVudGx5Jyk7XG59XG5cbi8vIENvbnN0YW50c1xudmFyIElOUFVUX01PREUgPSAwO1xudmFyIE9VVFBVVF9NT0RFID0gMTtcbnZhciBBTkFMT0dfTU9ERSA9IDI7XG52YXIgUFdNX01PREUgPSAzO1xudmFyIFNFUlZPX01PREUgPSA0O1xudmFyIFVOS05PV05fTU9ERSA9IDk5O1xuXG52YXIgTE9XID0gMDtcbnZhciBISUdIID0gMTtcblxudmFyIExFRCA9ICdsZWQwJztcblxuLy8gU2V0dGluZ3NcblxudmFyIERJR0lUQUxfUkVBRF9VUERBVEVfUkFURSA9IDE5O1xuXG4vLyBIYWNreSBidXQgZmFzdCBlbXVsYXRpb24gb2Ygc3ltYm9scywgZWxpbWluYXRpbmcgdGhlIG5lZWQgZm9yICR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5IGNhbGxzXG52YXIgaXNSZWFkeSA9ICdfX3IkMjcxODI4XzAkX18nO1xudmFyIHBpbnMgPSAnX19yJDI3MTgyOF8xJF9fJztcbnZhciBpbnN0YW5jZXMgPSAnX19yJDI3MTgyOF8yJF9fJztcbnZhciBhbmFsb2dQaW5zID0gJ19fciQyNzE4MjhfMyRfXyc7XG52YXIgbW9kZSA9ICdfXyQyNzE4MjhfNCRfXyc7XG52YXIgZ2V0UGluSW5zdGFuY2UgPSAnX18kMjcxODI4XzUkX18nO1xuXG5jbGFzcyBSYXNwaSBleHRlbmRzIGV2ZW50cy5FdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAnUmFzcGJlcnJ5UGktSU8nXG4gICAgICB9LFxuXG4gICAgICBbaW5zdGFuY2VzXToge1xuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IFtdXG4gICAgICB9LFxuXG4gICAgICBbaXNSZWFkeV06IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGlzUmVhZHk6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2lzUmVhZHldO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbcGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIHBpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW3BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBbYW5hbG9nUGluc106IHtcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBbXVxuICAgICAgfSxcbiAgICAgIGFuYWxvZ1BpbnM6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW2FuYWxvZ1BpbnNdO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBNT0RFUzoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgSU5QVVQ6IElOUFVUX01PREUsXG4gICAgICAgICAgT1VUUFVUOiBPVVRQVVRfTU9ERSxcbiAgICAgICAgICBBTkFMT0c6IEFOQUxPR19NT0RFLFxuICAgICAgICAgIFBXTTogUFdNX01PREUsXG4gICAgICAgICAgU0VSVk86IFNFUlZPX01PREVcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIEhJR0g6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEhJR0hcbiAgICAgIH0sXG4gICAgICBMT1c6IHtcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IExPV1xuICAgICAgfSxcblxuICAgICAgZGVmYXVsdExlZDoge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogTEVEXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpbml0KCgpID0+IHtcbiAgICAgIHZhciBwaW5NYXBwaW5ncyA9IGdldFBpbnMoKTtcbiAgICAgIHRoaXNbcGluc10gPSAoT2JqZWN0LmtleXMocGluTWFwcGluZ3MpLm1hcCgocGluKSA9PiB7XG4gICAgICAgIHZhciBwaW5JbmZvID0gcGluTWFwcGluZ3NbcGluXTtcbiAgICAgICAgdmFyIHN1cHBvcnRlZE1vZGVzID0gWyBJTlBVVF9NT0RFLCBPVVRQVVRfTU9ERSBdO1xuICAgICAgICBpZiAocGluSW5mby5wZXJpcGhlcmFscy5pbmRleE9mKCdwd20nKSAhPSAtMSkge1xuICAgICAgICAgIHN1cHBvcnRlZE1vZGVzLnB1c2goUFdNX01PREUsIFNFUlZPX01PREUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXNbaW5zdGFuY2VzXVtwaW5dID0ge1xuICAgICAgICAgIHBlcmlwaGVyYWw6IG5ldyBEaWdpdGFsSW5wdXQocGluKSxcbiAgICAgICAgICBtb2RlOiBJTlBVVF9NT0RFLFxuICAgICAgICAgIHByZXZpb3VzV3JpdHRlblZhbHVlOiBMT1dcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCwge1xuICAgICAgICAgIHN1cHBvcnRlZE1vZGVzOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUoc3VwcG9ydGVkTW9kZXMpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtb2RlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UubW9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICBzd2l0Y2goaW5zdGFuY2UubW9kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgT1VUUFVUX01PREU6XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWU7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UubW9kZSA9PSBPVVRQVVRfTU9ERSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnBlcmlwaGVyYWwud3JpdGUodmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXBvcnQ6IHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYW5hbG9nQ2hhbm5lbDoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxMjdcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSkpO1xuXG4gICAgICB0aGlzW2lzUmVhZHldID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW1pdCgncmVhZHknKTtcbiAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhyb3cgJ3Jlc2V0IGlzIG5vdCBzdXBwb3J0ZWQgb24gdGhlIFJhc3BiZXJyeSBQaSc7XG4gIH1cblxuICBub3JtYWxpemUocGluKSB7XG4gICAgcmV0dXJuIGdldFBpbk51bWJlcihwaW4pO1xuICB9XG5cbiAgW2dldFBpbkluc3RhbmNlXShwaW4pIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2luc3RhbmNlc11bcGluXTtcbiAgICBpZiAoIXBpbkluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcGluIFwiJyArIHBpbiArICdcIicpO1xuICAgIH1cbiAgICByZXR1cm4gcGluSW5zdGFuY2U7XG4gIH1cblxuICBwaW5Nb2RlKHBpbiwgbW9kZSkge1xuICAgIHZhciBwaW5JbnN0YW5jZSA9IHRoaXNbZ2V0UGluSW5zdGFuY2VdKHBpbik7XG4gICAgaWYgKHRoaXNbcGluc11bcGluXS5zdXBwb3J0ZWRNb2Rlcy5pbmRleE9mKG1vZGUpID09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BpbiBcIicgKyBwaW4gKyAnXCIgZG9lcyBub3Qgc3VwcG9ydCBtb2RlIFwiJyArIG1vZGUgKyAnXCInKTtcbiAgICB9XG4gICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgIGNhc2UgSU5QVVRfTU9ERTpcbiAgICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbCA9IG5ldyBEaWdpdGFsSW5wdXQocGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIE9VVFBVVF9NT0RFOlxuICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IERpZ2l0YWxPdXRwdXQocGluKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFBXTV9NT0RFOlxuICAgICAgY2FzZSBTRVJWT19NT0RFOlxuICAgICAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsID0gbmV3IFBXTShwaW4pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcGluSW5zdGFuY2UubW9kZSA9IG1vZGU7XG4gIH1cblxuICBhbmFsb2dSZWFkKHBpbiwgaGFuZGxlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYW5hbG9nUmVhZCBpcyBub3Qgc3VwcG9ydGVkIG9uIHRoZSBSYXNwYmVycnkgUGknKTtcbiAgfVxuXG4gIGFuYWxvZ1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFBXTV9NT0RFKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBhbmFsb2dXcml0ZSB0byBwaW4gXCInICsgcGluICsgJ1wiIHVubGVzcyBpdCBpcyBpbiBQV00gbW9kZScpO1xuICAgIH1cbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLndyaXRlKE1hdGgucm91bmQodmFsdWUgKiAxMDAwIC8gMjU1KSk7XG4gIH1cblxuICBkaWdpdGFsUmVhZChwaW4sIGhhbmRsZXIpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IElOUFVUX01PREUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGRpZ2l0YWxSZWFkIGZyb20gcGluIFwiJyArIHBpbiArICdcIiB1bmxlc3MgaXQgaXMgaW4gSU5QVVQgbW9kZScpO1xuICAgIH1cbiAgICB2YXIgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICB2YXIgdmFsdWUgPSBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLnJlYWQoKTtcbiAgICAgIGhhbmRsZXIgJiYgaGFuZGxlcih2YWx1ZSk7XG4gICAgICB0aGlzLmVtaXQoJ2RpZ2l0YWwtcmVhZC0nICsgcGluLCB2YWx1ZSk7XG4gICAgfSwgRElHSVRBTF9SRUFEX1VQREFURV9SQVRFKTtcbiAgICBwaW5JbnN0YW5jZS5wZXJpcGhlcmFsLm9uKCdkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2l0YWxXcml0ZShwaW4sIHZhbHVlKSB7XG4gICAgdmFyIHBpbkluc3RhbmNlID0gdGhpc1tnZXRQaW5JbnN0YW5jZV0ocGluKTtcbiAgICBpZiAocGluSW5zdGFuY2UubW9kZSAhPSBPVVRQVVRfTU9ERSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZGlnaXRhbFdyaXRlIHRvIHBpbiBcIicgKyBwaW4gKyAnXCIgdW5sZXNzIGl0IGlzIGluIE9VVFBVVCBtb2RlJyk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAhPSBwaW5JbnN0YW5jZS5wcmV2aW91c1dyaXR0ZW5WYWx1ZSkge1xuICAgICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSh2YWx1ZSA/IEhJR0ggOiBMT1cpO1xuICAgICAgcGluSW5zdGFuY2UucHJldmlvdXNXcml0dGVuVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBzZXJ2b1dyaXRlKHBpbiwgdmFsdWUpIHtcbiAgICB2YXIgcGluSW5zdGFuY2UgPSB0aGlzW2dldFBpbkluc3RhbmNlXShwaW4pO1xuICAgIGlmIChwaW5JbnN0YW5jZS5tb2RlICE9IFNFUlZPX01PREUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHNlcnZvV3JpdGUgdG8gcGluIFwiJyArIHBpbiArICdcIiB1bmxlc3MgaXQgaXMgaW4gUFdNIG1vZGUnKTtcbiAgICB9XG4gICAgcGluSW5zdGFuY2UucGVyaXBoZXJhbC53cml0ZSg0OCArIE1hdGgucm91bmQodmFsdWUgKiA0OC8gMTgwKSk7XG4gIH1cblxuICBxdWVyeUNhcGFiaWxpdGllcygpIHtcbiAgICB0aHJvdyAncXVlcnlDYXBhYmlsaXRpZXMgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBxdWVyeUFuYWxvZ01hcHBpbmcoKSB7XG4gICAgdGhyb3cgJ3F1ZXJ5QW5hbG9nTWFwcGluZyBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHF1ZXJ5UGluU3RhdGUoKSB7XG4gICAgdGhyb3cgJ3F1ZXJ5UGluU3RhdGUgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kSTJDQ29uZmlnKCkge1xuICAgIHRocm93ICdzZW5kSTJDQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZEkyQ1dyaXRlUmVxdWVzdCgpIHtcbiAgICB0aHJvdyAnc2VuZEkyQ1dyaXRlUmVxdWVzdCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRJMkNSZWFkUmVxdWVzdCgpIHtcbiAgICB0aHJvdyAnc2VuZEkyQ1JlYWRSZXF1ZXN0IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2V0U2FtcGxpbmdJbnRlcnZhbCgpIHtcbiAgICB0aHJvdyAnc2V0U2FtcGxpbmdJbnRlcnZhbCBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHJlcG9ydEFuYWxvZ1BpbigpIHtcbiAgICB0aHJvdyAncmVwb3J0QW5hbG9nUGluIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgcmVwb3J0RGlnaXRhbFBpbigpIHtcbiAgICB0aHJvdyAncmVwb3J0RGlnaXRhbFBpbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHB1bHNlSW4oKSB7XG4gICAgdGhyb3cgJ3B1bHNlSW4gaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzdGVwcGVyQ29uZmlnKCkge1xuICAgIHRocm93ICdzdGVwcGVyQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc3RlcHBlclN0ZXAoKSB7XG4gICAgdGhyb3cgJ3N0ZXBwZXJTdGVwIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVDb25maWcoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlQ29uZmlnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVTZWFyY2goKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlU2VhcmNoIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVBbGFybXNTZWFyY2goKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlQWxhcm1zU2VhcmNoIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVSZWFkKCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVJlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVJlc2V0KCkge1xuICAgIHRocm93ICdzZW5kT25lV2lyZVJlc2V0IGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQnO1xuICB9XG5cbiAgc2VuZE9uZVdpcmVXcml0ZSgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVXcml0ZSBpcyBub3QgeWV0IGltcGxlbWVudGVkJztcbiAgfVxuXG4gIHNlbmRPbmVXaXJlRGVsYXkoKSB7XG4gICAgdGhyb3cgJ3NlbmRPbmVXaXJlRGVsYXkgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cblxuICBzZW5kT25lV2lyZVdyaXRlQW5kUmVhZCgpIHtcbiAgICB0aHJvdyAnc2VuZE9uZVdpcmVXcml0ZUFuZFJlYWQgaXMgbm90IHlldCBpbXBsZW1lbnRlZCc7XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFJhc3BpLCAnaXNSYXNwYmVycnlQaScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6ICgpID0+IHtcbiAgICAvLyBEZXRlcm1pbmluZyBpZiBhIHN5c3RlbSBpcyBhIFJhc3BiZXJyeSBQaSBpc24ndCBwb3NzaWJsZSB0aHJvdWdoXG4gICAgLy8gdGhlIG9zIG1vZHVsZSBvbiBSYXNwYmlhbiwgc28gd2UgcmVhZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbSBpbnN0ZWFkXG4gICAgdmFyIGlzUmFzcGJlcnJ5UGkgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgaXNSYXNwYmVycnlQaSA9IGZzLnJlYWRGaWxlU3luYygnL2V0Yy9vcy1yZWxlYXNlJykudG9TdHJpbmcoKS5pbmRleE9mKCdSYXNwYmlhbicpICE9PSAtMTtcbiAgICB9IGNhdGNoKGUpIHt9Ly8gU3F1YXNoIGZpbGUgbm90IGZvdW5kLCBldGMgZXJyb3JzXG4gICAgcmV0dXJuIGlzUmFzcGJlcnJ5UGk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhc3BpOyIsIigkX19wbGFjZWhvbGRlcl9fMCA9IHJlcXVpcmUoJF9fcGxhY2Vob2xkZXJfXzEpLCBcbiAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgJiYgJF9fcGxhY2Vob2xkZXJfXzMuX19lc01vZHVsZSAmJiAkX19wbGFjZWhvbGRlcl9fNCB8fCB7ZGVmYXVsdDogJF9fcGxhY2Vob2xkZXJfXzV9KSIsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=